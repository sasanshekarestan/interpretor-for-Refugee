/**
 * On a desktop, hovering a control should say it is a control.
 *
 * Browsers give a <button> the ordinary arrow, and the app had only put the
 * hand on about a third of its buttons by hand. This walks the real screens
 * and reads the computed cursor off every interactive element it finds.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || BASE + '/';

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
// These suites test the app, not the cookie notice, and a one-time banner over
// the bottom of the screen would intercept the taps they are checking. The
// choice is seeded as "rejected" so the notice never appears and no analytics
// loads; cookie-test.mjs is where the notice itself is exercised, including
// that the app stays usable while it is up.
await page.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};

const SELECTOR = [
  'a[href]',
  'button',
  'summary',
  'select',
  '[role="button"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="file"]',
].join(',');

/** Every visible, enabled control on screen, and the cursor it shows. */
const audit = async (where) => {
  const rows = await page.$$eval(SELECTOR, (els) =>
    els
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return false;
        const s = getComputedStyle(el);
        if (s.visibility === 'hidden' || s.display === 'none') return false;
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
        return true;
      })
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        label:
          (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        cursor: getComputedStyle(el).cursor,
      }))
  );

  const wrong = rows.filter((r) => r.cursor !== 'pointer');
  if (wrong.length) {
    for (const w of wrong) {
      fail(`${where}: <${w.tag}${w.id ? '#' + w.id : ''}> "${w.label}" shows "${w.cursor}"`);
    }
  } else {
    console.log(`ok   ${where}: all ${rows.length} controls show the hand`);
  }
  return rows.length;
};

let total = 0;

await page.goto(BASE, { waitUntil: 'networkidle' });
total += await audit('home');

for (const [name, sel] of [
  ['interpreter', '#tab-nav-interpreter'],
  ['letter reader', '#tab-nav-letter_scanner'],
  ['form companion', '#tab-nav-form_companion'],
  ['more', '#tab-nav-more'],
]) {
  await page.click(sel);
  await page.waitForTimeout(500);
  total += await audit(name);
}

// A modal, because its controls are built separately from the page's.
await page.click('#tab-nav-home');
await page.waitForTimeout(300);
await page.click('#btn-settings');
await page.waitForTimeout(500);
total += await audit('settings modal');
await page.keyboard.press('Escape');

// And a disabled control must not promise a press.
const disabled = await page.$$eval('button:disabled', (els) =>
  els
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    })
    .map((el) => getComputedStyle(el).cursor)
);
const promising = disabled.filter((c) => c === 'pointer');
if (promising.length) {
  fail(`${promising.length} disabled button(s) still show the hand`);
} else {
  console.log(`ok   disabled controls checked (${disabled.length} on screen)`);
}

await page.close();
await browser.close();

console.log(
  failures === 0
    ? `\nAll ${total} controls across five screens show the hand.`
    : `\n${failures} failure(s).`
);
process.exit(failures === 0 ? 0 : 1);
