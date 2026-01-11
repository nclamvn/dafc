import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('admin@dafc.com');
        await page.getByLabel(/password/i).fill('admin123');
        await page.getByRole('button', { name: /sign in|login/i }).click();
        await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
    });

    test('should display key summary widgets', async ({ page }) => {
        await page.goto('/dashboard');

        // Check for common dashboard elements based on typical OTB apps
        // Adjust selectors if specific IDs are known, otherwise using text match
        await expect(page.getByText(/total otb|budget overview/i)).toBeVisible();
        await expect(page.getByText(/sku proposals|pending approval/i)).toBeVisible();
    });

    test('should have working navigation links', async ({ page }) => {
        await page.goto('/dashboard');

        // Verify standard navigation menu items exist
        const nav = page.locator('nav');
        await expect(nav).toBeVisible();

        await expect(nav.getByText(/budget/i)).toBeVisible();
        await expect(nav.getByText(/proposal|sku/i)).toBeVisible();
        await expect(nav.getByText(/report|analytics/i)).toBeVisible();
    });
});
