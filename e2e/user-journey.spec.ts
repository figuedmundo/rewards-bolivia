import { test, expect } from '@playwright/test';

test.describe('User Journey E2E Tests', () => {
  test('complete user registration and login flow', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');

    // Click register link
    await page.click('text=Register');

    // Fill registration form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.fill('[data-testid="firstName"]', 'Test');
    await page.fill('[data-testid="lastName"]', 'User');

    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Should redirect to dashboard or login
    await expect(page).toHaveURL(/.*(dashboard|login)/);

    // If redirected to login, complete login
    if (page.url().includes('login')) {
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
    }

    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('user can view and interact with points balance', async ({ page }) => {
    // Login first (assuming user exists from previous test)
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to points/balance section
    await page.click('text=Points');

    // Verify balance display
    await expect(page.locator('[data-testid="points-balance"]')).toBeVisible();

    // Check for transaction history
    await expect(page.locator('[data-testid="transaction-history"]')).toBeVisible();
  });

  test('admin can trigger reconciliation job', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Navigate to admin panel
    await page.click('text=Admin');

    // Trigger reconciliation
    await page.click('[data-testid="trigger-reconciliation"]');

    // Verify job was queued (check for success message or job status)
    await expect(page.locator('text=Reconciliation job queued')).toBeVisible();
  });

  test('system handles concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );

    // Simulate multiple users accessing the system
    await Promise.all(pages.map(async (page, index) => {
      await page.goto('http://localhost:5173/login');
      await page.fill('[data-testid="email"]', `user${index}@example.com`);
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Verify each user can access their dashboard
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }));

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
  });

  test('API and frontend stay in sync', async ({ page, request }) => {
    // Test API directly
    const apiResponse = await request.get('http://localhost:3001/api/health');
    expect(apiResponse.ok()).toBeTruthy();

    // Test frontend loads
    await page.goto('http://localhost:5173');
    await expect(page.locator('text=Rewards Bolivia')).toBeVisible();

    // Verify SDK compatibility by checking if API calls work
    const loginResponse = await request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    if (loginResponse.ok()) {
      const { accessToken } = await loginResponse.json();

      // Use token to access protected route
      const profileResponse = await request.get('http://localhost:3001/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      expect(profileResponse.ok()).toBeTruthy();
    }
  });

  test('error handling and recovery', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('http://localhost:5173/non-existent-page');

    // Should show 404 page
    await expect(page.locator('text=Page not found')).toBeVisible();

    // Should be able to navigate back
    await page.click('text=Go Home');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('performance - page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5173');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });
});