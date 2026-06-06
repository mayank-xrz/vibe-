# Testing Suite — Horizon Banking App

## Prerequisites

- Node.js 18+
- App running locally on port 3000 (`npm run dev` or `npm start`)
- For authenticated tests: a valid Appwrite account

---

## Environment Variables

Create a `.env` file at the project root (or export these in your shell)
before running the dashboard / navigation suites:

```
DEMO_EMAIL=your@email.com
DEMO_PASSWORD=yourpassword
```

---

## Running the Test Suites

### All E2E tests (Playwright)

```bash
npm run test:e2e
```

This runs every `*.spec.ts` file in `/tests` across **Chromium** and **Firefox**.

### A single spec file

```bash
npx playwright test tests/auth.spec.ts
```

### A single browser

```bash
npx playwright test --project=chromium
```

### With visible browser (headed)

```bash
npx playwright test --headed
```

### Show HTML report after a run

```bash
npx playwright show-report
```

---

### Performance audit (Lighthouse CI)

Make sure the app is running on `http://localhost:3000` first, then:

```bash
npm run test:perf
```

Assertions (defined in `lighthouserc.json`):

| Category       | Min score |
| -------------- | --------- |
| Performance    | 75        |
| Accessibility  | 85        |
| Best Practices | 85        |
| SEO            | 80        |

---

### Run everything

```bash
npm run test:all
```

---

## Test Files

| File                      | What it covers                                      |
| ------------------------- | --------------------------------------------------- |
| `tests/auth.spec.ts`      | Sign-in page — UI, validation, wrong credentials    |
| `tests/signup.spec.ts`    | Sign-up page — all fields, validation, navigation   |
| `tests/dashboard.spec.ts` | Authenticated dashboard — layout, table, sidebar    |
| `tests/navigation.spec.ts`| Sidebar nav links — correct routes, no 404s         |
| `tests/responsive.spec.ts`| Layout at 375 / 768 / 1280 px, no horizontal scroll |

---

## Skipped Tests

Tests in `dashboard.spec.ts` and `navigation.spec.ts` are automatically
**skipped** when `DEMO_EMAIL` / `DEMO_PASSWORD` are not set, so the public
CI can still run the auth + responsive suites without credentials.

---

## Stored Auth State (optional speed-up)

To avoid logging in on every dashboard/navigation test run, generate a
stored session once:

```bash
npx playwright test tests/auth.spec.ts --project=chromium
```

Then add a global setup that writes the session to `tests/.auth/user.json`.
The dashboard suite will reuse it automatically.
