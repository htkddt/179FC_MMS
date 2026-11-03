// Re-export the editable local design. Requires frontend/npm ci and installed Edge on Windows.
import { chromium } from '../../frontend/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = process.argv[2] ? path.resolve(process.argv[2]) : directory;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium') });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const source = pathToFileURL(path.join(directory, 'Settings_Prototype.html')).href;
async function open(tab, state = 'pristine', width = 1440, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(`${source}?tab=${tab}&state=${state}`);
  await page.evaluate(() => document.fonts.ready);
}
async function board(filename, title, cards, columns, width) {
  await page.setViewportSize({ width, height: 1000 });
  await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;padding:32px;background:#f3f5f8;color:#1c2431;font:14px/1.5 system-ui}h1{font-size:26px;margin:0 0 10px}p{margin:0 0 26px;color:#5e6c85}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:24px}figure{margin:0;background:#fff;border:1px solid #dce3ed;border-radius:12px;overflow:hidden;align-self:start}figcaption{padding:14px 18px;font-size:13px;font-weight:650;border-bottom:1px solid #dce3ed}img{display:block;width:100%;height:auto}</style></head><body><h1>${title}</h1><p>179MMS-6 · Local HTML design · 2026-11-03 · Synthetic account · Proposed UI</p><div class="grid">${cards.map(card => `<figure><figcaption>${card.label}</figcaption><img src="data:image/png;base64,${card.bytes.toString('base64')}" /></figure>`).join('')}</div></body></html>`);
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
}
try {
  for (const tab of ['general', 'notifications', 'security']) {
    await open(tab);
    await page.screenshot({ path: path.join(output, `Settings_${tab[0].toUpperCase() + tab.slice(1)}.png`), fullPage: true });
  }
  const responsive = [];
  for (const [tab, width, height, label] of [['general',390,844,'General · 390 px'],['notifications',390,844,'Notifications · 390 px'],['security',390,844,'Security · 390 px'],['general',768,1024,'General · 768 px'],['general',1024,900,'General · 1024 px']]) {
    await open(tab, 'pristine', width, height);
    responsive.push({ label, bytes: await page.screenshot({ fullPage: true }) });
  }
  await board('Settings_Responsive.png', 'Settings · Responsive references', responsive, 3, 1560);
  const states = [];
  for (const [state, label] of [['dirty','Unsaved changes · explicit Discard'],['save-error','Save failed · draft retained / Retry save'],['validation','Validation · focus the invalid field'],['loading','Loading · panel aria-busy'],['load-error','Load failed · Retry'],['empty','No configurable preferences'],['conflict','External change · reload before saving']]) {
    await open('general', state, 1100, 900);
    states.push({ label, bytes: await page.locator('[role=tabpanel]').screenshot() });
  }
  await open('general', 'confirm', 1100, 900);
  states.push({ label: 'Leaving a dirty tab · confirmation', bytes: await page.locator('dialog').screenshot() });
  await open('general', 'dirty', 1100, 900);
  await page.clock.install();
  await page.locator('#save').click();
  states.push({ label: 'Saving · duplicate actions locked', bytes: await page.locator('[role=tabpanel]').screenshot() });
  await page.clock.fastForward(1000);
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('Changes saved.'));
  states.push({ label: 'Saved · shared brand updated', bytes: await page.locator('[role=tabpanel]').screenshot() });
  await board('Settings_States.png', 'Settings · Interaction states', states, 3, 1920);
  console.log('Exported 3 desktop PNGs, responsive board and state board to ' + output);
} finally {
  await browser.close();
}
