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
