/**
 * Seed a single ordinary test user.
 *
 * This is NOT a master login or a backdoor. It creates a normal user that goes
 * through the EXACT same flow as a real signup in `lib/actions/user.actions.ts`
 * (Appwrite Auth account -> Dwolla customer -> Users DB document). The only
 * step it omits is setting the `appwrite-session` HTTP-only cookie, because a
 * standalone CLI has no HTTP response to attach a cookie to. The resulting user
 * logs in through the normal /sign-in page like any other account.
 *
 * Credentials come from env vars (SEED_USER_EMAIL / SEED_USER_PASSWORD) — never
 * hardcoded. The script is idempotent: if a user with that email already
 * exists, it skips creation and just prints the login.
 *
 * Run:  npm run seed
 *
 * Requires real Appwrite + Dwolla sandbox credentials in .env.local (the same
 * ones the app uses). With placeholder keys it will fail fast with a clear
 * message — that is expected.
 */

import { config } from 'dotenv';
import { Client, Users, Databases, ID, Query } from 'node-appwrite';
import { Client as DwollaClient } from 'dwolla-v2';

// Load .env.local first (app convention), then fall back to .env.
config({ path: '.env.local' });
config();

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_APPWRITE_KEY,
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
  DWOLLA_KEY,
  DWOLLA_SECRET,
  DWOLLA_ENV,
  SEED_USER_EMAIL,
  SEED_USER_PASSWORD,
} = process.env;

// Default KYC details for the seed user. Dwolla sandbox accepts these test
// values; ssn 0000 / a Beverly Hills address are standard sandbox fixtures.
const SEED_PROFILE = {
  firstName: 'Test',
  lastName: 'User',
  address1: '123 Main St',
  city: 'Beverly Hills',
  state: 'CA',
  postalCode: '90210',
  dateOfBirth: '1990-01-01',
  ssn: '1234',
};

function assertEnv() {
  const missing: string[] = [];
  if (!NEXT_PUBLIC_APPWRITE_ENDPOINT) missing.push('NEXT_PUBLIC_APPWRITE_ENDPOINT');
  if (!NEXT_PUBLIC_APPWRITE_PROJECT) missing.push('NEXT_PUBLIC_APPWRITE_PROJECT');
  if (!NEXT_APPWRITE_KEY) missing.push('NEXT_APPWRITE_KEY');
  if (!APPWRITE_DATABASE_ID) missing.push('APPWRITE_DATABASE_ID');
  if (!APPWRITE_USER_COLLECTION_ID) missing.push('APPWRITE_USER_COLLECTION_ID');
  if (!DWOLLA_KEY) missing.push('DWOLLA_KEY');
  if (!DWOLLA_SECRET) missing.push('DWOLLA_SECRET');
  if (!SEED_USER_EMAIL) missing.push('SEED_USER_EMAIL');
  if (!SEED_USER_PASSWORD) missing.push('SEED_USER_PASSWORD');

  if (missing.length) {
    console.error(
      `\n✖ Cannot seed: missing env vars:\n  - ${missing.join('\n  - ')}\n\n` +
        `Set these in .env.local (see .env.example). The Appwrite/Dwolla values\n` +
        `must be real sandbox credentials, not placeholders.\n`
    );
    process.exit(1);
  }
}

function getAdminClient() {
  const client = new Client()
    .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(NEXT_APPWRITE_KEY!);
  return { users: new Users(client), database: new Databases(client) };
}

function getDwollaClient() {
  return new DwollaClient({
    environment: DWOLLA_ENV === 'production' ? 'production' : 'sandbox',
    key: DWOLLA_KEY!,
    secret: DWOLLA_SECRET!,
  });
}

async function main() {
  assertEnv();

  const email = SEED_USER_EMAIL!;
  const password = SEED_USER_PASSWORD!;
  const { users, database } = getAdminClient();

  // --- Idempotency: skip if a user with this email already exists ---------
  const existing = await users.list([Query.equal('email', [email])]);
  if (existing.total > 0) {
    console.log(`\n✓ Seed user already exists — nothing to do.\n`);
    console.log(`  Login at /sign-in with:`);
    console.log(`    email:    ${email}`);
    console.log(`    password: ${password}\n`);
    return;
  }

  // The same sequence as lib/actions/user.actions.ts signUp, with compensating
  // rollbacks so a partial failure never leaves orphaned records.
  let newUserId: string | null = null;
  let dwollaCustomerUrl: string | null = null;

  try {
    // 1. Appwrite Auth account
    const account = await users.create(
      ID.unique(),
      email,
      undefined,
      password,
      `${SEED_PROFILE.firstName} ${SEED_PROFILE.lastName}`
    );
    newUserId = account.$id;

    // 2. Dwolla customer (full KYC)
    const dwolla = getDwollaClient();
    const res = await dwolla.post('customers', {
      ...SEED_PROFILE,
      email,
      type: 'personal',
    });
    dwollaCustomerUrl = res.headers.get('location');
    if (!dwollaCustomerUrl) throw new Error('Dwolla did not return a customer URL');
    const dwollaCustomerId = dwollaCustomerUrl.split('/').pop()!;

    // 3. Users DB document
    await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...SEED_PROFILE,
        email,
        userId: account.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      }
    );

    console.log(`\n✓ Seed user created successfully.\n`);
    console.log(`  Login at /sign-in with:`);
    console.log(`    email:    ${email}`);
    console.log(`    password: ${password}\n`);
  } catch (err) {
    console.error('\n✖ Seeding failed, rolling back partial state...', err);
    // Compensating deletes in reverse order. Dwolla customers can't be hard
    // deleted; deactivate instead.
    if (dwollaCustomerUrl) {
      try {
        await getDwollaClient().post(dwollaCustomerUrl, { status: 'deactivated' });
      } catch (e) {
        console.error('  rollback: could not deactivate Dwolla customer', e);
      }
    }
    if (newUserId) {
      try {
        await users.delete(newUserId);
      } catch (e) {
        console.error('  rollback: could not delete Appwrite account', e);
      }
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n✖ Seed script error:', err?.message ?? err);
  console.error(
    '\nIf this is an auth/connection error, check that your Appwrite and Dwolla\n' +
      'credentials in .env.local are real sandbox values (not placeholders).\n'
  );
  process.exit(1);
});
