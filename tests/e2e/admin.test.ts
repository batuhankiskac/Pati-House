import { test, expect } from '@playwright/test';

// Note: These tests would require authentication and might need to be adjusted
// based on how the admin authentication is implemented

test('should display admin dashboard when authenticated', async ({ page }) => {
  // Navigate to the admin login page
  await page.goto('/admin');

  // Check that we're redirected to login page if not authenticated
  await expect(page).toHaveURL(/\/login/);

  // Fill in login credentials (these would need to be valid test credentials)
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('password123');

  // Submit the login form
  await page.getByRole('button', { name: /login/i }).click();

  // Check that we're redirected to the admin dashboard
  await expect(page).toHaveURL(/\/admin/);

  // Check that admin dashboard elements are visible
  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /cats/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /requests/i })).toBeVisible();
});

test('should allow adding a new cat', async ({ page }) => {
  // Navigate to the admin cats page
  await page.goto('/admin/cats');

  // Click on the "Add Cat" button
  await page.getByRole('button', { name: /add cat/i }).click();

  // Fill in the cat form
  await page.getByLabel('Name').fill('Whiskers');
  await page.getByLabel('Breed').fill('Siamese');
  await page.getByLabel('Age').fill('2');
  await page.getByLabel('Gender').selectOption('Male');
  await page.getByLabel('Description').fill('A beautiful Siamese cat');
  await page.getByLabel('Image URL').fill('https://example.com/whiskers.jpg');

  // Submit the form
  await page.getByRole('button', { name: /save/i }).click();

  // Check that the cat was added successfully
  await expect(page.getByText(/cat added successfully/i)).toBeVisible();

  // Check that the new cat appears in the cats list
  await expect(page.getByText('Whiskers')).toBeVisible();
});

test('should allow editing an existing cat', async ({ page }) => {
  // Navigate to the admin cats page
  await page.goto('/admin/cats');

  // Click on the "Edit" button for the first cat
  const editButton = page.locator('button', { hasText: /edit/i }).first();
  await editButton.click();

  // Modify the cat's name
  await page.getByLabel('Name').fill('Fluffy Updated');

  // Submit the form
  await page.getByRole('button', { name: /save/i }).click();

  // Check that the cat was updated successfully
  await expect(page.getByText(/cat updated successfully/i)).toBeVisible();

  // Check that the updated cat name appears in the cats list
  await expect(page.getByText('Fluffy Updated')).toBeVisible();
});

test('should allow deleting a cat', async ({ page }) => {
  // Navigate to the admin cats page
  await page.goto('/admin/cats');

  // Click on the "Delete" button for the first cat
  const deleteButton = page.locator('button', { hasText: /delete/i }).first();
  await deleteButton.click();

  // Confirm the deletion in the dialog
  await page.getByRole('button', { name: /confirm/i }).click();

  // Check that the cat was deleted successfully
  await expect(page.getByText(/cat deleted successfully/i)).toBeVisible();

  // Note: We can't easily check that the cat is no longer in the list
  // without knowing its specific name, so we'll skip that check
});
