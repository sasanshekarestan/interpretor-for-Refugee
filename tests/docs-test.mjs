/**
 * My Documents was a mockup: two example letters in the source and a save
 * button that forgot everything on reload. This checks the real thing.
 *
 * The important claims are that a file survives a reload, that it does NOT
 * appear in a different browser profile, and that "delete everything" really
 * empties it.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || BASE + '/';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};
const pass = (what) => console.log(`ok   ${what}`);

const openDocuments = async (page) => {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('#tab-nav-mobile-more');
  await page.waitForTimeout(300);
  await page.click('text=My documents');
  await page.waitForTimeout(500);
};

// One person, one browser profile.
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
// These suites test the app, not the cookie notice, and a one-time banner over
// the bottom of the screen would intercept the taps they are checking. The
// choice is seeded as "rejected" so the notice never appears and no analytics
// loads; cookie-test.mjs is where the notice itself is exercised, including
// that the app stays usable while it is up.
await page.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});
await openDocuments(page);

// Nothing pre-loaded. The old screen shipped with two invented letters, one of
// which read as a real Home Office letter someone had saved.
const bodyText = await page.locator('body').innerText();
for (const ghost of ['Home Office Bail Notification', 'NHS GP Registration Confirmation']) {
  if (bodyText.includes(ghost)) {
    fail(`the sample document "${ghost}" is still shipped`);
  }
}
if (!bodyText.includes('Nothing saved yet')) {
  fail('an empty store does not say it is empty');
} else {
  pass('starts empty, with no invented documents');
}

// Save a real file.
await page.setInputFiles('input[type=file]', {
  name: 'bail-notice.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4 a letter from the Home Office'),
});
await page.waitForTimeout(400);
await page.fill('#doc-title', 'Bail notice');
await page.fill('#doc-notes-fa', 'تاریخ مراجعه بعدی');
await page.click('#btn-save-document');
await page.waitForTimeout(600);

if (!(await page.locator('text=Bail notice').count())) {
  fail('the saved document does not appear in the list');
} else {
  pass('a saved document appears in the list');
}

// The claim that matters: it is still there after a reload.
await openDocuments(page);
if (!(await page.locator('text=Bail notice').count())) {
  fail('the document did not survive a reload');
} else {
  pass('the document survives a reload');
}
if (!(await page.locator('text=تاریخ مراجعه بعدی').count())) {
  fail('the Persian note did not survive a reload');
} else {
  pass('the Persian note survives a reload');
}

// And the notice tells the truth in both languages.
const noticeText = await page.locator('body').innerText();
if (!noticeText.includes('These stay on this device') || !noticeText.includes('روی همین دستگاه')) {
  fail('the screen does not say where the files live, in both languages');
} else {
  pass('the screen says where the files live, in both languages');
}

// A different browser profile is a different person. This is the thing that
// was misread as a privacy leak, so it gets an explicit check.
const other = await browser.newContext({ viewport: { width: 390, height: 844 } });
const otherPage = await other.newPage();
// These suites test the app, not the cookie notice, and a one-time banner over
// the bottom of the screen would intercept the taps they are checking. The
// choice is seeded as "rejected" so the notice never appears and no analytics
// loads; cookie-test.mjs is where the notice itself is exercised, including
// that the app stays usable while it is up.
await otherPage.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});
await openDocuments(otherPage);
if (await otherPage.locator('text=Bail notice').count()) {
  fail('the document leaked into a separate browser profile');
} else {
  pass('a separate browser profile sees nothing');
}
await other.close();

// Delete everything, in two steps.
await page.click('text=Delete everything');
await page.waitForTimeout(300);
await page.click('text=بله، همه را پاک کن');
await page.waitForTimeout(600);
if (await page.locator('text=Bail notice').count()) {
  fail('delete everything left the document behind');
} else {
  pass('delete everything empties the store');
}

await openDocuments(page);
if (await page.locator('text=Bail notice').count()) {
  fail('the deleted document came back after a reload');
} else {
  pass('the deletion holds across a reload');
}

// Every control on the screen still clears the touch-target floor.
await page.setInputFiles('input[type=file]', {
  name: 'gp-letter.pdf',
  mimeType: 'application/pdf',
  buffer: Buffer.from('%PDF-1.4 gp'),
});
await page.waitForTimeout(300);
await page.click('#btn-save-document');
await page.waitForTimeout(500);
const small = await page.$$eval('button', (els) =>
  els
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.height < 44;
    })
    .map((el) => `${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)} @${Math.round(el.getBoundingClientRect().height)}px`)
);
if (small.length) {
  fail(`controls under 44px: ${small.join(', ')}`);
} else {
  pass('every control clears 44px');
}

await context.close();
await browser.close();
console.log(failures === 0 ? '\nMy Documents keeps what it is given.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
