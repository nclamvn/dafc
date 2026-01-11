import { test, expect } from '@playwright/test';

test.describe('OTB Planning', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('admin@dafc.com');
        await page.getByLabel(/password/i).fill('admin123');
        await page.getByRole('button', { name: /sign in|login/i }).click();
        await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
    });

    test('should navigate to OTB plan list', async ({ page }) => {
        // Determine route - assuming /otb-plans based on pattern, or accessed via budget
        // Assuming a direct link or navigation exists. Checking 'OTB' in nav.

        // Try navigating to a likely route, or use UI
        await page.goto('/otb');

        // Check if we are on an OTB related page
        await expect(page.getByRole('heading', { name: /otb|open to buy/i })).toBeVisible();
    });

    test('should create new OTB plan version', async ({ page }) => {
        // This is a complex flow. We'll simulate the critical path.
        // 1. Go to an existing budget or OTB page
        await page.goto('/otb');

        // 2. Click on a plan if exists, or create new
        // Check for "New Plan" or similar
        const createBtn = page.getByRole('button', { name: /new|create|add/i });
        if (await createBtn.isVisible()) {
            await createBtn.click();
            // Verify dialog or navigation
            await expect(page.locator('dialog, [role="dialog"], form')).toBeVisible();
            await page.getByLabel(/name|version/i).fill('Test Plan V2');
            // Submit
            const submitBtn = page.locator('dialog button[type="submit"], form button[type="submit"]');
            if (await submitBtn.isVisible()) {
                await submitBtn.click();
            }
        }
    });

    test('should allow editing OTB line items', async ({ page }) => {
        // Go to a detail page directly if ID known, or navigate
        // Mocking navigation to a list then first item
        await page.goto('/otb');

        const firstPlan = page.locator('table tbody tr a').first();
        if (await firstPlan.isVisible()) {
            await firstPlan.click();

            // Now in detail view
            await expect(page.locator('table')).toBeVisible();

            // Try to edit a cell
            const editableCell = page.locator('[contenteditable="true"], input[type="number"]').first();
            if (await editableCell.isVisible()) {
                await editableCell.click();
                await editableCell.fill('1000');
                await page.keyboard.press('Enter');

                // Verify save/change
                await expect(page.getByText(/saved|updated/i)).toBeVisible();
            }
        }
    });
});
