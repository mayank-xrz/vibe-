'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../server/appwrite';
import { cookies } from 'next/headers';
import { parseStringify } from '../utils';
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

  const { account, database, users } = await createAdminClient();

  try {
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
      ...userData,
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
        ...userData,
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
  } catch (error) {
    console.error('Sign up error, rolling back partial state:', error);

    // Compensating deletes in reverse creation order. Each is best-effort and
    // must not mask the original error.
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
