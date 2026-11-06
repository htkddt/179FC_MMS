import { createRequire } from 'node:module';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { test, expect } = require('@playwright/test');
const errorsByPage = new WeakMap();

async function openHelp(page) {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await page.getByRole('link', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quick guides', exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  await openHelp(page);
});

test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('Help Center omits its subtitle and keeps keyboard-accessible destinations', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Help Center' })).toBeVisible();
  await expect(page.locator('.top-bar p')).toHaveCount(0);
  await expect(page.getByRole('searchbox', { name: 'Search help articles' })).toBeEnabled();
  await expect(page.locator('.help-guide-card')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Go to Create a post' })).toHaveCSS('min-height', '44px');

  const article = page.getByRole('link', { name: 'How to invite new members' });
  await expect(article).toBeVisible();
  expect((await article.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await article.click();
  await expect(page).toHaveURL(/\/help\/articles\/invite-members$/);
});

test('Help articles use one semantic template with matching anchors and recovery', async ({ page }) => {
  await page.getByRole('link', { name: 'How to invite new members' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Help Center' })).toBeVisible();
  await expect(page.locator('.top-bar p')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'How to invite new members' })).toBeVisible();
  const currentTarget = page.locator('.help-article__toc a[aria-current="location"]');
  await expect(currentTarget).toHaveText('Open Employees');
  await expect(currentTarget).toHaveAttribute('href', '#open-employees');
  await expect(page.locator('#open-employees')).toContainText('Go to the Employees workspace from the sidebar.');
  await expect(page.getByLabel('Demo service boundary')).toContainText('Invitation delivery is not connected in this demo.');
  await expect(page.getByRole('link', { name: 'How to update your club profile' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Help Center' })).toBeVisible();

  await page.goto('/help/articles/missing-article');
  await expect(page.getByRole('heading', { level: 2, name: 'Help article not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to Help Center' })).toBeVisible();
});

test('Contact support keeps a usable local form without inventing a submission', async ({ page }) => {
  await page.getByRole('link', { name: 'Contact support', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Contact support' })).toBeVisible();
  await expect(page.locator('.top-bar p')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 2, name: 'Tell us how we can help' })).toBeVisible();
  await expect(page.getByLabel('Topic')).toBeEnabled();
  await expect(page.getByLabel('Relevant page (optional)')).toBeEnabled();
  await expect(page.getByLabel('What happened?')).toBeEnabled();
  await expect(page.getByLabel('Support service boundary')).toContainText('This form will not send a request.');
  await expect(page.getByRole('button', { name: 'Support service unavailable' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'How to update your club profile' })).toBeVisible();
});

test('Help search filters content and preserves Contact support as empty-state recovery', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search help articles' });
  await search.fill('invite');
  await expect(page.getByRole('link', { name: 'How to invite new members' })).toBeVisible();
  await expect(page.locator('.popular-article-link')).toHaveCount(1);
  await search.fill('no matching help');
  await expect(page.getByRole('status')).toHaveText('No help articles match your search. Try another keyword or contact support.');
  await expect(page.getByRole('link', { name: 'Contact support', exact: true })).toBeVisible();
  await expect(search).toBeFocused();
});

test('Help is responsive and only animates when reduced motion is not requested', async ({ page }) => {
  await expect(page.locator('.help-page')).toHaveCSS('animation-name', 'none');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(await page.locator('.help-guides').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length)).toBe(1);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.getByRole('link', { name: 'Help', exact: true }).click();
  await expect(page.locator('.help-page')).toHaveCSS('animation-name', 'help-page-arrive');
  await expect(page.locator('.help-guide-card').first()).toHaveCSS('animation-name', 'help-guide-arrive');
  const search = page.getByRole('searchbox', { name: 'Search help articles' });
  await search.fill('member');
  await expect(page.locator('.help-guide-card')).toHaveCSS('animation-name', 'none');
  await search.fill('');
  await expect(page.locator('.help-guide-card').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.help-lower-grid')).toHaveCSS('animation-name', 'none');
});
