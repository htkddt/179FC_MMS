import { createRequire } from 'node:module';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { test, expect } = require('@playwright/test');

test('Guest access keeps public routes open and returns to a protected destination after demo sign-in', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign up', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open user menu' })).toHaveCount(0);

  for (const route of ['/posts', '/settings', '/help']) {
    await page.goto(route);
    await expect.poll(() => new URL(page.url()).pathname).toBe(route);
  }
  await expect(page.getByRole('heading', { level: 1, name: 'Help Center' })).toBeVisible();

  await page.goto('/employees');
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await expect(page).toHaveURL(/\/employees$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Employees' })).toBeVisible();
});

test('Guest routes protect Organization and authenticated logout restores the guest dashboard', async ({ page }) => {
  await page.goto('/organization');
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await expect(page).toHaveURL(/\/organization$/);

  await page.getByRole('button', { name: 'Open user menu' }).click();
  const menu = page.locator('.user-menu');
  await expect(menu.getByRole('button', { name: 'Help center' })).toBeVisible();
  await expect(menu.locator('.user-menu__divider--section')).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Log out' })).toHaveCSS('text-align', 'left');
  await menu.getByRole('button', { name: 'Log out' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('link', { name: 'Sign up', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Log in', exact: true })).toBeVisible();
  await page.goto('/organization');
  await expect(page).toHaveURL(/\/sign-in$/);
});

test('Demo sign-in rejects unsafe return targets without leaving the Sign-in flow', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  const unsafeReturnTo = String.fromCharCode(47, 92, 92) + 'example.test/qa';

  await page.goto('/sign-in');
  await page.evaluate((returnTo) => {
    const currentState = window.history.state || {};
    window.history.replaceState({ ...currentState, usr: { returnTo } }, '', '/sign-in');
  }, unsafeReturnTo);
  await page.reload();
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('179fc-demo-session'))).toBe('active');
  expect(pageErrors).toEqual([]);
});
