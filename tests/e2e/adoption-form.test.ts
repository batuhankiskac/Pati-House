import { test, expect } from '@playwright/test';

test('should successfully submit adoption form', async ({ page }) => {
  // Navigate to the adoption form for the first cat
  await page.goto('/');

  // Click on the "Adopt" button of the first cat
  const adoptButton = page.locator('button', { hasText: 'Adopt' }).first();
  await adoptButton.click();

  // Wait for the adoption form page to load
  await page.waitForURL(/\/adopt\/\d+/);

  // Fill in the adoption form
  await page.getByLabel('Full Name').fill('John Doe');
  await page.getByLabel('Email').fill('john.doe@example.com');
  await page.getByLabel('Phone').fill('1234567890');
  await page.getByLabel('Address').fill('123 Main St, City, Country');
 await page.getByLabel(/why you want to adopt/).fill('I love cats and want to provide a loving home for this cat. I have experience with pets and a stable living situation.');

  // Submit the form
  await page.getByRole('button', { name: /submit/i }).click();

  // Check that we're redirected to the home page
  await expect(page).toHaveURL('/');

  // Check that a success message is displayed
  // Note: This might need to be adjusted based on how the success message is implemented
  await expect(page.getByText(/thank you for your application/i)).toBeVisible();
});

test('should show validation errors for incomplete form', async ({ page }) => {
  // Navigate to the adoption form for the first cat
  await page.goto('/');

  // Click on the "Adopt" button of the first cat
  const adoptButton = page.locator('button', { hasText: 'Adopt' }).first();
  await adoptButton.click();

  // Wait for the adoption form page to load
  await page.waitForURL(/\/adopt\/\d+/);

  // Try to submit the form without filling it
  await page.getByRole('button', { name: /submit/i }).click();

  // Check that validation errors are displayed
  await expect(page.getByText(/name is required/i)).toBeVisible();
  await expect(page.getByText(/email is required/i)).toBeVisible();
  await expect(page.getByText(/phone is required/i)).toBeVisible();
 await expect(page.getByText(/address is required/i)).toBeVisible();
 await expect(page.getByText(/reason must be at least 20 characters/i)).toBeVisible();
});

test('should show validation error for invalid email', async ({ page }) => {
  // Navigate to the adoption form for the first cat
  await page.goto('/');

  // Click on the "Adopt" button of the first cat
  const adoptButton = page.locator('button', { hasText: 'Adopt' }).first();
  await adoptButton.click();

  // Wait for the adoption form page to load
  await page.waitForURL(/\/adopt\/\d+/);

  // Fill in the form with invalid email
  await page.getByLabel('Full Name').fill('John Doe');
  await page.getByLabel('Email').fill('invalid-email');
  await page.getByLabel('Phone').fill('1234567890');
  await page.getByLabel('Address').fill('123 Main St, City, Country');
  await page.getByLabel(/why you want to adopt/).fill('I love cats and want to provide a loving home for this cat. I have experience with pets and a stable living situation.');

  // Submit the form
  await page.getByRole('button', { name: /submit/i }).click();

  // Check that validation error for email is displayed
  await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
});
