import { test, expect } from '@playwright/test';

test.describe('App Navigation and Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the dashboard
    await page.goto('/dashboard');
  });

  test('should display the dashboard overview', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    
    // The top header
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 });
    
    // Stats cards
    await expect(page.locator('text=Sessions').first()).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
  });

  test('should navigate using the macOS Dock', async ({ page }) => {
    // Navigate via the dock by clicking the item that routes to /interview/new
    // The DockIcon has class "group relative" and contains the tooltip text "New Interview"
    const newInterviewDockIcon = page.locator('.group').filter({ hasText: 'New Interview' }).first();
    await expect(newInterviewDockIcon).toBeAttached({ timeout: 10000 });
    
    // Click the actual dock icon
    await newInterviewDockIcon.click();
    await expect(page).toHaveURL(/\/interview\/new/, { timeout: 10000 });
    
    // Check that we've reached the setup page
    await expect(page.locator('text=Choose Your Role').first()).toBeVisible({ timeout: 10000 });
  });
});
