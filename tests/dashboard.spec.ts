import { test, expect } from '@playwright/test';

test.describe('Dashboard UI', () => {
  test('should display dashboard correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Check for title
    await expect(page).toHaveTitle(/Languro/);

    // Check for key elements
    await expect(page.getByText('Welcome back, User!')).toBeVisible();

    // Check Sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('Overview');
    await expect(sidebar).toContainText('Conjugation');

    // Check Stats
    await expect(page.getByText('Total Conjugations')).toBeVisible();
    await expect(page.getByText('Words Learned')).toBeVisible();
  });
});
