import { expect, test, type Page } from '@playwright/test';

const password = 'Market-Test-Passphrase-9';

async function signUp(page: Page, identity: string, displayName: string) {
  await page.goto('/auth/signup');

  await page.getByLabel('Display name').fill(displayName);
  await page.getByLabel('Handle').fill(identity);
  await page.getByLabel('Email').fill(`${identity}@example.test`);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Town / suburb').fill('Richards Bay');
  await page.getByLabel('Province / region').fill('KwaZulu-Natal');

  await Promise.all([
    page.waitForURL(/\/auth\/check-email/, { timeout: 30_000 }),
    page.getByRole('button', { name: /Create account/ }).click()
  ]);
}

test('seller publishes, buyer favourites and contacts, seller marks sold', async ({
  page
}, testInfo) => {
  test.setTimeout(120_000);

  const projectCode = testInfo.project.name.startsWith('mobile') ? 'm' : 'd';
  const run = `${Date.now()}${projectCode}`;
  const seller = `seller-${run}`;
  const buyer = `buyer-${run}`;
  const title = `Workshop tool set ${run}`;

  await signUp(page, seller, 'Test Seller');

  await page.goto('/sell');
  await page.getByLabel('Listing title').fill(title);
  await page.getByLabel('Category').selectOption('other');

  await Promise.all([
    page.waitForURL(/\/sell\/[a-f0-9-]+/, { timeout: 30_000 }),
    page.getByRole('button', { name: /Continue/ }).click()
  ]);

  await page
    .getByLabel('Description')
    .fill('A complete, honestly described workshop tool set in very good working condition.');

  await page.getByLabel('Price (R)').fill('2450');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page.getByText('Draft saved.')).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles('static/icons/icon-192.png');

  await expect(page.getByText('Cover', { exact: true })).toBeVisible({
    timeout: 30_000
  });

  await Promise.all([
    page.waitForURL(/\/listings\/.+/, { timeout: 30_000 }),
    page.getByRole('button', { name: 'Publish listing' }).click()
  ]);

  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const listingUrl = page.url();

  await page.goto('/you');
  await page.getByRole('button', { name: 'Sign out' }).click();

  await signUp(page, buyer, 'Test Buyer');
  await page.goto(listingUrl);

  await page.getByRole('button', { name: 'Add to favourites' }).click();
  await expect(page.getByRole('button', { name: 'Remove from favourites' })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/messages\/[a-f0-9-]+/, { timeout: 30_000 }),
    page.getByRole('button', { name: 'Message seller' }).first().click()
  ]);

  await page.getByLabel('Message').fill('Hello, is this tool set still available?');

  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByText('Hello, is this tool set still available?')).toBeVisible();

  await page.goto('/you');
  await page.getByRole('button', { name: 'Sign out' }).click();

  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(`${seller}@example.test`);
  await page.getByLabel('Password').fill(password);

  await page
    .locator('form')
    .getByRole('button', { name: /Sign in/ })
    .click();

  await page.goto('/you/listings');

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Mark sold' }).click();
  await expect(page.getByText('sold', { exact: true })).toBeVisible();
});
