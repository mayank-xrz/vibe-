# Horizon Banking Platform

A production-grade full-stack banking platform built with Next.js 14, Appwrite, Plaid, Dwolla, and Sentry.

## Features

- 🏦 Bank account linking via Plaid (sandbox)
- 💸 ACH transfers via Dwolla (sandbox)
- 📊 Real-time transaction history
- 📈 Interactive charts (Chart.js)
- 🔐 Appwrite authentication
- 📱 Responsive design with Tailwind CSS v4
- 🛡️ Error monitoring with Sentry Session Replay

## Tech Stack

- **Framework**: Next.js 14 (App Router, Server Actions, SSR)
- **Language**: TypeScript
- **Auth & DB**: Appwrite
- **Bank Linking**: Plaid (sandbox)
- **Payments**: Dwolla ACH (sandbox)
- **Monitoring**: Sentry
- **Styling**: Tailwind CSS v4 + custom utilities
- **Forms**: React Hook Form + Zod
- **Charts**: Chart.js via react-chartjs-2
- **Animations**: react-countup

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/horizon-banking
cd horizon-banking
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values:

#### Appwrite
1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Get Project ID and set `NEXT_PUBLIC_APPWRITE_PROJECT`
3. Create an API key with full access: `NEXT_APPWRITE_KEY`
4. Create three collections (see below): set the collection IDs

