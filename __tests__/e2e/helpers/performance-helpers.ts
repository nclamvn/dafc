// __tests__/e2e/helpers/performance-helpers.ts
// Helpers to improve E2E test performance

import { Page, expect } from '@playwright/test';

/**
 * Wait for page to be fully loaded and stable
 * Reduces flakiness from slow renders
 */
export async function waitForPageReady(page: Page, options?: {
  timeout?: number;
  waitForNetwork?: boolean;
}) {
  const { timeout = 30000, waitForNetwork = true } = options || {};
  
  // Wait for DOM content loaded
  await page.waitForLoadState('domcontentloaded', { timeout });
  
  // Wait for network to be idle (no pending requests)
  if (waitForNetwork) {
    await page.waitForLoadState('networkidle', { timeout });
  }
  
  // Wait for any loading spinners to disappear
  const loadingSelectors = [
    '[data-testid="loading"]',
    '.loading',
    '.spinner',
    '[class*="animate-spin"]',
    '[class*="animate-pulse"]',
  ];
  
  for (const selector of loadingSelectors) {
    const loading = page.locator(selector).first();
    if (await loading.isVisible({ timeout: 1000 }).catch(() => false)) {
      await loading.waitFor({ state: 'hidden', timeout });
    }
  }
}

/**
 * Fast login using stored auth state
 * Avoids repeated login flows
 */
export async function fastLogin(page: Page, credentials?: {
  email?: string;
  password?: string;
}) {
  const email = credentials?.email || 'admin@dafc.com';
  const password = credentials?.password || 'admin123';
  
  // Check if already logged in
  const response = await page.request.get('/api/auth/session');
  const session = await response.json();
  
  if (session?.user) {
    console.log('Already logged in, skipping login');
    return;
  }
  
  // Perform login
  await page.goto('/login');
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
}

/**
 * Pre-warm the server before running tests
 * Eliminates cold start delays
 */
export async function warmUpServer(baseURL: string) {
  const endpoints = [
    '/api/v1/health',
    '/api/cron/keep-alive',
  ];
  
  console.log('🔥 Warming up server...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      console.log(`  ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`  ${endpoint}: failed (server may be starting)`);
    }
  }
  
  // Give server time to fully warm up
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('✅ Server warm-up complete');
}

/**
 * Optimized page navigation with retry
 */
export async function navigateWithRetry(
  page: Page, 
  url: string, 
  options?: {
    maxRetries?: number;
    timeout?: number;
  }
) {
  const { maxRetries = 3, timeout = 30000 } = options || {};
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout 
      });
      await waitForPageReady(page, { timeout: timeout / 2 });
      return; // Success
    } catch (error) {
      lastError = error as Error;
      console.log(`Navigation attempt ${attempt}/${maxRetries} failed: ${url}`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  throw lastError;
}

/**
 * Wait for API response with caching check
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  options?: {
    timeout?: number;
    status?: number;
  }
) {
  const { timeout = 15000, status = 200 } = options || {};
  
  const response = await page.waitForResponse(
    (resp) => {
      const matches = typeof urlPattern === 'string' 
        ? resp.url().includes(urlPattern)
        : urlPattern.test(resp.url());
      return matches && resp.status() === status;
    },
    { timeout }
  );
  
  return response;
}

/**
 * Parallel data loading - fetch multiple endpoints at once
 */
export async function preloadData(page: Page, endpoints: string[]) {
  const promises = endpoints.map(async (endpoint) => {
    try {
      const response = await page.request.get(endpoint);
      return { endpoint, status: response.status() };
    } catch (error) {
      return { endpoint, status: 0, error };
    }
  });
  
  const results = await Promise.all(promises);
  console.log('Preloaded data:', results);
  return results;
}

/**
 * Skip slow animations for faster tests
 */
export async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `,
  });
}

/**
 * Mock slow endpoints for faster tests
 */
export async function mockSlowEndpoints(page: Page) {
  // Mock AI endpoints that can be slow
  await page.route('**/api/ai/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { message: 'Mocked AI response' },
      }),
    });
  });
}
