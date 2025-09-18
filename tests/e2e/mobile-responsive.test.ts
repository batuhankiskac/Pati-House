import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  test('Header navigation should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check that mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label="Menüyü aç"]');
    await expect(mobileMenuButton).toBeVisible();

    // Check that desktop navigation is hidden
    const desktopNav = page.locator('nav[aria-label="Ana navigasyon"]');
    await expect(desktopNav).toBeHidden();
  });

  test('Admin sidebar should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Login first
    await page.goto('/login');
    await page.fill('#username', 'Hill');
    await page.fill('#password', 'Yula.2024');
    await page.click('button[type="submit"]');

    // Navigate to admin page
    await page.goto('/admin');

    // Check that mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label="Menüyü aç"]');
    await expect(mobileMenuButton).toBeVisible();
  });

  test('Cat cards should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check that cat cards are displayed properly
    const catCards = page.locator('[role="article"]');
    await expect(catCards.first()).toBeVisible();

    // Check that grid layout is single column on mobile
    const gridContainer = page.locator('.grid');
    const classes = await gridContainer.first().getAttribute('class');
    expect(classes).toContain('grid-cols-1');
  });

  test('Adoption form should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/cats/1');
    await page.click('text=Sahiplen');

    // Check that form fields are accessible
    const fullNameInput = page.locator('input[name="fullName"]');
    await expect(fullNameInput).toBeVisible();

    // Check that form layout is single column on mobile
    const formGrid = page.locator('div.grid');
    const classes = await formGrid.getAttribute('class');
    expect(classes).toContain('grid-cols-1');
  });

  test('Cat filters should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check that filters are displayed properly
    const filterInputs = page.locator('input, select');
    await expect(filterInputs.first()).toBeVisible();

    // Check that grid layout is single column on mobile
    const filterGrid = page.locator('.grid');
    const classes = await filterGrid.getAttribute('class');
    expect(classes).toContain('grid-cols-1');
  });
});
