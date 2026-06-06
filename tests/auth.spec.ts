import { test, expect } from "@playwright/test";

test.describe("Sign In page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
  });

  test("loads at /sign-in", async ({ page }) => {
    await expect(page).toHaveURL(/sign-in/);
  });

  test('"Sign In" heading is visible', async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /sign in/i })
    ).toBeVisible();
  });

  test("email input is present and accepts text", async ({ page }) => {
    const email = page.getByLabel(/email/i);
    await expect(email).toBeVisible();
    await email.fill("test@example.com");
    await expect(email).toHaveValue("test@example.com");
  });

  test("password input is present and accepts text", async ({ page }) => {
    const password = page.getByLabel(/password/i);
    await expect(password).toBeVisible();
    await password.fill("secret123");
    await expect(password).toHaveValue("secret123");
  });

  test('"Sign In" button is visible and clickable', async ({ page }) => {
    const btn = page.getByRole("button", { name: /sign in/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('"Don\'t have an account? Sign up" link navigates to /sign-up', async ({
    page,
  }) => {
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test("submitting empty form shows validation errors", async ({ page }) => {
    await page.getByRole("button", { name: /sign in/i }).click();
    // Expect at least one validation message visible
    const errors = page.locator(
      "p[class*='error'], span[class*='error'], [role='alert'], .text-red, [class*='destructive']"
    );
    await expect(errors.first()).toBeVisible({ timeout: 5000 });
  });

  test("submitting wrong credentials shows error message", async ({ page }) => {
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Any error feedback: toast, alert, or inline message
    const errorIndicator = page.locator(
      "[role='alert'], [data-sonner-toast], [class*='error'], [class*='destructive'], .toast"
    );
    await expect(errorIndicator.first()).toBeVisible({ timeout: 8000 });
  });
});
