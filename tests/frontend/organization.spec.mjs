import { createRequire } from 'node:module';
const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { test, expect } = require('@playwright/test');
const card = (page, id) => page.locator(`[data-member-id="${id}"]`);
const frame = (page, name) => page.locator('.organization-team-frame').filter({ has: page.getByRole('heading', { name, exact: true }) });
const point = node => node.evaluate(element => ({ x: parseFloat(element.style.left), y: parseFloat(element.style.top) }));
const errorsByPage = new WeakMap();

async function moveWithMenu(page, name, target) {
  await page.getByRole('button', { name: `Options for ${name}`, exact: true }).click();
  await page.getByRole('menuitem', { name: 'Move to team', exact: true }).click();
  await page.getByRole('menuitem', { name: target, exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: `${name} moved` })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  errorsByPage.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await page.getByRole('link', { name: 'Organization', exact: true }).click();
  await expect(page.locator('.organization-node')).toHaveCount(30);
});
test.afterEach(async ({ page }) => { expect(errorsByPage.get(page)).toEqual([]); });

test('clean toolbar stretches Search to the filter and removes grid dots, tabs and legend', async ({ page }) => {
  await expect(page.locator('.organization-views')).toHaveCount(0);
  await expect(page.getByText('Team connections', { exact: true })).toHaveCount(0);
  await expect(page.locator('.top-bar p')).toHaveCount(0);
  await expect(page.locator('.organization-summary dd')).toHaveText(['30', '8', '11']);
  const search = await page.locator('.organization-search').boundingBox();
  const filter = await page.locator('.organization-team-filter').boundingBox();
  expect(filter.x - search.x - search.width).toBeLessThan(20);
  expect(await page.locator('.organization-chart-scroll').evaluate(element => getComputedStyle(element).backgroundImage)).toBe('none');
  await page.screenshot({ path: test.info().outputPath('organization-desktop.png'), fullPage: true });
});

test('right mouse button does not open actions; ellipsis opens the menu and Profile', async ({ page }) => {
  const node = card(page, 'thu-le');
  const before = await point(node);
  await node.locator('.organization-node__move').click({ button: 'right' });
  await expect(page.getByRole('menu')).toHaveCount(0);
  expect(await point(node)).toEqual(before);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Options for Thu Le' }).click();
  await expect(page.getByRole('menuitem')).toHaveText(['Profile', 'View team', 'Move to team', 'Reset position']);
  await page.screenshot({ path: test.info().outputPath('organization-member-menu.png') });
  await page.getByRole('menuitem', { name: 'Profile', exact: true }).click();
  await expect(page).toHaveURL(/\/employees\/thu-le$/);
});

test('search and team filters recover from no results', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: 'Search organization members' });
  await search.fill('thu.le@179fc.vn');
  await expect(page.locator('.organization-node')).toHaveCount(1);
  await search.fill('');
  await page.getByRole('combobox', { name: 'Filter by team' }).selectOption('Medical');
  await expect(page.locator('.organization-node')).toHaveCount(2);
  await search.fill('no-such-member');
  await expect(page.getByRole('heading', { name: 'No members found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.organization-node')).toHaveCount(30);
});

