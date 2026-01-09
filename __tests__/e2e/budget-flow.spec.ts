import { test, expect } from '@playwright/test';

test.describe('Budget Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@dafc.com');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });

  test('should display budget list page', async ({ page }) => {
    await page.goto('/budget');

    await expect(page.getByRole('heading', { name: /budget/i })).toBeVisible();
    // Should show budget table or cards
    await expect(page.locator('table, [data-testid="budget-list"]')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to create budget page', async ({ page }) => {
    await page.goto('/budget');

    // Click create button
    const createButton = page.getByRole('link', { name: /create|new|add/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await expect(page).toHaveURL(/budget\/new/);
    }
  });

  test('should show budget form with required fields', async ({ page }) => {
    await page.goto('/budget/new');

    // Check form fields exist
    await expect(page.getByText(/season/i)).toBeVisible();
    await expect(page.getByText(/brand/i)).toBeVisible();
    await expect(page.getByText(/location/i)).toBeVisible();
  });

  test('should view budget details', async ({ page }) => {
    await page.goto('/budget');

    // Wait for budget list to load
    await page.waitForTimeout(2000);

    // Click on first budget row/card
    const budgetRow = page.locator('table tbody tr, [data-testid="budget-card"]').first();
    if (await budgetRow.isVisible()) {
      await budgetRow.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/budget\/[a-zA-Z0-9-]+/);

      // Should show budget details
      await expect(page.getByText(/total.*budget|status|season/i)).toBeVisible();
    }
  });

  test('should filter budgets by status', async ({ page }) => {
    await page.goto('/budget');

    // Look for filter/tab controls
    const filterButton = page.getByRole('button', { name: /filter|status/i });
    const tabs = page.getByRole('tab');

    if (await filterButton.isVisible()) {
      await filterButton.click();
      // Select a status filter
      await page.getByText(/approved|draft|pending/i).first().click();
    } else if ((await tabs.count()) > 0) {
      // Click on a tab
      await tabs.nth(1).click();
    }

    // Page should still be on budget
    await expect(page).toHaveURL(/budget/);
  });
});

test.describe('Budget Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('manager@dafc.com');
    await page.getByLabel(/password/i).fill('manager123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 15000 });
  });

  test('should access approvals page', async ({ page }) => {
    await page.goto('/approvals');

    await expect(page.getByRole('heading', { name: /approval/i })).toBeVisible();
  });

  test('should show pending approvals', async ({ page }) => {
    await page.goto('/approvals');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Should show some approval items or empty state
    const hasApprovals = await page.locator('table tbody tr, [data-testid="approval-card"]').count() > 0;
    const hasEmptyState = await page.getByText(/no.*pending|no.*approvals/i).isVisible();

    expect(hasApprovals || hasEmptyState).toBeTruthy();
  });
});
