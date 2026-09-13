/**
 * The icon has to actually be served, not just committed. This asks the
 * running site for every file the page links to, and checks the manifest is
 * valid JSON with the icons it claims.
 */
import { chromium } from 'playwright';

const BASE = process.env.HAMYAR_TEST_URL || BASE + '/';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined });
const page = await browser.newPage();

let failures = 0;
const fail = (why) => {
  console.log(`FAIL: ${why}`);
  failures++;
};
const pass = (what) => console.log(`ok   ${what}`);

await page.goto(BASE, { waitUntil: 'networkidle' });

const title = await page.title();
if (!title.includes('Hamyar')) {
  fail(`the tab is called "${title}"`);
} else {
  pass(`the tab is called "${title}"`);
}

const links = await page.$$eval(
  'link[rel*="icon"], link[rel="manifest"]',
  (els) => els.map((el) => ({ rel: el.getAttribute('rel'), href: el.getAttribute('href') }))
);
for (const rel of ['icon', 'apple-touch-icon', 'manifest']) {
  if (!links.some((l) => l.rel.includes(rel))) fail(`the page links no ${rel}`);
}

for (const { rel, href } of links) {
  const res = await page.request.get(BASE + href);
  if (!res.ok()) {
    fail(`${rel} -> ${href} returned ${res.status()}`);
    continue;
  }
  const bytes = (await res.body()).length;
  if (bytes < 200) {
    fail(`${rel} -> ${href} is only ${bytes} bytes`);
  } else {
    pass(`${rel} -> ${href} (${bytes} bytes, ${res.headers()['content-type']})`);
  }
}

// The manifest is what an Android "add to home screen" reads.
const manifest = await (await page.request.get(BASE + '/manifest.webmanifest')).json();
for (const key of ['name', 'start_url', 'display', 'theme_color', 'icons']) {
  if (!manifest[key]) fail(`the manifest has no ${key}`);
}
if (!manifest.icons.some((i) => i.purpose === 'maskable')) {
  fail('the manifest offers no maskable icon, so Android will crop the corners off');
} else {
  pass('the manifest offers a maskable icon for Android');
}
for (const iconEntry of manifest.icons) {
  const res = await page.request.get(BASE + iconEntry.src);
  if (!res.ok()) fail(`manifest icon ${iconEntry.src} returned ${res.status()}`);
}
pass(`all ${manifest.icons.length} manifest icons are served`);

const theme = await page.$eval('meta[name="theme-color"]', (el) => el.content);
if (theme.toLowerCase() !== '#0e6e64') {
  fail(`theme-color is ${theme}, not the brand teal`);
} else {
  pass('theme-color is the brand teal');
}

await browser.close();
console.log(failures === 0 ? '\nThe app has an icon.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