#### Plaid
1. Sign up at [dashboard.plaid.com](https://dashboard.plaid.com)
2. Use sandbox environment: `PLAID_ENV=sandbox`
3. Copy Client ID and sandbox secret

#### Dwolla
1. Sign up at [accounts-sandbox.dwolla.com](https://accounts-sandbox.dwolla.com)
2. Get sandbox key and secret
3. Set `DWOLLA_BASE_URL=https://api-sandbox.dwolla.com`

#### Sentry
1. Create a project at [sentry.io](https://sentry.io)
2. Copy the DSN to `SENTRY_DSN`

---

## Environment Variables

Complete reference for every environment variable the application reads.
Add these in **Netlify → Site settings → Environment variables** (or GitHub → Settings → Secrets and variables → Actions for CI).

> **Never commit real secrets.** `.env.local` is git-ignored. Use `.env.example` as a template.

### Appwrite

| Variable | Example value | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` | Fixed — Appwrite Cloud base URL |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | `64f3a1b2c3d4e5f6a7b8c9d0` | [cloud.appwrite.io](https://cloud.appwrite.io) → your project → Settings → Project ID |
| `NEXT_APPWRITE_KEY` | `standard_abc123...` | Project → Settings → API Keys → Create key (All scopes) |
| `APPWRITE_DATABASE_ID` | `64f3a1b2c3d4e5f6a7b8c9d1` | Databases → your database → Settings → Database ID |
| `APPWRITE_USER_COLLECTION_ID` | `64f3a1b2c3d4e5f6a7b8c9d2` | Databases → your database → Users collection → Settings → Collection ID |
| `APPWRITE_BANK_COLLECTION_ID` | `64f3a1b2c3d4e5f6a7b8c9d3` | Databases → your database → Banks collection → Settings → Collection ID |
| `APPWRITE_TRANSACTION_COLLECTION_ID` | `64f3a1b2c3d4e5f6a7b8c9d4` | Databases → your database → Transactions collection → Settings → Collection ID |

### Plaid

| Variable | Example value | Where to find it |
|---|---|---|
| `PLAID_CLIENT_ID` | `63f1a2b3c4d5e6f7a8b9c0d1` | [dashboard.plaid.com](https://dashboard.plaid.com) → Team Settings → Keys → Client ID |
| `PLAID_SECRET` | `abc123def456ghi789jkl012` | Dashboard → Team Settings → Keys → Sandbox secret |
| `PLAID_ENV` | `sandbox` | `sandbox` for development, `production` for live |
| `PLAID_PRODUCTS` | `auth,transactions,identity` | Comma-separated Plaid products to request |
| `PLAID_COUNTRY_CODES` | `US,CA` | Comma-separated country codes |

### Dwolla

| Variable | Example value | Where to find it |
|---|---|---|
| `DWOLLA_KEY` | `AbCdEfGhIjKlMnOpQrStUvWxYz` | [accounts-sandbox.dwolla.com](https://accounts-sandbox.dwolla.com) → Applications → your app → Key |
| `DWOLLA_SECRET` | `ZyXwVuTsRqPoNmLkJiHgFeDcBa` | Same page → Secret |
| `DWOLLA_BASE_URL` | `https://api-sandbox.dwolla.com` | Fixed sandbox URL. Production: `https://api.dwolla.com` |
| `DWOLLA_ENV` | `sandbox` | `sandbox` or `production` |

### Sentry

| Variable | Example value | Where to find it |
|---|---|---|
| `SENTRY_DSN` | `https://abc123@o123456.ingest.sentry.io/1234567` | [sentry.io](https://sentry.io) → your project → Settings → Client Keys (DSN) |

### App

| Variable | Example value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://singular-cannoli-323f40.netlify.app` | **Build-time** — must match your deployed URL. Use `http://localhost:3000` for local dev. |

### Seed script (optional, local dev only)

| Variable | Example value | Notes |
|---|---|---|
| `SEED_USER_EMAIL` | `testuser@example.com` | Used only by `npm run seed`. Never commit real values. |
| `SEED_USER_PASSWORD` | `Test1234!` | Min 8 chars, 1 uppercase, 1 number. |

### Build-time vs runtime

`NEXT_PUBLIC_*` variables are **baked into the JavaScript bundle at build time**. If you change them in Netlify after a build you must redeploy for the change to take effect. All other variables are read at runtime on the server and can be updated without a rebuild.

| Variable | When read |
|---|---|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Build time |
| `NEXT_PUBLIC_APPWRITE_PROJECT` | Build time |
| `NEXT_PUBLIC_SITE_URL` | Build time |
| All others | Runtime (server only) |

### 3. Appwrite Database Setup

Create a database and three collections:

#### Users Collection
Attributes:
| Name | Type | Size | Required |
|------|------|------|----------|
| email | String | 256 | Yes |
| userId | String | 256 | Yes |
| dwollaCustomerUrl | String | 2000 | Yes |
| dwollaCustomerId | String | 256 | Yes |
| firstName | String | 256 | Yes |
| lastName | String | 256 | Yes |
| address1 | String | 256 | Yes |
| city | String | 256 | Yes |
| state | String | 2 | Yes |
| postalCode | String | 10 | Yes |
| dateOfBirth | String | 10 | Yes |
| ssn | String | 4 | Yes |

> ⚠️ SSN and DOB are PII — in production these should be encrypted at rest.

#### Banks Collection
Attributes:
| Name | Type | Size | Required |
|------|------|------|----------|
| accountId | String | 2000 | Yes |
| bankId | String | 2000 | Yes |
| accessToken | String | 2000 | Yes |
| fundingSourceUrl | String | 2000 | Yes |
| userId | String | 256 | Yes |
| sharableId | String | 2000 | Yes |

**Relationship**: Banks → Users (Many-to-one, on `userId`, Cascade delete)

#### Transactions Collection
Attributes:
| Name | Type | Size | Required |
|------|------|------|----------|
| name | String | 256 | Yes |
| amount | String | 256 | Yes |
| senderId | String | 256 | Yes |
| receiverId | String | 256 | Yes |
| senderBankId | String | 256 | Yes |
| receiverBankId | String | 256 | Yes |
| channel | String | 256 | Yes |
| category | String | 256 | Yes |

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sandbox Testing

### Plaid Test Credentials
When prompted by the Plaid Link UI:
- **Institution**: Search for "Chase" or any sandbox bank
- **Username**: `user_good`
- **Password**: `pass_good`

### Dwolla Sandbox
All transfers in sandbox mode are simulated. No real money moves.

## Test account

For repeated testing you can seed one ordinary test user instead of filling
out the sign-up form by hand each time.

> There is **no master/admin login and no auth backdoor**. The seed script
> creates a normal user through the *exact same* flow a real user goes through
> (Appwrite Auth → Dwolla customer → Users document). That user then logs in via
> the normal `/sign-in` page like any other account.

1. Add your chosen credentials to `.env.local` (placeholders are in
   `.env.example` — never commit real values):

   ```env
   SEED_USER_EMAIL=testuser@example.com
   SEED_USER_PASSWORD=Test1234!
   ```

   The Appwrite and Dwolla values in `.env.local` must be **real sandbox
   credentials** for seeding to succeed.

2. Run the seed script:

   ```bash
   npm run seed
   ```

   It is **idempotent** — if a user with that email already exists it skips
   creation. On success (or skip) it prints the email/password to log in with.
   If any step fails midway it rolls back the partial state (deletes the
   Appwrite account, deactivates the Dwolla customer).

3. Go to `/sign-in` and log in with `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`.

## Architecture

```
app/
├── (auth)/          # Sign-in, sign-up (no sidebar)
│   ├── sign-in/
│   └── sign-up/
└── (root)/          # Authenticated pages (with sidebar)
    ├── page.tsx            # Dashboard
    ├── my-banks/
    ├── transaction-history/
    └── payment-transfer/

lib/
├── actions/         # Server Actions
│   ├── user.actions.ts
│   ├── bank.actions.ts
│   └── dwolla.actions.ts
├── server/
│   └── appwrite.ts  # Appwrite clients
├── plaid.ts
└── utils.ts

components/          # Shared UI components
constants/           # Nav links, category styles
types/               # Global TypeScript interfaces
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel dashboard
3. Add all environment variables
4. Deploy

## License

MIT
