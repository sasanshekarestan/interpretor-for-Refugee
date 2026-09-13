/**
 * Every card in the form library, opened.
 *
 * School Application shipped for months pointing at a document that was not
 * in the repository. The SPA fallback served index.html in its place, pdf.js
 * called it an invalid PDF, and a parent looking for a school place was shown
 * the words "Invalid PDF structure" in English and nothing else. Nobody
 * noticed because nothing ever opened the cards.
 *
 * So this opens all of them. A card either shows its document or is honestly
 * marked as one we do not hold, and in neither case does a parser's opinion
 * reach the screen.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || 'http://localhost:4173';

/** Text that means a developer's error message escaped onto the screen. */
const LEAKED = [
  'Invalid PDF structure',
  'MissingPDFException',
  'UnexpectedResponseException',
  'Required Static File Path',
  'public directory',
  'undefined',
  'NaN',
  '[object Object]',
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};
const pass = (what) => console.log(`ok   ${what}`);

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});

const openLibrary = async () => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Form companion/ }).click();
  await page.waitForTimeout(800);
};

await openLibrary();

// The cards, by the code chip each one leads with.
const codes = await page
  .locator('li span.font-mono')
  .allInnerTexts()
  .then((t) => t.map((s) => s.trim()).filter(Boolean));

if (codes.length < 8) {
  fail(`only ${codes.length} forms in the library`);
} else {
  pass(`${codes.length} forms in the library: ${codes.join(', ')}`);
}

for (const code of codes) {
  const card = page.locator('li', { has: page.getByText(code, { exact: true }) }).first();
  const start = card.getByText(/شروع فرم|ادامه دهید/).first();

  // ---- A card with no document says so, and says where to get one --------
  if (!(await start.count())) {
    const text = (await card.innerText()).replace(/\s+/g, ' ');
    const linksOut = await card.locator('a[href^="http"]').count();
    if (!text.includes('شورای محلی')) {
      fail(`${code}: has no form to open and does not explain why`);
    } else if (!linksOut) {
      fail(`${code}: explains it has no form but offers nowhere to get one`);
    } else {
      pass(`${code}: guidance only, and says where the real form comes from`);
    }
    // It must still carry the questions, or the card is just an apology.
    if (!/چه چیزی لازم است/.test(text)) fail(`${code}: guidance card lists nothing to prepare`);
    continue;
  }

  // ---- A card with a document opens it -----------------------------------
  await start.click();
  await page.waitForTimeout(6000);

  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const leaked = LEAKED.filter((s) => body.includes(s));
  if (leaked.length) {
    fail(`${code}: a developer's words reached the screen: ${leaked.join(', ')}`);
  }

  const canvasCount = await page.locator('canvas').count();
  if (!canvasCount) {
    fail(`${code}: opened but rendered no document`);
  } else {
    pass(`${code}: the document opens`);
  }

  await openLibrary();
}

// ---- And the error state itself, when a document genuinely will not load --
{
  const broken = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await broken.addInitScript(() => {
    try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
  });
  // Hand pdf.js something that is not a PDF, which is exactly what the SPA
  // fallback used to do for a form whose file was missing.
  await broken.route('**/forms/*.pdf', (route) =>
    route.fulfill({ status: 200, contentType: 'application/pdf', body: 'not a pdf at all' })
  );
  await broken.goto(BASE + '/', { waitUntil: 'networkidle' });
  await broken.getByRole('button', { name: /Form companion/ }).click();
  await broken.waitForTimeout(800);
  await broken.getByText(/شروع فرم|ادامه دهید/).first().click();
  await broken.waitForTimeout(6000);

  const text = (await broken.locator('body').innerText()).replace(/\s+/g, ' ');
  const leaked = LEAKED.filter((s) => text.includes(s));
  if (leaked.length) {
    fail(`a broken document leaks: ${leaked.join(', ')}`);
  } else {
    pass('a broken document leaks nothing technical');
  }
  // Persian, English, and whose fault it is.
  for (const [what, needle] of [
    ['says in Persian that the document did not open', 'سند باز نشد'],
    ['says in Persian that it is not the person’s fault', 'اشکال از سمت ماست'],
    ['says it in English too', 'This is our fault, not yours'],
    ['offers a way on', 'دوباره امتحان کنید'],
  ]) {
    if (!text.includes(needle)) fail(`the failure never ${what}`);
    else pass(`the failure ${what}`);
  }
  await broken.close();
}

await browser.close();
console.log(
  failures === 0
    ? '\nEvery card opens, or says honestly why it cannot.'
    : `\n${failures} failure(s).`
);
process.exit(failures === 0 ? 0 : 1);
