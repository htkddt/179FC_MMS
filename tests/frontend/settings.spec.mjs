import { createRequire } from 'node:module';
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { test, expect } = require('@playwright/test');
const errorsByPage = new WeakMap();
const save = page => page.getByRole('button', { name: 'Save changes', exact: true });
const brand = page => page.locator('.sidebar .brand');

async function expectSecuritySubpageLayout(page, contextHeading) {
  await expect(page.locator('.settings-security-context')).toHaveCount(1);
  await expect(page.locator('.settings-security-context h2')).toHaveText(contextHeading);
  const actionHeights = await page.locator('.settings-subpage button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height));
  expect(actionHeights).not.toHaveLength(0);
  expect(actionHeights.every(height => height >= 44)).toBe(true);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
}

test.beforeEach(async ({ page, context }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(() => sessionStorage.setItem('179fc-demo-session', 'active'));
  await page.goto('/settings?tab=general');
  await expect(page.getByLabel('Club name')).toHaveValue('179FC');
});
test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('draft values apply to shared shell only after save and survive navigation and reload', async ({ page }) => {
  await expect(page.locator('.top-bar p')).toHaveCount(0);
  await page.getByLabel('Workspace language').selectOption('Vietnamese');
  await expect(page.getByText(/remains in English/)).toBeVisible();
  await page.getByLabel('Workspace language').selectOption('English');
  await page.getByLabel('Club name').fill('  Sample Club  ');
  await page.getByRole('switch', { name: 'Compact navigation' }).click();
  await expect(brand(page)).toHaveAttribute('aria-label', '179FC member portal');
  await expect(page.locator('.portal-shell')).not.toHaveClass(/compact/);
  const writes = await page.evaluate(async () => {
    let count = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { if (key === '179fc-demo-settings') count++; return original.call(this, key, value); };
    const form = document.querySelector('.settings-panel form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    Storage.prototype.setItem = original;
    return count;
  });
  expect(writes).toBe(1);
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(brand(page)).toHaveAttribute('aria-label', 'Sample Club member portal');
  await expect(page.locator('.portal-shell')).toHaveClass(/compact/);
  await page.getByRole('link', { name: 'Posts', exact: true }).click();
  await expect(brand(page)).toHaveAttribute('aria-label', 'Sample Club member portal');
  await page.reload();
  await expect(page.locator('.portal-shell')).toHaveClass(/compact/);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Sample Club');
});

test('validation focuses the field; cancel and discard protect tab, profile, sidebar and logout navigation', async ({ page }) => {
  await page.getByLabel('Club name').fill('   ');
  await save(page).click();
  await expect(page.getByText('Enter a club name.')).toBeVisible();
  await expect(page.getByLabel('Club name')).toBeFocused();
  await page.getByLabel('Club name').fill('Draft Club');
  expect(await page.evaluate(() => !window.dispatchEvent(new Event('beforeunload', { cancelable: true })))).toBe(true);
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep editing' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Club name')).toHaveValue('Draft Club');
  await expect(page.getByRole('tab', { name: 'Notifications' })).toBeFocused();
  await page.getByRole('link', { name: 'View profile' }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page).toHaveURL(/settings/);
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Draft Club');
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(page).toHaveURL(/tab=notifications/);
  await page.getByRole('tab', { name: 'General', exact: true }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('179FC');
  await expect(save(page)).toBeDisabled();
  await page.getByLabel('Club name').fill('Discard on logout');
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  expect(await page.evaluate(() => sessionStorage.getItem('179fc-demo-session'))).toBeNull();
});

test('keyboard tabs and browser Back/Forward restore the URL and active panel', async ({ page }) => {
  await page.getByRole('tab', { name: 'General', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/tab=notifications/);
  await expect(page.getByRole('tab', { name: 'Notifications' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page).toHaveURL(/tab=security/);
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Notifications' })).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect(page.getByRole('tabpanel')).toHaveAttribute('id', 'panel-security');
  await page.keyboard.press('Home');
});

test('notification preferences are saved without delivery claims and security flows stay UI-only', async ({ page }) => {
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await expect(page.getByRole('switch', { name: 'Assistant notifications' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('switch', { name: 'Assistant notifications' }).click();
  await page.getByRole('switch', { name: 'Weekly activity summary' }).click();
  await expect(page.getByRole('switch', { name: 'Assistant notifications' })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('switch', { name: 'Weekly activity summary' })).toHaveAttribute('aria-checked', 'true');
  await expect(save(page)).toBeEnabled();
  await save(page).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await expect(page.getByText(/does not send reminders/)).toBeVisible();
  await page.getByRole('button', { name: 'Open 179 Assist', exact: true }).click();
  await expect(page.getByLabel('Ask 179 Assist')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open 179 Assist', exact: true })).toBeFocused();
  await page.screenshot({ path: test.info().outputPath('settings-notifications.png'), fullPage: true });
  await page.getByRole('tab', { name: 'Security' }).click();
  for (const name of ['Change password', 'Set up', 'Manage sessions']) await expect(page.getByRole('button', { name, exact: true })).toBeEnabled();
  await expect(page.getByText('Not set up', { exact: true })).toBeVisible();
  await expect(save(page)).toHaveCount(0);
  await page.screenshot({ path: test.info().outputPath('settings-security.png'), fullPage: true });
  await page.getByRole('button', { name: 'Change password', exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/password$/);
  await expectSecuritySubpageLayout(page, 'Before you continue');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter your current password.')).toBeVisible();
  await expect(page.getByLabel('Current password')).toBeFocused();
  await page.getByLabel('Current password').fill('synthetic-current');
  await page.locator('input[autocomplete="new-password"]').first().fill('synthetic-new-password');
  await page.locator('input[autocomplete="new-password"]').last().fill('synthetic-new-password');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No password was changed or stored.');
  await page.getByRole('button', { name: 'Back to Security', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Change password', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Set up', exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/two-factor$/);
  await expectSecuritySubpageLayout(page, 'What happens next');
  await page.getByRole('radio', { name: /Security key/ }).check();
  await page.getByRole('button', { name: 'Start setup', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No factor was enrolled.');
  await page.getByRole('button', { name: 'Back to Security', exact: true }).click();
  await page.getByRole('button', { name: 'Manage sessions', exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/sessions$/);
  await expectSecuritySubpageLayout(page, 'Connected behavior');
  await expect(page.getByRole('alert')).toContainText('cannot show or revoke sessions');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Loading verified sessions');
  await expect(page.getByRole('alert')).toContainText('cannot show or revoke sessions');
});

test('failed writes keep draft and effective settings; retry persists and explicit Discard resets', async ({ page }) => {
  await page.evaluate(() => {
    window.originalSettingsWrite = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === '179fc-demo-settings') throw new DOMException('Synthetic quota failure', 'QuotaExceededError');
      return window.originalSettingsWrite.call(this, key, value);
    };
  });
  await page.getByLabel('Club name').fill('Retry Club');
  await page.getByRole('switch', { name: 'Compact navigation' }).click();
  await save(page).click();
  await expect(page.getByRole('status')).toContainText('Could not save');
  await expect(page.getByLabel('Club name')).toHaveValue('Retry Club');
  await expect(page.locator('.portal-shell')).not.toHaveClass(/compact/);
  await expect(brand(page)).toHaveAttribute('aria-label', '179FC member portal');
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSettingsWrite; });
  await page.getByRole('button', { name: 'Retry save' }).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
  await page.getByLabel('Club name').fill('Another draft');
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Retry Club');
});

test('malformed and denied reads require recovery and never permit overwriting defaults', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('179fc-demo-settings', '{bad json'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Could not load');
  await expect(page.getByLabel('Club name')).toHaveCount(0);
  await page.evaluate(() => localStorage.removeItem('179fc-demo-settings'));
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('179FC');
  await page.evaluate(() => {
    window.originalSettingsRead = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key === '179fc-demo-settings') throw new Error('Synthetic denied read');
      return window.originalSettingsRead.call(this, key);
    };
    window.dispatchEvent(new Event('179fc-settings-changed'));
  });
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Club name').fill('Retained draft');
  await expect(save(page)).toBeDisabled();
  await page.evaluate(() => { Storage.prototype.getItem = window.originalSettingsRead; });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Retained draft');
  await save(page).click();
  await expect(page.getByRole('status')).toHaveText('Changes saved.');
});

test('cross-tab changes refresh pristine forms, preserve dirty drafts and guard Reload latest', async ({ page, context }) => {
  const second = await context.newPage();
  await second.goto('/settings?tab=general');
  await second.getByLabel('Club name').fill('Shared Club');
  await save(second).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Shared Club');
  await page.getByLabel('Club name').fill('Local draft');
  await second.getByLabel('Club name').fill('Newer Club');
  await save(second).click();
  await expect(page.getByRole('alert')).toContainText('Settings changed');
  await expect(page.getByLabel('Club name')).toHaveValue('Local draft');
  await expect(brand(page)).toHaveAttribute('aria-label', 'Newer Club member portal');
  await expect(save(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Reload latest' }).click();
  await page.getByRole('button', { name: 'Keep editing' }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Local draft');
  await page.getByRole('button', { name: 'Reload latest' }).click();
  await page.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(page.getByLabel('Club name')).toHaveValue('Newer Club');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await second.close();
});

test('saved time zone refreshes Posts and Dashboard in another tab without rewriting dates or schedules', async ({ page, context }) => {
  const viewer = await context.newPage();
  await page.evaluate(() => {
    localStorage.setItem('179fc-posts-v1', JSON.stringify([{ id: 'sample-clock', title: 'Sample clock', content: 'Synthetic event', excerpt: 'Synthetic event', author: 'Demo Editor', type: 'file', status: 'published', updatedAt: '2026-11-03T02:00:00Z', publishedAt: '2026-11-03T02:00:00Z' }]));
    localStorage.setItem('179fc-dashboard-v1', JSON.stringify({ posts: [], events: [{ id: 'sample-event', title: 'Synthetic session', date: '2026-11-03', time: '02:00', location: 'Demo ground' }] }));
  });
  await viewer.goto('/posts');
  await expect(viewer.locator('.posts-item__author time')).toContainText('09:00');
  await page.getByRole('combobox', { name: 'Time zone', exact: true }).selectOption('UTC');
  await save(page).click();
  await expect(viewer.locator('.posts-item__author time')).toContainText('02:00');
  await viewer.goto('/dashboard');
  await expect(viewer.locator('.upcoming-event__date')).toContainText('2');
  await expect(viewer.locator('.session-details__date')).toContainText('19:00 (UTC)');
  const event = await viewer.evaluate(() => JSON.parse(localStorage.getItem('179fc-dashboard-v1')).events[0]);
  expect(event.date).toBe('2026-11-03');
  expect(event.time).toBe('02:00');
  await viewer.close();
});

test('Account, TopBar, Sidebar and profile use the same canonical avatar and ID', async ({ page, context }) => {
  const profile = await context.newPage();
  await profile.goto('/employees/tuan-kiet');
  await profile.locator('#member-avatar').setInputFiles({ name: 'synthetic-avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8V8AAAAASUVORK5CYII=', 'base64') });
  await profile.getByLabel('Date of birth').fill('2000-01-02');
  await profile.getByRole('button', { name: 'Save changes', exact: true }).click();
  for (const selector of ['.settings-account img', '.sidebar__user img', '.user-trigger img']) await expect(page.locator(selector)).toHaveAttribute('src', /^data:image\/png;base64,/);
  await page.getByRole('link', { name: 'View profile', exact: true }).click();
  await expect(page).toHaveURL(/\/employees\/tuan-kiet$/);
  await expect(page.getByLabel('Date of birth')).toHaveValue('2000-01-02');
  await profile.close();
});

test('Post Create labels its input zone and Post Edit refreshes display without rescheduling', async ({ page, context }) => {
  await page.evaluate(() => localStorage.setItem('179fc-posts-v1', JSON.stringify([{
    id: 'sample-scheduled', title: 'Synthetic schedule', content: 'Future update', author: 'Demo Editor', type: 'file',
    status: 'draft', updatedAt: '2026-11-03T02:00:00Z', scheduledAt: '2099-11-03T02:00:00Z',
  }])));
  const editor = await context.newPage();
  await editor.goto('/posts/sample-scheduled/edit');
  await expect(editor.locator('.post-scheduled-note')).toContainText('09:00');
  await page.getByRole('combobox', { name: 'Time zone', exact: true }).selectOption('UTC');
  await save(page).click();
  await expect(editor.locator('.post-scheduled-note')).toContainText('02:00');
  expect(await editor.evaluate(() => JSON.parse(localStorage.getItem('179fc-posts-v1'))[0].scheduledAt)).toBe('2099-11-03T02:00:00Z');
  await editor.goto('/posts/new');
  await editor.getByLabel(/Schedule for later/).check();
  await expect(editor.getByText('Publication date and time (device time zone)', { exact: true })).toBeVisible();
  await expect(editor.locator('input[type="datetime-local"]')).toBeVisible();
  await editor.close();
});

test('Vietnamese preference is persisted with an explicit English fallback', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('179fc-demo-settings', JSON.stringify({ language: 'Vietnamese' })));
  await page.reload();
  await expect(page.getByLabel('Workspace language')).toHaveValue('Vietnamese');
  await expect(page.getByText(/remains in English/)).toBeVisible();
  await page.getByLabel('Club name').fill('Legacy Club');
  await save(page).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('179fc-demo-settings')).language)).toBe('Vietnamese');
  await page.getByLabel('Workspace language').selectOption('English');
  await save(page).click();
  await expect(page.getByText(/remains in English/)).toHaveCount(0);
});

test('all tabs fit mobile/tablet/desktop, enlarged text and reduced motion with accessible drawer', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const name of ['General', 'Notifications', 'Security']) {
      await page.getByRole('tab', { name, exact: true }).click();
      const bounds = await page.evaluate(() => ({ actual: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect(bounds.actual).toBeLessThanOrEqual(bounds.viewport + 1);
    }
  }
  await page.getByRole('tab', { name: 'General', exact: true }).click();
  await page.screenshot({ path: test.info().outputPath('settings-general.png'), fullPage: true });
  expect(await page.locator('.settings-panel').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('dialog', { name: 'Navigation', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  for (const name of ['General', 'Notifications', 'Security']) {
    await page.getByRole('tab', { name, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  await page.getByRole('tab', { name: 'General', exact: true }).click();
  await page.screenshot({ path: test.info().outputPath('settings-mobile.png'), fullPage: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('tab', { name: 'Notifications' }).click();
  await expect(page.locator('.settings-panel')).toHaveCSS('animation-name', 'settings-panel-arrive');
});
