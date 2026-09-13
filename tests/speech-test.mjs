/**
 * The device has no Persian voice and the server audio cannot be reached -
 * exactly the case that produced silence. Check the app now says so.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || 'http://localhost:4173';

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
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

// No voices at all, which is what a phone with no Persian pack behaves like.
await page.addInitScript(() => {
  Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [] });
});

// Catch-all first: Playwright tries the most recently added route first.
await page.route('**/api/**', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
);
// The server voice is unreachable, so the browser fallback is all that is left.
await page.route('**/api/tts**', (route) => route.abort());
await page.route('**/api/interpret**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 'test',
      timestamp: Date.now(),
      direction: 'english_to_farsi',
      sourceText: 'Your appointment has been moved to Tuesday.',
      translatedText: 'قرار ملاقات شما به روز سه‌شنبه منتقل شده است.',
    }),
  })
);

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Live interpreter/ }).click();
await page.waitForTimeout(1000);

// The direction toggle only appears once typing mode is open.
await page.getByText('Type Text', { exact: false }).first().click();
await page.waitForTimeout(800);
// English -> Farsi is the direction that was silent. By id, not by label:
// the label is bilingual and has already been rewritten once.
await page.click('#btn-dir-en-to-farsi');
await page.waitForTimeout(400);

const box = page.locator('textarea').first();
await box.waitFor({ timeout: 10000 });
await box.fill('Your appointment has been moved to Tuesday.');
await page.waitForTimeout(200);
await page.locator('button', { hasText: /تفسیر|ترجمه|Interpret/ }).last().click();
await page.waitForTimeout(4000);

const body = await page.locator('body').innerText();

if (!body.includes('قرار ملاقات شما به روز سه‌شنبه')) {
  fail('the translation itself was not shown');
  console.log(body.slice(0, 600));
} else console.log('PASS: the translation is on screen');

if (!body.includes('صدای فارسی در این لحظه در دسترس نیست')) fail('nothing explains why there was no sound');
else console.log('PASS: the app says Farsi audio is unavailable');

if (!body.includes('Farsi audio is not available')) fail('the English half of the notice is missing');
else console.log('PASS: the notice is in English too');

// And the opposite case: a device that does have a Persian voice should just
// speak, with no notice at all.
const page2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
// These suites test the app, not the cookie notice, and a one-time banner over
// the bottom of the screen would intercept the taps they are checking. The
// choice is seeded as "rejected" so the notice never appears and no analytics
// loads; cookie-test.mjs is where the notice itself is exercised, including
// that the app stays usable while it is up.
await page2.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});
const spoken = [];
await page2.addInitScript(() => {
  const voice = { lang: 'fa-IR', name: 'Persian Test Voice', default: false, localService: true, voiceURI: 'fa' };
  Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [voice] });
  // A real SpeechSynthesisVoice cannot be constructed, and assigning a plain
  // object to utterance.voice throws, so stand in for the utterance as well.
  window.SpeechSynthesisUtterance = function (text) {
    this.text = text;
    this.voice = null;
  };
  // speechSynthesis is a host object; plain assignment to speak does not
  // always stick, so define it.
  Object.defineProperty(window.speechSynthesis, 'speak', {
    configurable: true,
    value: (u) => {
      window.__spoken = (window.__spoken || []).concat(u.text);
      setTimeout(() => u.onend && u.onend(), 10);
    },
  });
});
await page2.route('**/api/**', (route) =>
  route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
);
await page2.route('**/api/tts**', (route) => route.abort());
await page2.route('**/api/interpret**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 'test2',
      timestamp: Date.now(),
      direction: 'english_to_farsi',
      sourceText: 'Your appointment has been moved to Tuesday.',
      translatedText: 'قرار ملاقات شما به روز سه‌شنبه منتقل شده است.',
    }),
  })
);
await page2.goto(BASE + '/', { waitUntil: 'networkidle' });
await page2.getByRole('button', { name: /Live interpreter/ }).click();
await page2.waitForTimeout(1000);
await page2.getByText('Type Text', { exact: false }).first().click();
await page2.waitForTimeout(800);
await page2.click('#btn-dir-en-to-farsi');
await page2.waitForTimeout(400);
await page2.locator('textarea').first().fill('Your appointment has been moved to Tuesday.');
await page2.locator('button', { hasText: /تفسیر|ترجمه|Interpret/ }).last().click();
await page2.waitForTimeout(4000);

const said = await page2.evaluate(() => window.__spoken || []);
const body2 = await page2.locator('body').innerText();
if (!said.some((t) => t.includes('سه‌شنبه'))) fail(`with a Farsi voice present, nothing was spoken (${JSON.stringify(said)})`);
else console.log('PASS: with a Farsi voice present, the Farsi is spoken');
if (body2.includes('صدای فارسی در این لحظه در دسترس نیست')) fail('the notice appeared even though a voice exists');
else console.log('PASS: no notice when a voice exists');

await browser.close();
console.log(failures ? `\n${failures} FAILED` : '\nall good');
process.exitCode = failures ? 1 : 0;
