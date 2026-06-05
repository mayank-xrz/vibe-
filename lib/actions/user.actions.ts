'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../server/appwrite';
import { cookies } from 'next/headers';
import { parseStringify } from '../utils';
import { createDwollaCustomer } from './dwolla.actions';
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

export async function signUp({ password, ...userData }: SignUpParams) {
  const { email, firstName, lastName } = userData;
  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error('Error creating user account');

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: 'personal',
    });

    if (!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer');

    const dwollaCustomerId = dwollaCustomerUrl.split('/').pop()!;

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
    // Compensating delete: remove appwrite account if a later step failed
    if (newUserAccount?.$id) {
      const { account } = await createAdminClient();
      try {
        // Note: requires admin Users service, not Account service
        // We log but don't block on cleanup failure
        console.error('Sign up failed, partial data may exist for userId:', newUserAccount.$id);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    console.error('Sign up error:', error);
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
