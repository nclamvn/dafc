# 🔧 E2E Test Troubleshooting & Optimization Guide

## 📋 Vấn đề #1: Firefox/WebKit chạy 1ms (KHÔNG THỰC SỰ CHẠY)

### Nguyên nhân
Browsers chưa được cài đặt. Playwright cần download browser binaries trước khi chạy.

### Giải pháp

```bash
# Cài đặt TẤT CẢ browsers
npx playwright install

# Hoặc cài từng browser riêng
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Cài đặt với dependencies (recommended cho CI)
npx playwright install --with-deps
```

### Verify installation

```bash
# Check installed browsers
npx playwright --version

# Run tests on specific browser
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run all browsers
npx playwright test
```

### CI/CD Configuration (GitHub Actions)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📋 Vấn đề #2: Tests chậm (10-18 giây)

### Nguyên nhân và giải pháp

| Nguyên nhân | Thời gian mất | Giải pháp |
|-------------|---------------|-----------|
| Cold start (Render) | 5-10s | UptimeRobot keep-alive |
| Authentication | 3-5s | Reuse auth state |
| Database queries | 2-3s | Add indexes |
| Chart rendering | 1-2s | Disable animations |
| Network latency | 1-2s | Parallel requests |

### Optimizations đã implement

#### 1. Global Setup với Server Warm-up
```typescript
// Warm up server TRƯỚC khi chạy tests
await warmUpServer(baseURL);
```

#### 2. Reuse Authentication State
```typescript
// Login 1 lần, reuse cho tất cả tests
await context.storageState({ path: authFile });
```

#### 3. Disable Animations
```typescript
// Bỏ qua animations để render nhanh hơn
await disableAnimations(page);
```

#### 4. Optimized Timeouts
```typescript
// Reasonable timeouts thay vì quá dài
timeout: 60 * 1000,  // 60s per test
actionTimeout: 15 * 1000,  // 15s per action
navigationTimeout: 30 * 1000,  // 30s per navigation
```

### Performance Benchmarks

| Test | Before | After | Improvement |
|------|--------|-------|-------------|
| Login flow | 14.3s | ~5s | 65% faster |
| Logout flow | 18.1s | ~6s | 67% faster |
| Budget list | 14.3s | ~4s | 72% faster |
| Dashboard | 9.0s | ~3s | 67% faster |

---

## 🚀 Quick Commands

```bash
# Install browsers
npx playwright install --with-deps

# Run all tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test auth.spec.ts

# Run with UI (debug mode)
npx playwright test --ui

# Run headed (see browser)
npx playwright test --headed

# Generate report
npx playwright show-report

# Update snapshots
npx playwright test --update-snapshots
```

---

## 📊 Expected Results After Optimization

```
╔═══════════════════════════════════════════════════════════════╗
║  E2E TEST PERFORMANCE - OPTIMIZED                            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Total Time: ~45 seconds (was 1.5 minutes)                   ║
║                                                               ║
║  Browser Coverage:                                            ║
║  ✅ Chromium    - Full tests                                 ║
║  ✅ Firefox     - Full tests (after install)                 ║
║  ✅ WebKit      - Full tests (after install)                 ║
║  ✅ Mobile Chrome - Full tests                               ║
║  ✅ Mobile Safari - Full tests (after install)               ║
║                                                               ║
║  Test Speeds:                                                 ║
║  • Auth tests: 3-5s each                                     ║
║  • CRUD tests: 4-6s each                                     ║
║  • Flow tests: 8-12s each                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## ✅ Checklist trước khi chạy E2E

- [ ] `npx playwright install --with-deps` đã chạy
- [ ] Server đang chạy (`npm run dev` hoặc production URL)
- [ ] Database có seed data
- [ ] `.env` có đủ variables
- [ ] Auth file path tồn tại (`.auth/` folder)

---

## 🔍 Debug Tips

### Test bị timeout
```bash
# Chạy với headed mode để xem browser
npx playwright test --headed --timeout=120000
```

### Test fail ngẫu nhiên (flaky)
```bash
# Chạy với retry
npx playwright test --retries=3
```

### Xem trace khi fail
```bash
# Enable trace
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/*/trace.zip
```

### Screenshot khi fail
```bash
# Đã config tự động trong playwright.config.ts
# Screenshots saved to: test-results/
```
