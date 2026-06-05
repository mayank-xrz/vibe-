'use server';

import { Client, Account, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '';
const API_KEY = process.env.NEXT_APPWRITE_KEY || '';

export async function createSessionClient() {
  if (!PROJECT) throw new Error('Appwrite project not configured');

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT);

  const cookieStore = await cookies();
  const session = cookieStore.get('appwrite-session');
  if (!session?.value) {
    throw new Error('No session');
  }

  client.setSession(session.value);

  return {
    get account() { return new Account(client); },
    get database() { return new Databases(client); },
    get users() { return new Users(client); },
  };
}

export async function createAdminClient() {
  if (!PROJECT || !API_KEY) throw new Error('Appwrite not configured');

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT)
    .setKey(API_KEY);

  return {
    get account() { return new Account(client); },
    get database() { return new Databases(client); },
    get users() { return new Users(client); },
  };
}
