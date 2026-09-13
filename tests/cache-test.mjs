import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || 'http://localhost:4173';

const apiCalls = [];
const cacheFetches = [];
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

// Nothing should reach the model. If it does, the test records it and fails.
await page.route('**/api/**', async (route) => {
  apiCalls.push(route.request().url().replace(/^https?:\/\/[^/]+/, ''));
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ answerFa: 'FROM_THE_MODEL', meaningFa: 'FROM_THE_MODEL' }),
  });
});
page.on('request', (r) => {
  if (r.url().includes('/guide-cache/')) cacheFetches.push(r.url().split('/').pop());
});
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Form companion/ }).click();
await page.waitForTimeout(800);
await page.getByText('شروع فرم', { exact: false }).first().click();
await page.waitForTimeout(6000);

if (!cacheFetches.includes('nhs_hc1.farsi.json')) fail('the form did not fetch its guidance file');
else console.log('PASS: opening the form fetched nhs_hc1.farsi.json');

// The whole-page question.
await page.getByRole('button', { name: 'سوال‌ها Questions' }).click();
await page.waitForTimeout(600);
const pageButton = page.getByText('این صفحه چه می‌گوید', { exact: false }).first();
await pageButton.waitFor({ timeout: 15000 });
const before = apiCalls.length;
await pageButton.click();
await page.waitForTimeout(3000);

const body = await page.locator('body').innerText();
if (body.includes('FROM_THE_MODEL')) fail('the model answer was used instead of the cache');
if (!body.includes('فرم HC1')) {
  fail('the written page explanation was not shown');
  console.log(body.slice(0, 800));
} else console.log('PASS: the written page explanation was shown');
if (apiCalls.slice(before).filter((u) => u.includes('/form/')).length) fail('asked the model anyway');
else console.log('PASS: no request to the model for the page');

// A box on the document. Page 1 of HC1 is the cover, so go to the first page
// with boxes on it before tapping one.
await page.getByRole('button', { name: 'سند رسمی Document' }).click();
await page.waitForTimeout(600);
// Pages 1-4 of HC1 are notes; the first real boxes are on page 5.
for (let i = 0; i < 4; i++) {
  await page.getByRole('button', { name: 'صفحه بعد' }).click();
  await page.waitForTimeout(1500);
}
const hotspots = page.locator('button[aria-pressed]:visible');
const count = await hotspots.count();
console.log(`boxes on this page: ${count}`);
if (!count) fail('no boxes found to tap');
else {
  const before2 = apiCalls.length;
  await hotspots.first().click({ force: true });
  await page.waitForTimeout(2500);
  if (apiCalls.slice(before2).filter((u) => u.includes('/form/')).length)
    fail('tapping a box asked the model');
  else console.log('PASS: tapping a box is free');
  const after = await page.locator('body').innerText();
  if (after.includes('FROM_THE_MODEL')) fail('the box used the model answer');
  const shown = after.match(/[؀-ۿ][^\n]{10,80}/);
  console.log('  showed:', shown ? shown[0].slice(0, 70) : '(nothing)');
}

await browser.close();
console.log(failures ? `\n${failures} FAILED` : '\nall good');
process.exitCode = failures ? 1 : 0;
