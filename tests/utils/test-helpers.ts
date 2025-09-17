// Test helper functions

import { Page, expect } from '@playwright/test';

/**
 * Helper function to login as an admin user
 */
export async function loginAsAdmin(page: Page, username: string = 'admin', password: string = 'password123') {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);

  // Submit login form
  await page.getByRole('button', { name: /login/i }).click();

  // Wait for navigation to admin dashboard
  await page.waitForURL(/\/admin/);
}

/**
 * Helper function to create a test cat via the admin interface
 */
export async function createTestCat(page: Page, catData: { name: string; breed: string; age: string; gender: string; description: string; image: string }) {
  // Navigate to admin cats page
  await page.goto('/admin/cats');

  // Click "Add Cat" button
  await page.getByRole('button', { name: /add cat/i }).click();

  // Fill in cat form
  await page.getByLabel('Name').fill(catData.name);
 await page.getByLabel('Breed').fill(catData.breed);
  await page.getByLabel('Age').fill(catData.age);
 await page.getByLabel('Gender').selectOption(catData.gender);
  await page.getByLabel('Description').fill(catData.description);
  await page.getByLabel('Image URL').fill(catData.image);

  // Submit form
  await page.getByRole('button', { name: /save/i }).click();

  // Wait for success message
  await page.waitForSelector('[data-testid="success-message"]');
}

/**
 * Helper function to adopt a cat
 */
export async function adoptCat(page: Page, catIndex: number = 0) {
  // Navigate to home page
  await page.goto('/');

  // Click "Adopt" button on the specified cat card
  const adoptButtons = page.locator('button', { hasText: 'Adopt' });
  const adoptButton = adoptButtons.nth(catIndex);
  await adoptButton.click();

  // Wait for adoption form page
  await page.waitForURL(/\/adopt\/\d+/);
}

/**
 * Helper function to fill and submit adoption form
 */
export async function submitAdoptionForm(page: Page, formData: { fullName: string; email: string; phone: string; address: string; reason: string }) {
  // Fill in adoption form
  await page.getByLabel('Full Name').fill(formData.fullName);
  await page.getByLabel('Email').fill(formData.email);
  await page.getByLabel('Phone').fill(formData.phone);
  await page.getByLabel('Address').fill(formData.address);
  await page.getByLabel(/why you want to adopt/i).fill(formData.reason);

 // Submit form
  await page.getByRole('button', { name: /submit/i }).click();

  // Wait for success message or redirection
  await page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
}

/**
 * Helper function to wait for and check success message
 */
export async function checkSuccessMessage(page: Page, messageText: string | RegExp) {
  const successMessage = page.getByTestId('success-message');
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toContainText(messageText);
}

/**
 * Helper function to wait for and check error message
 */
export async function checkErrorMessage(page: Page, messageText: string | RegExp) {
  const errorMessage = page.getByTestId('error-message');
 await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText(messageText);
}
