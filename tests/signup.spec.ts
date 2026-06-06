import { test, expect } from "@playwright/test";

test.describe("Sign Up page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("loads at /sign-up", async ({ page }) => {
    await expect(page).toHaveURL(/sign-up/);
  });

  test("First Name field is present", async ({ page }) => {
    await expect(page.getByLabel(/first name/i)).toBeVisible();
  });

  test("Last Name field is present", async ({ page }) => {
    await expect(page.getByLabel(/last name/i)).toBeVisible();
  });

  test("Address field is present", async ({ page }) => {
    await expect(page.getByLabel(/address/i)).toBeVisible();
  });

  test("City field is present", async ({ page }) => {
    await expect(page.getByLabel(/city/i)).toBeVisible();
  });

  test("State field is present", async ({ page }) => {
    await expect(page.getByLabel(/state/i)).toBeVisible();
  });

  test("Postal Code field is present", async ({ page }) => {
    await expect(page.getByLabel(/postal code/i)).toBeVisible();
  });

  test("Date of Birth field is present", async ({ page }) => {
    await expect(page.getByLabel(/date of birth/i)).toBeVisible();
  });

  test("SSN field is present", async ({ page }) => {
    await expect(page.getByLabel(/ssn/i)).toBeVisible();
  });

  test("Email field is present", async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("Password field is present", async ({ page }) => {
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('"Sign Up" button is visible', async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign up/i })
    ).toBeVisible();
  });

  test('"Already have an account? Sign in" link navigates to /sign-in', async ({
    page,
  }) => {
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/sign-in/);
  });

  test("submitting empty form shows validation errors", async ({ page }) => {
    await page.getByRole("button", { name: /sign up/i }).click();
    const errors = page.locator(
      "p[class*='error'], span[class*='error'], [role='alert'], .text-red, [class*='destructive']"
    );
    await expect(errors.first()).toBeVisible({ timeout: 5000 });
  });
});
