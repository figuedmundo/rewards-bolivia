import { test, expect } from '@playwright/test';

test.describe('User Journey: Authentication', () => {
  test('should allow a user to log in successfully', async ({ page }) => {
    // Mock the API response for the login request
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'mock-e2e-token' }),
      });
    });

    // Navigate to the login page
    await page.goto('/login');

    // Verify we are on the login page
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

    // Fill in the login form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    // Click the login button
    await page.getByRole('button', { name: 'Login' }).click();

    // After successful login, the user should be on the home page
    // and see the "Logout" button.
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

    // The URL should now be the root path
    await expect(page).toHaveURL('/');
  });
});
