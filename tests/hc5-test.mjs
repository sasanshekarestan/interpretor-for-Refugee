/**
 * The four HC5 refund forms, and their guidance, without the model.
 *
 * These replaced a single combined "HC2 / HC5" card whose document did not
 * exist. Each is now its own form because the NHS made them four separate
 * papers with four separate posting addresses, and a person holding the
 * dental one should not be reading about optical vouchers.
 *
 * The API is stubbed so any answer that came from the model shows up as the
 * word FROM_THE_MODEL.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || BASE + '/';

const FORMS = [
  { code: 'HC5(D)', cache: 'hc5_dental.farsi.json', pdf: 'hc5-dental.pdf', mark: 'دندان' },
  { code: 'HC5(O)', cache: 'hc5_optical.farsi.json', pdf: 'hc5-optical.pdf', mark: 'چشم' },
  { code: 'HC5(T)', cache: 'hc5_travel.farsi.json', pdf: 'hc5-travel.pdf', mark: 'رفت‌وآمد' },
  { code: 'HC5(W)', cache: 'hc5_wigs.farsi.json', pdf: 'hc5-wigs.pdf', mark: 'کلاه‌گیس' },
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};
const pass = (what) => console.log(`ok   ${what}`);

// Each document has to actually be served.
{
  const page = await browser.newPage();
  for (const form of FORMS) {
    const res = await page.request.get(`${BASE}/forms/${form.pdf}`);
    const bytes = res.ok() ? (await res.body()).length : 0;
    if (bytes < 50_000) fail(`${form.code}: /forms/${form.pdf} returned ${res.status()}, ${bytes} bytes`);
    else pass(`${form.code}: the document is served (${Math.round(bytes / 1024)} KB)`);
  }
  await page.close();
}

for (const form of FORMS) {
  const apiCalls = [];
  const cacheFetches = [];
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

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Form companion/ }).click();
  await page.waitForTimeout(700);

  const card = page.locator('li', { has: page.getByText(form.code, { exact: true }) });
  if (!(await card.count())) {
    fail(`${form.code}: not in the library`);
    await page.close();
    continue;
  }
  await card.getByText('شروع فرم', { exact: false }).first().click();
  await page.waitForTimeout(7000);

  if (!cacheFetches.includes(form.cache)) {
    fail(`${form.code}: did not fetch ${form.cache} (fetched ${cacheFetches.join(', ') || 'nothing'})`);
  }

  const openQuestions = async () => {
    const tab = page.getByRole('button', { name: 'سوال‌ها Questions' });
    if (await tab.count()) await tab.click();
    await page.waitForTimeout(400);
  };
  const openDocument = async () => {
    const tab = page.getByRole('button', { name: 'سند رسمی Document' });
    if (await tab.count()) await tab.click();
    await page.waitForTimeout(400);
  };

  const answers = new Set();
  for (let p = 0; p < 4; p++) {
    await openDocument();
    const counter = (await page.locator('span.tabular-nums').first().innerText()).trim();
    if (counter !== `${p + 1} / 4`) {
      fail(`${form.code}: expected page ${p + 1} of 4, the document says "${counter}"`);
    }

    await openQuestions();
    const button = page.getByText('این صفحه چه می‌گوید', { exact: false }).first();
    await button.waitFor({ timeout: 15000 });
    await button.click();
    await page.waitForTimeout(1100);

    const messages = await page.locator('[class*="whitespace-pre"]').allInnerTexts();
    const last = messages.filter((t) => t.trim().length > 60).pop();
    if (last) answers.add(last.trim().slice(0, 120));

    if (p < 3) {
      await openDocument();
      await page.getByRole('button', { name: 'صفحه بعد' }).click();
      await page.waitForTimeout(800);
    }
  }

  const body = await page.locator('body').innerText();
  if (body.includes('FROM_THE_MODEL')) fail(`${form.code}: the model answered instead of the cache`);
  const modelCalls = apiCalls.filter((u) => u.includes('/form/'));
  if (modelCalls.length) {
    fail(`${form.code}: ${modelCalls.length} request(s) to the model`);
  } else if (answers.size === 4) {
    pass(`${form.code}: 4 pages, 4 distinct explanations, nothing asked of the model`);
  } else {
    fail(`${form.code}: only ${answers.size} distinct explanations across 4 pages`);
  }

  await page.close();
}

// The four cache files must not be copies of each other: each form says its
// own thing, and a copy-paste error would be invisible on screen.
{
  const page = await browser.newPage();
  const firstPages = new Map();
  for (const form of FORMS) {
    const data = await (await page.request.get(`${BASE}/guide-cache/${form.cache}`)).json();
    const boxes = Object.keys(data.fields || {}).length;
    if (!data.pages || Object.keys(data.pages).length !== 4) {
      fail(`${form.code}: ${Object.keys(data.pages || {}).length} pages cached, expected 4`);
    }
    if (boxes < 50) fail(`${form.code}: only ${boxes} boxes cached`);
    else pass(`${form.code}: ${boxes} boxes written up`);

    if (!data.pages['0'].includes(form.mark)) {
      fail(`${form.code}: its first page never mentions ${form.mark}`);
    }
    firstPages.set(form.code, data.pages['0']);
  }
  if (new Set(firstPages.values()).size !== FORMS.length) {
    fail('two of the four forms share the same first-page explanation');
  } else {
    pass('each form explains itself, not one of the others');
  }
  await page.close();
}

await browser.close();
console.log(failures === 0 ? '\nFour HC5 forms, all free to read.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
