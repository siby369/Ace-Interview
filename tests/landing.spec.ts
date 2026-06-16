import { test, expect } from '@playwright/test';

test.describe('Landing Page UI', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the landing page
    await page.goto('/');
  });

  test('should display the main headline', async ({ page }) => {
    // The WordPullUp component renders "Ace Your Next Interview." word by word in span tags
    // Let's verify that the words appear in the DOM
    await expect(page.locator('span', { hasText: 'Ace' }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('span', { hasText: 'Your' }).first()).toBeVisible();
    await expect(page.locator('span', { hasText: 'Next' }).first()).toBeVisible();
  });

  test('should have a working primary CTA button', async ({ page }) => {
    // Look for the "Start Practicing Free" button
    const ctaButton = page.getByRole('button', { name: /Start Practicing Free/i });
    await expect(ctaButton).toBeVisible();
    
    // Test navigation to the new interview page
    await ctaButton.click();
    await expect(page).toHaveURL(/\/interview\/new/);
  });

  test('should render the bento grid features', async ({ page }) => {
    // Verify one of the feature cards
    await expect(page.getByRole('heading', { name: 'AI Interview Personas' })).toBeVisible();
    await expect(page.getByText('Choose from friendly, formal, or aggressive interviewers.')).toBeVisible();
  });

  test('should render the Safari mockup', async ({ page }) => {
    // The Safari mock has a simulated URL bar and mock interview UI
    await expect(page.getByText('app.aceinterview.ai')).toBeVisible();
    await expect(page.getByText('Question 3 of 5')).toBeVisible();
  });
});
