/**
 * Seed the competition demo account.
 *
 * Creates ONE real user through the EXACT same flow as a normal sign-up:
 *   1. Appwrite Auth account
 *   2. Dwolla sandbox customer (full KYC)
 *   3. Appwrite Users DB document
 *   4. Plaid sandbox bank (First Platypus Bank) via sandbox/public_token/create
 *   5. Plaid public-token exchange → Dwolla funding source → Appwrite Banks doc
 *   6. Sample Appwrite Transactions (so the dashboard looks populated)
 *
 * This is NOT a backdoor. The resulting account logs in through the normal
 * /sign-in page with DEMO_EMAIL / DEMO_PASSWORD.
 *
 * Idempotent: if the Appwrite Auth account already exists the script skips
 * steps 1-3. If the bank document already exists it skips steps 4-6.
 *
 * Credentials come from env vars — never hardcoded. Real Appwrite + Dwolla
 * + Plaid sandbox credentials must be present in .env.local.
 *
 * Usage:
 *   npm run seed:demo
 */

import { config } from 'dotenv';
import { Client, Users, Databases, ID, Query } from 'node-appwrite';
import { Client as DwollaClient } from 'dwolla-v2';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

config({ path: '.env.local' });
config();

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_APPWRITE_KEY,
  APPWRITE_DATABASE_ID: DB_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COL,
  APPWRITE_BANK_COLLECTION_ID: BANK_COL,
  APPWRITE_TRANSACTION_COLLECTION_ID: TXN_COL,
  DWOLLA_KEY,
  DWOLLA_SECRET,
  DWOLLA_ENV,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} = process.env;

// ---------- KYC profile --------------------------------------------------
// Dwolla sandbox accepts these fixture values (ssn 1234, Beverly Hills addr).
const DEMO_PROFILE = {
  firstName: 'Demo',
  lastName: 'Judge',
  address1: '123 Main St',
  city: 'Beverly Hills',
  state: 'CA',
  postalCode: '90210',
  dateOfBirth: '1990-01-01', // YYYY-MM-DD — required by Dwolla
  ssn: '1234',               // last-4 for sandbox
};

// ---------- env guard -----------------------------------------------------
function assertEnv() {
  const required: Record<string, string | undefined> = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_PROJECT,
    NEXT_APPWRITE_KEY,
    APPWRITE_DATABASE_ID: DB_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COL,
    APPWRITE_BANK_COLLECTION_ID: BANK_COL,
    APPWRITE_TRANSACTION_COLLECTION_ID: TXN_COL,
    DWOLLA_KEY,
    DWOLLA_SECRET,
    PLAID_CLIENT_ID,
    PLAID_SECRET,
    DEMO_EMAIL,
    DEMO_PASSWORD,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.error(
      `\n✖ Cannot seed: missing env vars:\n  - ${missing.join('\n  - ')}\n\n` +
        `Set these in .env.local. All Appwrite / Dwolla / Plaid values must be\n` +
        `real sandbox credentials (not placeholders).\n`
    );
    process.exit(1);
  }
}

// ---------- clients -------------------------------------------------------
function appwrite() {
  const client = new Client()
    .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(NEXT_APPWRITE_KEY!);
  return { users: new Users(client), db: new Databases(client) };
}

function dwolla() {
  return new DwollaClient({
    environment: DWOLLA_ENV === 'production' ? 'production' : 'sandbox',
    key: DWOLLA_KEY!,
    secret: DWOLLA_SECRET!,
  });
}

function plaid() {
  const cfg = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV || 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID!,
        'PLAID-SECRET': PLAID_SECRET!,
      },
    },
  });
  return new PlaidApi(cfg);
}

// ---------- helpers -------------------------------------------------------
function encryptId(id: string) {
  return Buffer.from(id).toString('base64');
}

