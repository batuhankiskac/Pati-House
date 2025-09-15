import { test, expect } from '@playwright/test';

test('should display the home page correctly', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Pati/);

  // Check that the main heading is visible
  await expect(page.getByRole('heading', { name: 'Pati' })).toBeVisible();

  // Check that the cat cards are displayed
  const catCards = page.locator('[data-testid="cat-card"]');
  await expect(catCards.first()).toBeVisible();

  // Check that the "Adopt" button is visible on cat cards
  const adoptButtons = page.locator('button', { hasText: 'Adopt' });
  await expect(adoptButtons.first()).toBeVisible();
});

test('should navigate to cat details page when clicking on a cat card', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Click on the first cat card
  const firstCatCard = page.locator('[data-testid="cat-card"]').first();
  await firstCatCard.click();

  // Check that we're on the cat details page
  await expect(page).toHaveURL(/\/cats\/\d+/);
});

test('should navigate to the adoption form when clicking "Adopt" button', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Click on the "Adopt" button of the first cat
  const adoptButton = page.locator('button', { hasText: 'Adopt' }).first();
  await adoptButton.click();

  // Check that we're on the adoption form page
  await expect(page).toHaveURL(/\/adopt\/\d+/);
});
