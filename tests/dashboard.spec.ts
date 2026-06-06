import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Dashboard tests require an authenticated session.
 * Provide demo credentials via environment variables:
 *   DEMO_EMAIL and DEMO_PASSWORD
 * or place them in a .env file at the project root.
 *
 * If a stored auth state file exists at tests/.auth/user.json it is
 * reused so the login step is skipped on subsequent runs.
 */

const AUTH_FILE = path.join(__dirname, ".auth", "user.json");

async function loginIfNeeded(page: import("@playwright/test").Page) {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    test.skip(true, "DEMO_EMAIL / DEMO_PASSWORD env vars not set");
    return;
  }
  await page.goto("/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/", { timeout: 15_000 });
}

test.describe("Dashboard (authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Reuse stored state when available
    if (fs.existsSync(AUTH_FILE)) {
      await page.goto("/");
      // If redirected to sign-in the stored state is stale — re-login
      if (page.url().includes("sign-in")) {
        await loginIfNeeded(page);
      }
    } else {
      await loginIfNeeded(page);
    }
  });

  test("user lands on / after login", async ({ page }) => {
    await expect(page).toHaveURL("/");
  });

  test('"Welcome" heading is visible', async ({ page }) => {
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('sidebar has "Home" link', async ({ page }) => {
    await expect(page.getByRole("link", { name: /^home$/i })).toBeVisible();
  });

  test('sidebar has "My Banks" link', async ({ page }) => {
    await expect(page.getByRole("link", { name: /my banks/i })).toBeVisible();
  });

  test('sidebar has "Transaction History" link', async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /transaction history/i })
    ).toBeVisible();
  });

  test('sidebar has "Transfer Funds" link', async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /transfer funds/i })
    ).toBeVisible();
  });

  test('sidebar has "Connect bank" link', async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /connect bank/i })
    ).toBeVisible();
  });

  test('"Bank Accounts" count is displayed', async ({ page }) => {
    await expect(page.getByText(/bank account/i)).toBeVisible();
  });

  test('"Total Current Balance" is displayed', async ({ page }) => {
    await expect(page.getByText(/total current balance/i)).toBeVisible();
  });

  test('"Recent transactions" section is visible', async ({ page }) => {
    await expect(page.getByText(/recent transactions/i)).toBeVisible();
  });

  test("transaction table has Transaction column", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /transaction/i })
    ).toBeVisible();
  });

  test("transaction table has Amount column", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /amount/i })
    ).toBeVisible();
  });

  test("transaction table has Status column", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /status/i })
    ).toBeVisible();
  });

  test("transaction table has Date column", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /date/i })
    ).toBeVisible();
  });

  test("transaction table has Channel column", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /channel/i })
    ).toBeVisible();
  });

  test("transaction table has Category column", async ({ page }) => {
    await expect(
      page.getByRole("columnheader", { name: /category/i })
    ).toBeVisible();
  });

  test('"View all" button is visible and clickable', async ({ page }) => {
    const btn = page.getByRole("link", { name: /view all/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test("right panel shows user email", async ({ page }) => {
    const email = process.env.DEMO_EMAIL!;
    await expect(page.getByText(email)).toBeVisible();
  });

  test('"+  Add bank" button is visible', async ({ page }) => {
    await expect(page.getByText(/add bank/i)).toBeVisible();
  });

  test('"Top categories" section is visible', async ({ page }) => {
    await expect(page.getByText(/top categories/i)).toBeVisible();
  });
});
