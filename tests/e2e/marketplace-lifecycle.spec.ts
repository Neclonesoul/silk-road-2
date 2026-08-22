import { expect, test, type Page } from '@playwright/test';

const password = 'Market-Test-Passphrase-9';

async function expectNavigationOrExplain(page: Page, expected: RegExp, context: string) {
  try {
    await expect(page).toHaveURL(expected);
  } catch {
    const alerts = await page.locator('.alert').allTextContents();
    const messages = alerts.map((value) => value.trim()).filter(Boolean);
    const serverMessage = messages.join(' | ') || 'No visible form error was returned.';
    throw new Error(`${context} failed at ${page.url()}. Server message: ${serverMessage}`);
  }
}

async function signUp(page: Page, identity: string, displayName: string) {
  await page.goto('/auth/signup');
  await page.getByLabel('Display name').fill(displayName);
  await page.getByLabel('Handle').fill(identity);
  await page.getByLabel('Email').fill(`${identity}@example.test`);
  await page.getByLabel('Password').fill(password);
  await page.getByLabel('Town / suburb').fill('Richards Bay');
  await page.getByLabel('Province / region').fill('KwaZulu-Natal');
  await page.getByRole('button', { name: /Create account/ }).click();
  await expectNavigationOrExplain(page, /\/auth\/check-email/, 'Account creation');
}

test('seller publishes, buyer favourites and contacts, seller marks sold', async ({
  page
}, testInfo) => {
  test.setTimeout(90_000);
  const run = `${Date.now()}${testInfo.project.name.startsWith('mobile') ? 'm' : 'd'}`;
  const seller = `seller-${run}`;
  const buyer = `buyer-${run}`;
  const title = `Workshop tool set ${run}`;

  await signUp(page, seller, 'Test Seller');
  await page.goto('/sell');
  await page.getByLabel('Listing title').fill(title);
  await page.getByLabel('Category').selectOption('other');
  const draftForm = page.locator('form.start');
  const draftFormValid = await draftForm.evaluate((form) =>
    (form as HTMLFormElement).checkValidity()
  );
  const draftResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/sell'
  );
  await page.getByRole('button', { name: /Continue/ }).click();
  const draftResponse = await draftResponsePromise;
  const draftBody = (await draftResponse.text()).replace(/\\s+/g, ' ').slice(0, 800);
  console.log(
    `DRAFT_DIAGNOSTIC valid=${draftFormValid} status=${draftResponse.status()} body=${draftBody}`
  );
  await expectNavigationOrExplain(page, /\/sell\/[a-f0-9-]+/, 'Draft creation');

  await page
    .getByLabel('Description')
    .fill('A complete, honestly described workshop tool set in very good working condition.');
  await page.getByLabel('Price (R)').fill('2450');
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page.getByText('Draft saved.')).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles('static/icons/icon-192.png');
  await expect(page.getByText('Cover', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Publish listing' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const listingUrl = page.url();

  await page.goto('/you');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await signUp(page, buyer, 'Test Buyer');
  await page.goto(listingUrl);
  await page.getByRole('button', { name: 'Add to favourites' }).click();
  await expect(page.getByRole('button', { name: 'Remove from favourites' })).toBeVisible();
  await page.getByRole('button', { name: 'Message seller' }).first().click();
  await expect(page).toHaveURL(/\/messages\/[a-f0-9-]+/);
  await page.getByLabel('Message').fill('Hello, is this tool set still available?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Hello, is this tool set still available?')).toBeVisible();

  await page.goto('/you');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(`${seller}@example.test`);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign in/ }).click();
  await page.goto('/you/listings');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Mark sold' }).click();
  await expect(page.getByText('sold', { exact: true })).toBeVisible();
});
