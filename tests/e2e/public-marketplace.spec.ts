import { expect, test } from '@playwright/test';

test('visitor reaches inventory immediately and can search', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Find it\. Sell it\./ })).toBeVisible();
  await expect(page.getByRole('search')).toBeVisible();
  await page.getByRole('link', { name: 'Search', exact: true }).first().click();
  await expect(page).toHaveURL(/\/search/);
  await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();
});

test('new-marketplace empty state is honest', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/marketplace is new/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sell something' })).toBeVisible();
});

test('authentication surfaces are complete and keyboard reachable', async ({ page }) => {
  await page.goto('/auth/signup');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toHaveAttribute('minlength', '12');
  await page.goto('/auth/login');
  await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
});
