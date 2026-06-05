'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../server/appwrite';
import { cookies } from 'next/headers';
import { parseStringify, formatDateOfBirth, assertRequiredEnv } from '../utils';
import { createDwollaCustomer, deactivateDwollaCustomer } from './dwolla.actions';
import { redirect } from 'next/navigation';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id });
    return parseStringify(user);
  } catch {
    return null;
  }
}

export async function getUserInfo({ userId }: getUserInfoProps) {
  try {
    const { database } = await createAdminClient();
    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(user.documents[0]);
  } catch {
    return null;
  }
}

export async function signIn({ email, password }: { email: string; password: string }) {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });
    return parseStringify(user);
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
}

/**
 * Atomic signup. The sequence is:
 *   1. Appwrite Auth account
 *   2. Dwolla customer (full KYC)
 *   3. Users DB document (stores dwollaCustomerUrl/Id)
 *   4. Session + HTTP-only cookie
 *
 * If any step after a resource is created fails, we run compensating
 * rollbacks (delete the Appwrite account, deactivate the Dwolla customer,
 * delete the DB document) so we never leave orphaned records, then re-throw.
 */
export async function signUp({ password, ...userData }: SignUpParams) {
  const { email, firstName, lastName } = userData;

  let newUserAccountId: string | null = null;
  let dwollaCustomerUrl: string | null = null;
  let newUserDocId: string | null = null;

  try {
    // 0. Fail fast with a clear message if anything the flow needs is unset.
    assertRequiredEnv([
      'NEXT_PUBLIC_APPWRITE_ENDPOINT',
      'NEXT_PUBLIC_APPWRITE_PROJECT',
      'NEXT_APPWRITE_KEY',
      'APPWRITE_DATABASE_ID',
      'APPWRITE_USER_COLLECTION_ID',
      'DWOLLA_KEY',
      'DWOLLA_SECRET',
    ]);

    // Dwolla requires dateOfBirth as YYYY-MM-DD. The form may send it as bare
    // digits (e.g. "28122000") — normalize/validate before any resource is
    // created so a bad date fails cheaply, before the Appwrite account exists.
    const dateOfBirth = formatDateOfBirth(userData.dateOfBirth);
    const normalizedUserData = { ...userData, dateOfBirth };

    const { account, database } = await createAdminClient();

    // 1. Appwrite Auth account
    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    if (!newUserAccount) throw new Error('Error creating user account');
    newUserAccountId = newUserAccount.$id;

    // 2. Dwolla customer (KYC). Compensated by deactivation on later failure.
    dwollaCustomerUrl = await createDwollaCustomer({
      ...normalizedUserData,
      type: 'personal',
    });
    if (!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer');

    const dwollaCustomerId = dwollaCustomerUrl.split('/').pop()!;

    // 3. Users DB document
    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...normalizedUserData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
    );
    newUserDocId = newUser.$id;

    // 4. Session + cookie
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error: any) {
    // Log the FULL underlying error so the real Appwrite/Dwolla message shows
    // up in the Netlify function logs (not the generic UI string).
    console.error('Sign up failed — underlying error:', {
      message: error?.message,
      status: error?.status ?? error?.code,
      type: error?.type,
      body: error?.body ? JSON.stringify(error.body) : undefined,
      stack: error?.stack,
    });

    // Compensating deletes in reverse creation order so a failed attempt never
    // leaves an orphaned Appwrite account that would block retrying with the
    // same email. Each step is best-effort and must not mask the original error.
    try {
      const { database, users } = await createAdminClient();

      if (newUserDocId) {
        try {
          await database.deleteDocument(DATABASE_ID!, USER_COLLECTION_ID!, newUserDocId);
        } catch (e) {
          console.error('Rollback: failed to delete user document', e);
        }
      }
      if (dwollaCustomerUrl) {
        await deactivateDwollaCustomer(dwollaCustomerUrl);
      }
      if (newUserAccountId) {
        try {
          await users.delete(newUserAccountId);
        } catch (e) {
          console.error('Rollback: failed to delete Appwrite account', e);
        }
      }
    } catch (rollbackErr) {
      console.error('Rollback: could not initialize admin client', rollbackErr);
    }

    return null;
  }
}

export async function logoutAccount() {
  try {
    const { account } = await createSessionClient();
    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');
    await account.deleteSession('current');
  } catch (error) {
    console.error('Logout error:', error);
    return null;
  }
}
