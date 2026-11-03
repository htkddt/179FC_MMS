// Design-only interaction checks. Product Settings QA remains a later ticket phase.
import assert from 'node:assert/strict';
import { chromium } from '../../frontend/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium') });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const source = new URL('../../designs/Settings/Settings_Prototype.html', import.meta.url).href;
const errors = [];
page.on('pageerror', error => errors.push(error.message));
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
async function open(query = 'tab=general') { await page.goto(`${source}?${query}`); }
try {
  await open();
  check(await page.locator('h1').textContent() === 'Settings', 'Single Settings page title');
  check(await page.locator('main h1 + p, main h2 + p, main h3 + p').count() === 0, 'No subtitle beneath page/section/preference titles');
  check(await page.locator('#save').isDisabled(), 'Pristine save is disabled');
  check(await page.locator('#language option[value=Vietnamese]').isDisabled(), 'Unavailable translation cannot be offered as working');
  await page.locator('#clubName').fill('179FC Example');
  check(await page.locator('#save').isEnabled(), 'Changed form can save');
  await page.locator('#tab-notifications').click();
  check(await page.locator('dialog').isVisible(), 'Dirty tab switch asks confirmation');
  await page.locator('#stay').click();
  check(await page.locator('#clubName').inputValue() === '179FC Example', 'Keep editing retains draft');
  await page.locator('#save').click();
  check(await page.locator('#save').isDisabled(), 'Save locks duplicate submission');
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Changes saved.'));
  check(await page.locator('[data-club]').textContent() === '179FC Example', 'Successful save updates shared brand in prototype');
  await page.locator('#clubName').fill('');
  await page.locator('#save').click();
  check(await page.locator('#clubName').getAttribute('aria-invalid') === 'true', 'Invalid club name is identified');
  check(await page.locator('#clubName').evaluate(node => node === document.activeElement), 'Validation moves focus to the invalid field');
  await open('tab=general&failSave=1');
  await page.locator('#clubName').fill('Unsaved example');
  await page.locator('#save').click();
  await page.waitForFunction(() => document.querySelector('#save').textContent === 'Retry save');
  check(await page.locator('#clubName').inputValue() === 'Unsaved example', 'Save failure preserves values');
  check(await page.locator('[data-club]').textContent() === '179FC', 'Save failure leaves canonical brand unchanged');
  await open('tab=general&state=load-error');
  await page.locator('#retry').click();
  check(await page.locator('#clubName').isVisible(), 'Load retry restores form');
  await open('tab=general&state=conflict');
  check(await page.locator('#save').isDisabled(), 'External update blocks a stale save');
  await page.locator('#reload-latest').click();
  check(await page.locator('dialog').isVisible(), 'Reload latest confirms draft discard');
  await page.locator('#stay').click();
  check(await page.locator('#clubName').inputValue() === '179FC Community', 'Cancelling reload keeps the stale draft');
  await page.locator('#reload-latest').click();
  await page.locator('#leave').click();
  check(await page.locator('#clubName').inputValue() === '179FC Latest', 'Confirmed reload adopts latest snapshot');
  check(await page.locator('[data-club]').textContent() === '179FC Latest', 'Reloaded canonical snapshot updates the shared brand');
  await open();
  await page.locator('[data-switch=compactNavigation]').click();
  check(!await page.locator('body').evaluate(node => node.classList.contains('compact')), 'Compact sidebar is not applied before save');
  await page.locator('#save').click();
  await page.waitForFunction(() => document.body.classList.contains('compact'));
  await page.waitForFunction(() => document.querySelector('.sidebar').getBoundingClientRect().width === 88);
  check(await page.locator('.sidebar').evaluate(node => node.getBoundingClientRect().width) === 88, 'Saved compact preference applies to shell');
  await open('tab=notifications');
  check(await page.locator('[role=switch]:disabled').count() === 2, 'Unavailable notification capabilities cannot be toggled');
  check(await page.locator('[data-switch=assistant]').getAttribute('aria-checked') === 'true', 'Unavailable capability preserves the saved preference');
  await page.locator('.assistant').click();
  check(await page.locator('#question').isVisible(), 'Manual assistant stays accessible');
  await page.keyboard.press('Escape');
  check(await page.locator('.assistant').evaluate(node => node === document.activeElement), 'Assistant restores focus');
  await open('tab=notifications&capabilities=ready');
  await page.locator('[data-switch=assistant]').click();
  check(await page.locator('#save').isEnabled(), 'Capability-ready design can stage a notification preference');
  await open('tab=security');
  check(await page.locator('#form-footer').isHidden(), 'Security has no fake preference save');
  check(await page.locator('.preference button:enabled').count() === 0, 'Disconnected security actions are disabled');
  await open();
  await page.locator('#tab-general').focus();
  await page.keyboard.press('ArrowRight');
  check(await page.locator('#tab-notifications').getAttribute('aria-selected') === 'true', 'Tab ArrowRight activation');
  await page.keyboard.press('End');
  check(await page.locator('#tab-security').getAttribute('aria-selected') === 'true', 'Tab End activation');
  await page.goBack();
  check(await page.locator('#tab-notifications').getAttribute('aria-selected') === 'true', 'Browser Back restores selected tab');
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const tab of ['general','notifications','security']) {
      await open(`tab=${tab}`);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${tab} fits ${width}px`);
      const controls = await page.locator('main input,main select,main .button').evaluateAll(nodes => nodes.filter(node => node.getBoundingClientRect().width).every(node => { const rect=node.getBoundingClientRect();return rect.left>=0 && rect.right<=innerWidth+1; }));
      check(controls, `${tab} controls fit ${width}px`);
    }
  }
  await page.setViewportSize({ width:390,height:844 });
  await open();
  await page.locator('.menu-toggle').click();
  check(await page.locator('body').evaluate(node => node.classList.contains('drawer-open')), 'Mobile navigation opens');
  await page.keyboard.press('Escape');
  check(await page.locator('.menu-toggle').evaluate(node => node === document.activeElement), 'Mobile navigation restores focus');
  await page.emulateMedia({ reducedMotion:'reduce' });
  check(await page.locator('.switch').first().evaluate(node => getComputedStyle(node).transitionDuration) === '0s', 'Reduced motion disables transitions');
  function luminance(hex) {
    const rgb = hex.match(/[0-9a-f]{2}/gi).map(value => parseInt(value,16)/255).map(value => value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
    return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
  }
  for(const [foreground,background,minimum] of [['1c2431','ffffff',4.5],['5e6c85','ffffff',4.5],['ffffff','dc1e38',4.5],['bd1630','fff0f3',4.5],['694a14','fffaf0',4.5],['087545','ffffff',4.5],['ffffff','7d2939',4.5],['ffffff','ae4358',4.5],['8793a6','ffffff',3],['7d2939','ffffff',3]]) {
    const values=[luminance(foreground),luminance(background)].sort((a,b)=>b-a);
    check((values[0]+.05)/(values[1]+.05)>=minimum, `${foreground}/${background} meets ${minimum}:1 contrast`);
  }
  check(errors.length === 0, 'No browser runtime errors: ' + errors.join(', '));
  console.log(`${checks} design checks passed. Prototype only; no product QA or CI verdict.`);
} finally {
  await browser.close();
}