// ---------- main ----------------------------------------------------------
async function main() {
  assertEnv();

  const email = DEMO_EMAIL!;
  const password = DEMO_PASSWORD!;
  const { users, db } = appwrite();

  // ── Step 1-3: user account (idempotent) ─────────────────────────────────
  let userId: string;
  let dwollaCustomerUrl: string;
  let dwollaCustomerId: string;

  const existing = await users.list([Query.equal('email', [email])]);

  if (existing.total > 0) {
    console.log('✓ Appwrite auth account already exists — skipping user creation.');
    userId = existing.users[0].$id;

    // Fetch the matching Users doc to get the dwolla IDs.
    const docs = await db.listDocuments(DB_ID!, USER_COL!, [
      Query.equal('userId', [userId]),
    ]);
    if (docs.total === 0) {
      console.error(
        '✖ Auth account exists but no Users document found.\n' +
          '  Delete the orphaned Appwrite auth account and re-run.'
      );
      process.exit(1);
    }
    dwollaCustomerUrl = docs.documents[0].dwollaCustomerUrl;
    dwollaCustomerId = docs.documents[0].dwollaCustomerId;
  } else {
    // 1. Appwrite auth account
    let newUserId: string | null = null;
    let newDwollaUrl: string | null = null;

    try {
      const account = await users.create(
        ID.unique(),
        email,
        undefined,
        password,
        `${DEMO_PROFILE.firstName} ${DEMO_PROFILE.lastName}`
      );
      newUserId = account.$id;
      console.log('✓ Appwrite auth account created:', newUserId);

      // 2. Dwolla customer
      const dwollaRes = await dwolla().post('customers', {
        ...DEMO_PROFILE,
        email,
        type: 'personal',
      });
      newDwollaUrl = dwollaRes.headers.get('location');
      if (!newDwollaUrl) throw new Error('Dwolla did not return a customer URL');
      const newDwollaId = newDwollaUrl.split('/').pop()!;
      console.log('✓ Dwolla customer created:', newDwollaUrl);

      // 3. Users DB document
      await db.createDocument(DB_ID!, USER_COL!, ID.unique(), {
        ...DEMO_PROFILE,
        email,
        userId: newUserId,
        dwollaCustomerId: newDwollaId,
        dwollaCustomerUrl: newDwollaUrl,
      });
      console.log('✓ Appwrite Users document created.');

      userId = newUserId;
      dwollaCustomerUrl = newDwollaUrl;
      dwollaCustomerId = newDwollaId;
    } catch (err: any) {
      console.error('\n✖ User creation failed, rolling back...', err?.message ?? err);
      // Print Dwolla validation details if present.
      const dvErrs = err?.body?._embedded?.errors;
      if (dvErrs) console.error('  Dwolla errors:', JSON.stringify(dvErrs, null, 2));

      if (newDwollaUrl) {
        try { await dwolla().post(newDwollaUrl, { status: 'deactivated' }); } catch {}
      }
      if (newUserId) {
        try { await users.delete(newUserId); } catch {}
      }
      process.exit(1);
    }
  }

  // ── Step 4-6: bank + transactions (idempotent) ───────────────────────────
  const existingBanks = await db.listDocuments(DB_ID!, BANK_COL!, [
    Query.equal('userId', [userId]),
  ]);

  if (existingBanks.total > 0) {
    console.log('✓ Bank already linked — skipping Plaid seeding.');
  } else {
    const pc = plaid();

    // 4. Create a Plaid sandbox public token for "First Platypus Bank"
    //    (institution_id: ins_109508, always available in sandbox).
    let publicToken: string;
    let itemId: string;
    let accessToken: string;
    let accountId: string;
    let accountName: string;

    try {
      const sandboxRes = await pc.sandboxPublicTokenCreate({
        institution_id: 'ins_109508',
        initial_products: [Products.Auth, Products.Transactions],
      });
      publicToken = sandboxRes.data.public_token;
      console.log('✓ Plaid sandbox public token created.');

      // 5a. Exchange public token for access token
      const exchangeRes = await pc.itemPublicTokenExchange({
        public_token: publicToken,
      });
      accessToken = exchangeRes.data.access_token;
      itemId = exchangeRes.data.item_id;

      // 5b. Get account details
      const accountsRes = await pc.accountsGet({ access_token: accessToken });
      const acct = accountsRes.data.accounts[0];
      accountId = acct.account_id;
      accountName = acct.name;
      console.log(`✓ Plaid access token exchanged. Account: ${accountName}`);

      // 5c. Create Plaid processor token for Dwolla
      const processorRes = await pc.processorTokenCreate({
        access_token: accessToken,
        account_id: accountId,
        processor: 'dwolla' as any,
      });
      const processorToken = processorRes.data.processor_token;

      // 5d. Create Dwolla funding source
      const fsRes = await dwolla().post(
        `customers/${dwollaCustomerId}/funding-sources`,
        { plaidToken: processorToken, name: accountName }
      );
      const fundingSourceUrl = fsRes.headers.get('location');
      if (!fundingSourceUrl) throw new Error('Dwolla funding source URL missing');
      console.log('✓ Dwolla funding source created:', fundingSourceUrl);

      // 5e. Store bank in Appwrite
      const bankDoc = await db.createDocument(DB_ID!, BANK_COL!, ID.unique(), {
        userId,
        bankId: itemId,
        accountId,
        accessToken,
        fundingSourceUrl,
        sharableId: encryptId(accountId),
      });
      console.log('✓ Appwrite Banks document created:', bankDoc.$id);

      // 6. Seed sample transactions so the dashboard isn't empty.
      //    These are written directly to the Transactions collection (same as
      //    createTransaction in bank.actions.ts). Dates are relative to today.
      const today = new Date();
      const daysAgo = (n: number) =>
        new Date(today.getTime() - n * 86_400_000)
          .toISOString()
          .slice(0, 10);

      const sampleTxns = [
        { name: 'Whole Foods Market',   amount: '67.42',  category: 'Food and Drink',  channel: 'in store', daysAgo: 1  },
        { name: 'Netflix',              amount: '15.49',  category: 'Entertainment',   channel: 'online',   daysAgo: 3  },
        { name: 'Uber',                 amount: '23.10',  category: 'Travel',          channel: 'online',   daysAgo: 5  },
        { name: 'Amazon',               amount: '89.99',  category: 'Shopping',        channel: 'online',   daysAgo: 7  },
        { name: 'Starbucks',            amount: '6.75',   category: 'Food and Drink',  channel: 'in store', daysAgo: 9  },
        { name: 'ACH Transfer',         amount: '250.00', category: 'Transfer',        channel: 'online',   daysAgo: 11 },
        { name: 'Spotify',              amount: '9.99',   category: 'Entertainment',   channel: 'online',   daysAgo: 14 },
        { name: 'Shell Gas Station',    amount: '52.30',  category: 'Travel',          channel: 'in store', daysAgo: 16 },
      ];

      for (const t of sampleTxns) {
        await db.createDocument(DB_ID!, TXN_COL!, ID.unique(), {
          name: t.name,
          amount: t.amount,
          channel: t.channel,
          category: t.category,
          senderId: userId,
          senderBankId: bankDoc.$id,
          receiverId: '',
          receiverBankId: '',
        });
      }
      console.log(`✓ ${sampleTxns.length} sample transactions created.`);
    } catch (err: any) {
      console.error('\n✖ Plaid/bank seeding failed:', err?.message ?? err);
      const detail = err?.response?.data ?? err?.body;
      if (detail) console.error('  Detail:', JSON.stringify(detail, null, 2));
      console.log(
        '\n  The user account was created successfully. Only the bank/transaction\n' +
          '  seeding failed. The demo user can still log in — they just won\'t\n' +
          '  have a pre-linked bank until you re-run `npm run seed:demo`.'
      );
      // Don't exit 1 here — user + Dwolla are fine; Plaid is optional.
    }
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────────────');
  console.log('  Demo / judge login');
  console.log('──────────────────────────────────────────────────');
  console.log(`  URL:      https://singular-cannoli-323f40.netlify.app/sign-in`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log('──────────────────────────────────────────────────\n');
}

main().catch((err) => {
  console.error('\n✖ Fatal seed error:', err?.message ?? err);
  process.exit(1);
});
