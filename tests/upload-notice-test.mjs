/**
 * The Gemini notice, where the photo is about to be sent.
 *
 * A person scanning a letter or a form is about to send a photo of it to
 * Google to be read. Jon Beech at Leeds Asylum Support Network made the fair
 * point that this should be said at that moment, not only in the policy several
 * taps away, because for some people it is reassurance and for others a reason
 * to stop. So both upload screens must show the notice before a file is chosen,
 * and it must name Google and lead to the full policy.
 *
 * This guards that it is actually there. It would quietly stop being true if
 * someone moved the notice, or dropped it while refactoring the upload box.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || 'http://localhost:4173';

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};
const pass = (what) => console.log(`ok   ${what}`);

const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
// No cookie question in the way.
await page.addInitScript(() => {
  try {
    localStorage.setItem('hamyar_cookie_choice', 'rejected');
  } catch {}
});
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const navId = (tab) => `#tab-nav-mobile-${tab}`;

// The exact sentence Jon suggested, as it ships.
const GEMINI_LINE = 'Your photo will be sent to Google Gemini to read and translate it';
const NO_COPY_LINE = 'Hamyar does not keep a copy';
const NO_TRAIN_LINE = 'does not use it to train its AI models';

const checkScreen = async (label) => {
  const body = await page.locator('body').innerText();
  if (!body.includes(GEMINI_LINE)) {
    fail(`${label}: the notice does not say the photo goes to Google Gemini`);
  } else {
    pass(`${label}: says the photo is sent to Google Gemini`);
  }
  if (!body.includes(NO_COPY_LINE)) {
    fail(`${label}: the notice does not say Hamyar keeps no copy`);
  } else {
    pass(`${label}: says Hamyar keeps no copy`);
  }
  if (!body.includes(NO_TRAIN_LINE)) {
    fail(`${label}: the notice does not say Google will not train on it`);
  } else {
    pass(`${label}: says Google does not train on it`);
  }
  // The Farsi half, so it is not English only where it matters most.
  if (!body.includes('Google Gemini') || !body.includes('همیار نسخه‌ای')) {
    fail(`${label}: the notice has no Persian half`);
  } else {
    pass(`${label}: the notice has a Persian half`);
  }
  // And a way through to the full policy.
  if (!body.includes('More about privacy')) {
    fail(`${label}: no link to the full privacy policy`);
  } else {
    pass(`${label}: links to the full privacy policy`);
  }
};

// ---- The letter scanner --------------------------------------------------
// The tab shows a landing panel; a button on it opens the scanner itself.
await page.click(navId('letter_scanner'));
await page.waitForTimeout(400);
await page.click('#btn-open-letter-scanner');
await page.waitForTimeout(600);
await checkScreen('letter scanner');

// Back to a known state.
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// ---- The form upload -----------------------------------------------------
// Reached through Form Companion's library, which offers uploading your own
// form with the button labelled "بارگذاری فرم خودم".
await page.click(navId('form_companion'));
await page.waitForTimeout(600);
const uploadOwn = page.locator('text=بارگذاری فرم خودم');
if (await uploadOwn.count()) {
  await uploadOwn.first().click();
  await page.waitForTimeout(600);
}

const formBody = await page.locator('body').innerText();
if (formBody.includes('Take photo, upload PDF') || formBody.includes('Upload Form')) {
  await checkScreen('form upload');
} else {
  fail('form upload: could not open the upload screen to check the notice');
}

await context.close();
await browser.close();
console.log(failures === 0 ? '\nThe notice is where the photo is sent.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