test('team collapse, hide, show and zoom persist and leave membership intact', async ({ page }) => {
  await page.getByRole('button', { name: 'Collapse Management members', exact: true }).click();
  await expect(card(page, 'thu-le')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Show Management members' })).toHaveAttribute('aria-expanded', 'false');
  await page.reload();
  await expect(card(page, 'thu-le')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show Management members' }).click();
  await expect(card(page, 'thu-le')).toBeVisible();
  await page.getByRole('button', { name: 'Zoom in Management team', exact: true }).click();
  await expect(card(page, 'thu-le')).toHaveCSS('transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)');
  await page.reload();
  await expect(card(page, 'thu-le')).toHaveCSS('transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)');
  await page.getByRole('button', { name: 'Zoom out Management team', exact: true }).click();
  await expect(card(page, 'thu-le')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.getByRole('button', { name: 'Hide Management team', exact: true }).click();
  await expect(frame(page, 'Management')).toHaveCount(0);
  await expect(card(page, 'thu-le')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Show Management', exact: true }).click();
  await expect(card(page, 'thu-le')).toBeVisible();
  await expect(page.locator('.organization-summary dd')).toHaveText(['30', '8', '11']);
});

test('team expand focuses a larger chart and All teams restores the full view', async ({ page }) => {
  await page.getByRole('button', { name: 'Expand Management team chart' }).click();
  await expect(page.locator('.organization-board')).toHaveClass(/organization-board--expanded/);
  await expect(page.locator('.organization-node')).toHaveCount(3);
  await page.getByRole('button', { name: 'All teams', exact: true }).click();
  await expect(page.locator('.organization-node')).toHaveCount(30);
  await page.getByRole('button', { name: 'Exit expanded chart' }).click();
  await expect(page.locator('.organization-board')).not.toHaveClass(/organization-board--expanded/);
  await page.getByRole('button', { name: 'Expand chart', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.organization-board')).not.toHaveClass(/organization-board--expanded/);
});

test('zoom-aware dragging persists relative positions and Reset position restores its team slot', async ({ page }) => {
  const node = card(page, 'thu-le');
  const before = await point(node);
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  const zoom = await page.locator('.organization-canvas').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a);
  const box = await node.locator('.organization-node__move').boundingBox();
  const paths = await page.locator('.organization-connections').innerHTML();
  await page.mouse.move(box.x + 35, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 55, box.y + 55, { steps: 8 });
  await page.mouse.up();
  const after = await point(node);
  expect(after.x - before.x).toBeCloseTo(20 / zoom, 0);
  expect(after.y - before.y).toBeCloseTo(25 / zoom, 0);
  expect(await page.locator('.organization-connections').innerHTML()).not.toBe(paths);
  await page.reload();
  expect(await point(card(page, 'thu-le'))).toEqual(after);
  await page.getByRole('button', { name: 'Options for Thu Le' }).click();
  await page.getByRole('menuitem', { name: 'Reset position' }).click();
  expect(await point(card(page, 'thu-le'))).toEqual(before);
});

test('dropping into a different team updates Employees, profile, counts and reload data', async ({ page }) => {
  const box = await card(page, 'thu-le').locator('.organization-node__move').boundingBox();
  const target = await frame(page, 'First Team').boundingBox();
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(target.x + 90, target.y + 35, { steps: 12 });
  await expect(frame(page, 'First Team')).toHaveClass(/drop-target/);
  await page.mouse.up();
  await expect(card(page, 'thu-le').locator('.organization-node__team')).toHaveText('First Team');
  await expect(frame(page, 'First Team').locator('.organization-team-header__title > span')).toHaveText('12');
  await expect(frame(page, 'Management').locator('.organization-team-header__title > span')).toHaveText('2');
  await page.reload();
  await expect(card(page, 'thu-le').locator('.organization-node__team')).toHaveText('First Team');
  await page.getByRole('link', { name: 'Employees', exact: true }).click();
  const employee = page.locator('.employee-card').filter({ hasText: 'Thu Le' });
  await expect(employee).toContainText('First Team');
  await employee.click();
  await expect(page.getByRole('combobox', { name: 'Team', exact: true })).toHaveValue('First Team');
});

test('menu transfer preserves edited fields and updates another open Employees tab', async ({ page, context }) => {
  await page.getByRole('button', { name: 'Options for Thu Le' }).click();
  await page.getByRole('menuitem', { name: 'Profile', exact: true }).click();
  await page.getByRole('textbox', { name: 'Phone number' }).fill('+84 900123456');
  await page.locator('#member-avatar').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9s8AAAAASUVORK5CYII=', 'base64') });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('link', { name: 'Organization', exact: true }).click();
  const directory = await context.newPage();
  await directory.goto('/sign-in');
  await directory.getByRole('button', { name: 'Sign in to 179FC' }).click();
  await directory.getByRole('link', { name: 'Employees', exact: true }).click();
  await moveWithMenu(page, 'Thu Le', 'Media');
  await expect(card(page, 'thu-le').locator('.organization-node__team')).toHaveText('Media');
  await expect(card(page, 'thu-le').locator('img')).toHaveAttribute('src', /^data:image\/png/);
  await expect(directory.locator('.employee-card').filter({ hasText: 'Thu Le' })).toContainText('Media');
  await page.getByRole('button', { name: 'Options for Thu Le' }).click();
  await page.getByRole('menuitem', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Phone number' })).toHaveValue('+84 900123456');
  await expect(page.getByRole('combobox', { name: 'Team', exact: true })).toHaveValue('Media');
  await directory.close();
});

test('dragging a scaled card at a changed canvas zoom transfers to a collapsed team', async ({ page }) => {
  await page.getByRole('button', { name: 'Collapse First Team members', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom in Management team', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  const source = await card(page, 'thu-le').locator('.organization-node__move').boundingBox();
  const target = await frame(page, 'First Team').boundingBox();
  await page.mouse.move(source.x + 35, source.y + 30);
  await page.mouse.down();
  await page.mouse.move(target.x + 70, target.y + 35, { steps: 10 });
  await expect(frame(page, 'First Team')).toHaveClass(/drop-target/);
  await page.mouse.up();
  await expect(card(page, 'thu-le').locator('.organization-node__team')).toHaveText('First Team');
  await expect(page.getByRole('button', { name: 'Collapse First Team members', exact: true })).toHaveAttribute('aria-expanded', 'true');
});

test('empty teams remain on the chart and accept members again', async ({ page }) => {
  await moveWithMenu(page, 'Khanh Linh', 'Media');
  await moveWithMenu(page, 'Kim Chi', 'Media');
  await expect(frame(page, 'Partnerships').locator('.organization-team-header__title > span')).toHaveText('0');
  await expect(frame(page, 'Partnerships')).toContainText('Drop a member here');
  await page.getByRole('link', { name: 'Employees', exact: true }).click();
  await expect(page.locator('.member-stat--teams strong')).toHaveText('8');
  await page.getByRole('link', { name: 'Organization', exact: true }).click();
  await moveWithMenu(page, 'Khanh Linh', 'Partnerships');
  await expect(card(page, 'khanh-linh').locator('.organization-node__team')).toHaveText('Partnerships');
});

test('failed membership writes show an error without changing the member team', async ({ page }) => {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === '179fc-member-profiles-v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Options for Thu Le' }).click();
  await page.getByRole('menuitem', { name: 'Move to team', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Media', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Unable to save the team change');
  await expect(card(page, 'thu-le').locator('.organization-node__team')).toHaveText('Management');
  await expect(frame(page, 'Management').locator('.organization-team-header__title > span')).toHaveText('3');
});

test('keyboard options, layout movement and Escape drag cancellation work without a context-menu shortcut', async ({ page }) => {
  const node = card(page, 'thu-le');
  const move = node.locator('.organization-node__move');
  const before = await point(node);
  await move.focus();
  await page.keyboard.press('ArrowRight');
  expect((await point(node)).x).toBe(before.x + 10);
  await page.keyboard.press('Shift+F10');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Options for Thu Le' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', { name: 'Profile', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'View team' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Options for Thu Le' })).toBeFocused();
  await page.getByRole('button', { name: 'Reset layout', exact: true }).click();
  expect(await point(node)).toEqual(before);
  const box = await move.boundingBox();
  await page.mouse.move(box.x + 30, box.y + 30);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + 50, { steps: 4 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect(await point(node)).toEqual(before);
});

test('all-hidden team state can be restored without changing directory totals', async ({ page }) => {
  const hideButtons = page.getByRole('button', { name: /^Hide .+ in chart$/ });
  while (await hideButtons.count()) await hideButtons.first().click();
  await expect(page.locator('.organization-team-frame')).toHaveCount(0);
  await page.getByRole('button', { name: 'Show Management', exact: true }).click();
  await expect(card(page, 'thu-le')).toBeVisible();
  await expect(page.locator('.organization-summary dd')).toHaveText(['30', '8', '11']);
});

test('mobile menu and team controls stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('searchbox', { name: 'Search organization members' }).fill('Thu Le');
  await page.getByRole('button', { name: 'Options for Thu Le' }).click();
  const bounds = await page.getByRole('menu').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: test.info().outputPath('organization-mobile.png') });
  await page.getByRole('menuitem', { name: 'Move to team', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Media', exact: true }).click();
  await expect(card(page, 'thu-le').locator('.organization-node__team')).toHaveText('Media');
});

test('assistant keeps chat behavior without a tooltip and optional motion respects reduced motion', async ({ page }) => {
  const launcher = page.getByRole('button', { name: 'Open 179 Assist' });
  await launcher.hover();
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await launcher.click();
  await expect(page.getByRole('region', { name: 'Conversation with 179 Assist' })).toBeVisible();
  await page.getByRole('button', { name: 'Close assistant', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await card(page, 'thu-le').evaluate(element => getComputedStyle(element).animationName)).toBe('organization-node-arrive');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await card(page, 'thu-le').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
});
