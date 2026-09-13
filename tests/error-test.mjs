/**
 * Check that the real Google quota error never reaches the screen, and that
 * what does reach it is the honest message.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || 'http://localhost:4173';

// Verbatim shape of what Google sent when the credit ran out.
const GOOGLE_QUOTA_ERROR = {
  error: {
    code: 429,
    message:
      'Your prepayment credits are depleted. Please go to AI Studio at https://ai.studio/projects to manage your project and billing. Learn more at https://ai.google.dev/gemini-api/docs/billing#prepay. ',
    status: 'RESOURCE_EXHAUSTED',
  },
};

// (The classifier itself is checked separately; this file checks the screen.)

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

// The server, failing the way it really failed.
// Playwright tries the most recently added route first, so the catch-all
// goes on before the specific one or it would swallow every request.
await page.route('**/api/**', async (route) => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
});
await page.route('**/api/interpret**', async (route) => {
  await route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ kind: 'quota', error: 'The translation service has run out of credit.' }),
  });
});

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Live interpreter/ }).click();
await page.waitForTimeout(1200);

// Type a message rather than record, so the test does not need a microphone.
await page.getByText('Type Text', { exact: false }).first().click();
await page.waitForTimeout(800);
const box = page.locator('textarea').first();
await box.waitFor({ timeout: 10000 });
await box.fill('قرار ملاقات من با پزشک هفتهٔ آینده عوض شده است');
await page.waitForTimeout(200);
await page.getByText('تفسیر و ترجمه', { exact: false }).first().click();
await page.waitForTimeout(2500);

const body = await page.locator('body').innerText();

for (const leak of ['prepayment', 'ai.studio', 'RESOURCE_EXHAUSTED', 'billing', '"code"', '429']) {
  if (body.includes(leak)) fail(`"${leak}" is still on the screen`);
}
if (!failures) console.log('PASS: none of Google\'s raw error is on the screen');

if (!body.includes('این ایراد از برنامه است')) fail('the Persian message does not say the fault is the app\'s');
else console.log('PASS: the Persian says the fault is the app\'s, not theirs');

if (!body.includes('This is a problem with the app')) fail('the English message is missing');
else console.log('PASS: the English message is there');

if (body.includes('run out of credit')) fail('the cause is shown without being opened');
else console.log('PASS: the cause is folded away until opened');

const summary = page.getByText('Technical details', { exact: false }).first();
if (!(await summary.count())) fail('there is no technical details toggle');
else {
  await summary.click();
  await page.waitForTimeout(300);
  const opened = await page.locator('body').innerText();
  if (!opened.includes('run out of credit')) fail('opening the details does not show the cause');
  else console.log('PASS: opening the details shows the real cause');
}

await browser.close();
console.log(failures ? `\n${failures} FAILED` : '\nall good');
process.exitCode = failures ? 1 : 0;
