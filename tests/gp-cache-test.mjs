/**
 * The GP registration form, and its guidance, without the model.
 *
 * The form was registered in the library but its document was missing, and
 * the four questions listed against it described a two-page GMS1 that the NHS
 * has replaced with this eight-page one. This walks the real document and
 * asks "what does this page say" on every page, with the API stubbed so that
 * any answer coming from the model is visible as the word FROM_THE_MODEL.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || BASE + '/';
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
const pass = (what) => console.log(`ok   ${what}`);

// The document itself has to exist, and be the eight-page one.
const pdf = await page.request.get(`${BASE}/forms/gms1.pdf`);
if (!pdf.ok()) {
  fail(`/forms/gms1.pdf returned ${pdf.status()}`);
} else {
  const bytes = (await pdf.body()).length;
  if (bytes < 100_000) fail(`/forms/gms1.pdf is only ${bytes} bytes`);
  else pass(`the document is served (${Math.round(bytes / 1024)} KB)`);
}

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Form companion/ }).click();
await page.waitForTimeout(800);

// Find the GP form in the library by its code chip.
const card = page.locator('li', { has: page.getByText('GMS1', { exact: true }) });
if (!(await card.count())) {
  fail('the GP form is not in the library');
} else {
  pass('the GP form is in the library');
}
await card.getByText('شروع فرم', { exact: false }).first().click();
await page.waitForTimeout(8000);

if (!cacheFetches.includes('gp_registration.farsi.json')) {
  fail(`the form did not fetch its guidance file (fetched: ${cacheFetches.join(', ') || 'none'})`);
} else {
  pass('opening the form fetched gp_registration.farsi.json');
}

// Every page, in order, with no help from the model.
const openQuestions = async () => {
  const tab = page.getByRole('button', { name: 'سوال‌ها Questions' });
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(500);
};
const openDocument = async () => {
  const tab = page.getByRole('button', { name: 'سند رسمی Document' });
  if (await tab.count()) await tab.click();
  await page.waitForTimeout(500);
};

let explained = 0;
const answers = new Set();

for (let p = 0; p < 8; p++) {
  // Confirm we really are on the page we think we are, or the loop would
  // explain page one eight times and pass.
  await openDocument();
  const counter = await page.locator('span.tabular-nums').first().innerText();
  if (counter.trim() !== `${p + 1} / 8`) {
    fail(`expected to be on page ${p + 1} of 8, the document says "${counter.trim()}"`);
  }

  await openQuestions();
  const button = page.getByText('این صفحه چه می‌گوید', { exact: false }).first();
  await button.waitFor({ timeout: 15000 });
  const before = apiCalls.length;
  await button.click();
  await page.waitForTimeout(1200);

  const body = await page.locator('body').innerText();
  if (body.includes('FROM_THE_MODEL')) {
    fail(`page ${p + 1}: the model answered instead of the cache`);
  } else if (apiCalls.slice(before).filter((u) => u.includes('/form/')).length) {
    fail(`page ${p + 1}: asked the model anyway`);
  } else {
    explained++;
  }

  // Each page must say something of its own.
  const messages = await page.locator('[class*="whitespace-pre"]').allInnerTexts();
  const last = messages.filter((t) => t.trim().length > 60).pop();
  if (last) answers.add(last.trim().slice(0, 120));

  if (p < 7) {
    await openDocument();
    await page.getByRole('button', { name: 'صفحه بعد' }).click();
    await page.waitForTimeout(900);
  }
}

if (explained === 8) {
  pass('all 8 pages explained from the cache, with no request to the model');
} else {
  fail(`only ${explained} of 8 pages came from the cache`);
}

if (answers.size < 8) {
  fail(`only ${answers.size} distinct explanations across 8 pages`);
} else {
  pass('each of the 8 pages has its own explanation');
}

const modelCalls = apiCalls.filter((u) => u.includes('/form/'));
if (modelCalls.length) {
  fail(`${modelCalls.length} request(s) to the model: ${[...new Set(modelCalls)].join(', ')}`);
} else {
  pass('nothing reached the model for the whole walk');
}

await browser.close();
console.log(
  failures === 0 ? '\nThe GP form explains itself for free.' : `\n${failures} failure(s).`
);
process.exit(failures === 0 ? 0 : 1);
