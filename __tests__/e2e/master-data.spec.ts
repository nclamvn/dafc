import { test, expect } from '@playwright/test';

test.describe('Master Data', () => {
  test.beforeEach(async ({ page }) => {
    // Login with admin credentials
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@dafc.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });

  test('should display brands list', async ({ page }) => {
    await page.goto('/master-data/brands');
    
    await expect(page.getByRole('heading', { name: /brands/i })).toBeVisible();
    
    // Check for table or list presence
    await expect(page.locator('table, [data-testid="brand-list"]')).toBeVisible();
  });

  test('should display divisions list', async ({ page }) => {
    await page.goto('/master-data/divisions');
    
    await expect(page.getByRole('heading', { name: /divisions/i })).toBeVisible();
    
    await expect(page.locator('table, [data-testid="division-list"]')).toBeVisible();
  });
  
  test('should display sales locations', async ({ page }) => {
     await page.goto('/master-data/locations');
     
     // Locations page might be under different route or name, checking basic availability
     // If route fails (404), this test will fail, alerting us to correct route
     await expect(page.getByRole('heading', { name: /locations/i })).toBeVisible();
  });
});
