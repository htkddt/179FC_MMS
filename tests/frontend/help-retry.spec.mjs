import { createRequire } from 'node:module';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { test, expect } = require('@playwright/test');
const errorsByPage = new WeakMap();

const mockHelpApi = `
const guides = [{ icon: 'pen', title: 'Create a post', description: 'Publish updates and keep your club informed.', to: '/posts/new' }];
const articles = [{ id: 'invite-members', title: 'How to invite new members' }];
let calls = 0;
let relatedCalls = 0;
export async function getHelp() {
  calls += 1;
  if (calls <= 2 || sessionStorage.getItem('179fc-test-help-retry-fails') === 'true') throw new Error('Synthetic help load failure');
  return { guides, articles };
}
export async function getHelpArticle() { return null; }
export async function getHelpRelatedArticles() {
  relatedCalls += 1;
  if (sessionStorage.getItem('179fc-test-help-related-fails') === 'true' && relatedCalls <= 2) throw new Error('Synthetic related articles failure');
  return articles;
}
`;

async function openHelpWithMock(page, retryFails) {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((shouldRetryFail) => sessionStorage.setItem('179fc-test-help-retry-fails', String(shouldRetryFail)), retryFails);
  await page.route('**/src/features/help/api/helpApi.js**', (route) => route.fulfill({ contentType: 'application/javascript', body: mockHelpApi }));
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await page.getByRole('link', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Could not load help content');
}

async function openSupportWithMock(page) {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem('179fc-test-help-related-fails', 'true'));
  await page.route('**/src/features/help/api/helpApi.js**', (route) => route.fulfill({ contentType: 'application/javascript', body: mockHelpApi }));
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await page.goto('/help/support');
}

test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('Retry focuses enabled search after a successful Help reload', async ({ page }) => {
  await openHelpWithMock(page, false);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quick guides', exact: true })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Search help articles' })).toBeFocused();
});

test('Retry keeps focus on Retry when the Help reload fails again', async ({ page }) => {
  await openHelpWithMock(page, true);
  const retry = page.getByRole('button', { name: 'Retry', exact: true });
  await retry.click();
  await expect(page.getByRole('alert')).toContainText('Could not load help content');
  await expect(retry).toBeFocused();
});

test('Support retries related articles through its adapter', async ({ page }) => {
  await openSupportWithMock(page);
  await expect(page.getByRole('alert')).toContainText('Could not load related articles');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('link', { name: 'How to invite new members' })).toBeVisible();
});
