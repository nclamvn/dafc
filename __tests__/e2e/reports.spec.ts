import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('admin@dafc.com');
        await page.getByLabel(/password/i).fill('admin123');
        await page.getByRole('button', { name: /sign in|login/i }).click();
        await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
    });

    test('should generate SKU Performance report', async ({ page }) => {
        // Navigate to reports page
        await page.goto('/reports/sku-performance');

        await expect(page.getByRole('heading', { name: /sku performance/i })).toBeVisible();

        // Check if table loads
        await expect(page.locator('table')).toBeVisible();

        // Apply a simple filter if possible (e.g., Brand)
        // Attempt to interact with a filter to ensure interactivity
        const brandSelect = page.getByRole('combobox', { name: /brand/i });
        if (await brandSelect.isVisible()) {
            await brandSelect.click();
            // Select first option
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');

            // Values should potentially update, just waiting for network idle or stability
            await page.waitForLoadState('networkidle');
            await expect(page.locator('table')).toBeVisible();
        }
    });

    test('should allow export of report', async ({ page }) => {
        await page.goto('/reports/sku-performance');

        const exportBtn = page.getByRole('button', { name: /export|download|csv/i });
        if (await exportBtn.isVisible()) {
            // Setup download listener
            const downloadPromise = page.waitForEvent('download');
            await exportBtn.click();
            const download = await downloadPromise;

            expect(download.suggestedFilename()).toContain('csv');
        }
    });
});
