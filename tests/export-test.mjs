/**
 * Export the transcript from a seeded history and read the actual file, using
 * the same entries as the session Sasan sent, including the two that spanned
 * different days.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || 'http://localhost:4173';
import fs from 'node:fs';

const day = (h, m, dayOffsetBack) => {
  const d = new Date();
  d.setDate(d.getDate() - dayOffsetBack);
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

const history = [
  {
    id: 'e8',
    timestamp: day(15, 58, 0),
    direction: 'english_to_farsi',
    detectedDialect: 'British English',
    sourceText: "Don't worry at all. I am here to help you.",
    translatedText: 'اصلاً نگران نباشید. من اینجا هستم تا به شما کمک کنم.',
    britishPhrasing: "Don't worry at all. I am here to help you.",
  },
  {
    id: 'e7',
    timestamp: day(15, 57, 0),
    direction: 'farsi_to_english',
    detectedDialect: 'Iranian Farsi (Tehrani)',
    sourceText: 'از دیشب تا حالا سرم درد می‌کنه.',
    translatedText: "Since last night my head has been hurting.",
    britishPhrasing: "My head's been pounding since last night.",
    formalPhrasing: 'I have experienced a persistent headache since yesterday evening.',
  },
  {
    id: 'e1',
    timestamp: day(21, 1, 1),
    direction: 'farsi_to_english',
    detectedDialect: 'Iranian Persian (Tehrani)',
    sourceText: 'نه پول دارم، نه چیزی دارم.',
    translatedText: 'I have no money and nothing to my name.',
    britishPhrasing: "I haven't got a penny to my name.",
  },
];

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

await page.addInitScript((h) => {
  localStorage.setItem('refugee_interpreter_history', JSON.stringify(h));
}, history);
await page.route('**/api/**', (r) =>
  r.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
);

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Live interpreter/ }).click();
await page.waitForTimeout(1200);

const exportButton = page.locator('#btn-export-history');
await exportButton.scrollIntoViewIfNeeded();
const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);

const path = '/tmp/claude-0/-home-claude/feaae1de-2a1d-5d0c-94d3-36da1d9bde93/scratchpad/exported.txt';
await download.saveAs(path);
const text = fs.readFileSync(path, 'utf8');

console.log('filename:', download.suggestedFilename());
console.log('----------------------------------------');
console.log(text);
console.log('----------------------------------------');

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};

// Oldest first: yesterday's entry must come before today's.
if (text.indexOf('no money') > text.indexOf('نگران نباشید')) fail('entries are not in time order');
else console.log('PASS: oldest entry comes first');

// The Persian translation must not be filed under an English heading.
const persianLine = text.split('\n').find((l) => l.includes('نگران نباشید'));
const beforePersian = text.slice(0, text.indexOf(persianLine)).split('\n').slice(-2)[0] || '';
if (!beforePersian.includes('Farsi')) fail(`the Persian is labelled "${beforePersian.trim()}"`);
else console.log('PASS: the Persian is labelled as Farsi');

if (!/=+\n.*\n=+/.test(text)) fail('days are not marked');
else console.log('PASS: the days are marked');

if (!text.includes('machine translation')) fail('there is no note about what this is');
else console.log('PASS: it says what the file is');

if (!/^\d{4}-\d{2}-\d{2}-hamyar-transcript\.txt$/.test(download.suggestedFilename()))
  fail(`unexpected filename: ${download.suggestedFilename()}`);
else console.log('PASS: the filename sorts by date');

await browser.close();
console.log(failures ? `\n${failures} FAILED` : '\nall good');
process.exitCode = failures ? 1 : 0;
