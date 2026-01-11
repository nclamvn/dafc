import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SKU Proposal', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/email/i).fill('admin@dafc.com');
        await page.getByLabel(/password/i).fill('admin123');
        await page.getByRole('button', { name: /sign in|login/i }).click();
        await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
    });

    test('should navigate to new proposal page', async ({ page }) => {
        await page.goto('/sku-proposal');
        await expect(page.getByRole('heading', { name: /proposal/i })).toBeVisible();

        await page.getByRole('link', { name: /new|create/i }).click();
        await expect(page).toHaveURL(/sku-proposal\/new|upload/);
    });

    test('should handle file upload validation', async ({ page }) => {
        await page.goto('/sku-proposal/new');

        // Verify upload area exists
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toBeAttached();

        // Create a dummy file buffer
        const buffer = Buffer.from('sku,price\nSKU001,100');

        // Upload file
        await fileInput.setInputFiles({
            name: 'test-proposal.csv',
            mimeType: 'text/csv',
            buffer: buffer
        });

        // Check for upload success indication or preview
        // This selector depends on UI implementation, using textual match for robustness
        await expect(page.getByText(/uploaded|test-proposal/i)).toBeVisible();
    });
});
