// __tests__/e2e/global-setup.ts
// Optimized global setup for faster E2E tests

import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

// Auth state storage
const authFile = path.join(__dirname, '../../.auth/user.json');

async function globalSetup(config: FullConfig) {
  const startTime = Date.now();
  console.log('\n🚀 Starting E2E Test Global Setup...\n');

  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
  
  // ========================================
  // STEP 1: Warm up server (prevent cold start)
  // ========================================
  console.log('Step 1: Warming up server...');
  await warmUpServer(baseURL);
  
  // ========================================
  // STEP 2: Create authenticated session
  // ========================================
  console.log('Step 2: Creating authenticated session...');
  await createAuthSession(baseURL, authFile);
  
  // ========================================
  // STEP 3: Verify critical endpoints
  // ========================================
  console.log('Step 3: Verifying critical endpoints...');
  await verifyCriticalEndpoints(baseURL);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Global Setup Complete (${duration}s)\n`);
}

/**
 * Warm up the server to prevent cold start delays
 */
async function warmUpServer(baseURL: string) {
  const maxRetries = 5;
  const retryDelay = 3000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${baseURL}/api/v1/health`, {
        signal: AbortSignal.timeout(10000),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✓ Server healthy (attempt ${attempt})`);
        console.log(`   ✓ Database: ${data.checks?.database?.status || 'unknown'}`);
        return;
      }
    } catch (error) {
      console.log(`   ⚠ Attempt ${attempt}/${maxRetries} failed, retrying...`);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.log('   ⚠ Server warm-up failed, tests may be slow');
}

/**
 * Create authenticated session and save to file
 */
async function createAuthSession(baseURL: string, authFile: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to login
    await page.goto(`${baseURL}/login`, { 
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', 'admin@dafc.com');
    await page.fill('input[name="password"], input[type="password"]', 'admin123');
    
    // Submit and wait for redirect
    await Promise.all([
      page.waitForURL('**/dashboard**', { timeout: 30000 }),
      page.click('button[type="submit"]'),
    ]);
    
    // Verify login success
    const session = await page.evaluate(async () => {
      const response = await fetch('/api/auth/session');
      return response.json();
    });
    
    if (session?.user) {
      console.log(`   ✓ Logged in as: ${session.user.email}`);
      
      // Save auth state
      await context.storageState({ path: authFile });
      console.log(`   ✓ Auth state saved to: ${authFile}`);
    } else {
      console.log('   ⚠ Login may have failed, no session found');
    }
  } catch (error) {
    console.log(`   ⚠ Auth setup error: ${(error as Error).message}`);
  } finally {
    await browser.close();
  }
}

/**
 * Verify critical endpoints are working
 */
async function verifyCriticalEndpoints(baseURL: string) {
  const endpoints = [
    { path: '/api/v1/health', name: 'Health API' },
    { path: '/api/auth/session', name: 'Auth Session' },
  ];
  
  for (const { path, name } of endpoints) {
    try {
      const response = await fetch(`${baseURL}${path}`, {
        signal: AbortSignal.timeout(5000),
      });
      const status = response.ok ? '✓' : '✗';
      console.log(`   ${status} ${name}: ${response.status}`);
    } catch (error) {
      console.log(`   ✗ ${name}: failed`);
    }
  }
}

export default globalSetup;
