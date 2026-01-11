// playwright.config.ts
// Fixed configuration for multi-browser E2E testing

import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for DAFC OTB Platform
 * 
 * FIX: Ensure all browsers actually run tests, not just Chromium
 */
export default defineConfig({
  // Test directory
  testDir: './__tests__/e2e',
  
  // Test timeout - increased for slow operations
  timeout: 60 * 1000, // 60 seconds per test
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Workers - limit on CI to avoid resource issues
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Global setup - authenticate before all tests
  globalSetup: require.resolve('./__tests__/e2e/global-setup.ts'),
  
  // Shared settings for all projects
  use: {
    // Base URL - use environment variable or default
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Increase action timeout for slow server
    actionTimeout: 15 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    // ========================================
    // DESKTOP BROWSERS
    // ========================================
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Ensure browser is actually launched
        launchOptions: {
          slowMo: process.env.CI ? 0 : 50, // Slow down in dev for debugging
        },
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          slowMo: process.env.CI ? 0 : 50,
        },
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        launchOptions: {
          slowMo: process.env.CI ? 0 : 50,
        },
      },
    },

    // ========================================
    // MOBILE BROWSERS
    // ========================================
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        launchOptions: {
          slowMo: process.env.CI ? 0 : 50,
        },
      },
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        launchOptions: {
          slowMo: process.env.CI ? 0 : 50,
        },
      },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start server
    env: {
      NODE_ENV: 'test',
    },
  },
});

/**
 * NOTES:
 * 
 * 1. To install all browsers:
 *    npx playwright install
 * 
 * 2. To install specific browser:
 *    npx playwright install firefox
 *    npx playwright install webkit
 * 
 * 3. To run tests on specific browser:
 *    npx playwright test --project=firefox
 * 
 * 4. To run all browsers:
 *    npx playwright test
 * 
 * 5. If tests show 1ms, browsers may not be installed:
 *    npx playwright install --with-deps
 */
