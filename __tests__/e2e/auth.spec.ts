import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/DAFC|OTB|Login/i);
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible();
  });

  test('should show email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should show validation error for empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should show validation errors
    await expect(page.getByText(/email.*required|invalid.*email/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Wait for error message
    await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login successfully with demo credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@dafc.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
    await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill('admin@dafc.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    // Click on user menu/logout
    const userMenu = page.getByRole('button', { name: /admin|user|account/i });
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.getByText(/sign out|logout/i).click();
    }

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/budget');
    await expect(page).toHaveURL(/login/);
  });

  test('should access protected routes when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@dafc.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Wait for login
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });

    // Navigate to protected route
    await page.goto('/budget');
    await expect(page).toHaveURL(/budget/);
  });
});
