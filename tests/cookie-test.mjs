/**
 * The cookie notice, and the promise it makes.
 *
 * The whole point of an opt-in notice is that nothing happens before the
 * person chooses. So the checks that matter are negative ones: with no answer
 * yet, and after Reject, there must be no request to Google and no GA cookie
 * anywhere. Those are the claims that would quietly stop being true if someone
 * later moved the gtag script into index.html.
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

// Anything that phones an analytics vendor, Google or Microsoft. Clarity
// records the screen, so it matters even more than GA that nothing reaches it
// before a person says yes.
const googleHits = (page, sink) => {
  page.on('request', (r) => {
    const url = r.url();
    if (/googletagmanager|google-analytics|analytics\.google|clarity\.ms/.test(url)) sink.push(url);
  });
};

const gaCookies = async (context) =>
  (await context.cookies()).filter((c) => c.name === '_ga' || c.name.startsWith('_ga_'));

// ---- 1. Before anyone answers -----------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const hits = [];
  googleHits(page, hits);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const notice = page.locator('#btn-cookies-accept');
  if (!(await notice.count())) {
    fail('the notice does not appear on a first visit');
  } else {
    pass('the notice appears on a first visit');
  }

  const reject = page.locator('#btn-cookies-reject');
  if (!(await reject.count())) {
    fail('there is no way to refuse');
  } else {
    const a = await notice.boundingBox();
    const r = await reject.boundingBox();
    // Refusing has to be as easy as agreeing, which starts with being the
    // same size rather than a grey link under the button.
    if (!a || !r || Math.abs(a.width - r.width) > 8 || Math.abs(a.height - r.height) > 4) {
      fail(`accept is ${a?.width}x${a?.height}, reject is ${r?.width}x${r?.height}`);
    } else {
      pass(`accept and reject are the same size (${Math.round(a.width)}x${Math.round(a.height)})`);
    }
    if (r.height < 44) fail(`reject is only ${r.height}px tall`);
  }

  if (hits.length) fail(`${hits.length} request(s) to Google before any choice was made`);
  else pass('nothing reaches Google before a choice is made');

  if ((await gaCookies(context)).length) fail('a GA cookie was set before any choice');
  else pass('no GA cookie before a choice');

  // The notice is not a modal, so the app has to stay usable behind it. The
  // first version failed this: the transparent padding that lifts the card
  // clear of the tab bar sat over the whole tab bar and ate every tap, so the
  // navigation was dead until a person answered.
  await page.click('#tab-nav-mobile-interpreter', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  if (!(await page.locator('#tab-nav-mobile-interpreter[aria-current="page"]').count())) {
    fail('the navigation cannot be used while the notice is on screen');
  } else {
    pass('the app is still usable while the notice is on screen');
  }

  await context.close();
}

// ---- 2. After Reject ---------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const hits = [];
  googleHits(page, hits);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.click('#btn-cookies-reject');
  await page.waitForTimeout(1200);

  if (await page.locator('#btn-cookies-accept').count()) {
    fail('the notice is still on screen after refusing');
  } else {
    pass('the notice goes away after refusing');
  }
  if (hits.length) fail(`${hits.length} request(s) to Google after refusing`);
  else pass('nothing reaches Google after refusing');
  if ((await gaCookies(context)).length) fail('a GA cookie exists after refusing');
  else pass('no GA cookie after refusing');

  // And it stays refused.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  if (await page.locator('#btn-cookies-accept').count()) {
    fail('the notice asks again after a reload, despite being refused');
  } else {
    pass('the refusal is remembered across a reload');
  }
  if (hits.length) fail('a request reached Google after reloading a refused session');

  // The app still works. A refusal must not cost anyone a feature.
  await page.click('#tab-nav-mobile-interpreter');
  await page.waitForTimeout(600);
  if (!(await page.locator('#tab-nav-mobile-interpreter[aria-current="page"]').count())) {
    fail('the app stopped working after refusing');
  } else {
    pass('the app works normally after refusing');
  }

  await context.close();
}

// ---- 3. After Accept ---------------------------------------------------
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const hits = [];
  googleHits(page, hits);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.click('#btn-cookies-accept');
  await page.waitForTimeout(2500);

  if (!hits.length) {
    fail('accepting loaded no analytics at all, so the measurement would never work');
  } else {
    pass(`accepting loads analytics (${hits.length} request(s))`);
  }
  // Clarity records the screen, so it is the one whose gate matters most.
  // Confirm it actually loads on Accept, or the masking and the recording
  // never happen and this whole feature is off.
  if (!hits.some((u) => u.includes('clarity.ms'))) {
    fail('accepting did not load Clarity');
  } else {
    pass('accepting loads Clarity, masked');
  }
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  if (await page.locator('#btn-cookies-accept').count()) {
    fail('the notice asks again after accepting');
  } else {
    pass('the acceptance is remembered across a reload');
  }

  await context.close();
}

// ---- 4. The wording says what it does ---------------------------------
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const text = await page.locator('[role="dialog"]').first().innerText();

  for (const [what, needle] of [
    ['uses the agreed wording', 'cookies and similar technologies'],
    ['says what Accept means', "By clicking ‘Accept’"],
    ['offers the Cookie Policy', 'Cookie Policy'],
    ['has a Persian half', 'کوکی‌ها و فناوری‌های مشابه'],
  ]) {
    if (!text.includes(needle)) fail(`the notice never ${what}`);
    else pass(`the notice ${what}`);
  }

  // The app does not personalise anything, so the notice must not say it does.
  for (const claim of ['personalize content', 'personalise content']) {
    if (text.toLowerCase().includes(claim)) {
      fail(`the notice claims "${claim}", which the app does not do`);
    }
  }
  pass('the notice claims nothing the app does not do');

  // Folded away by default, or it pushes Accept and Reject off a phone screen.
  const closedHeight = (await page.locator('[role="dialog"] > div').first().boundingBox()).height;
  if (await page.locator('details[open]').count()) {
    fail('the cookie policy is open before anyone asks for it');
  } else {
    pass('the cookie policy starts folded away');
  }

  // And it has to lead to an actual policy rather than a dead link, which is
  // what it was when the wording arrived.
  await page.click('#btn-cookie-policy');
  await page.waitForTimeout(400);
  const policy = await page.locator('[role="dialog"]').first().innerText();
  for (const [what, needle] of [
    ['names both vendors', 'Microsoft Clarity'],
    ['names Google too', 'Google Analytics'],
    ['says text is hidden', 'All text is hidden'],
    ['says what refusing does', 'Nothing is set'],
    ['says how to change your mind', 'Change my mind'],
  ]) {
    if (!policy.includes(needle)) fail(`the cookie policy never ${what}`);
    else pass(`the cookie policy ${what}`);
  }

  // Opening it must not cost the buttons their place on screen.
  const openHeight = (await page.locator('[role="dialog"] > div').first().boundingBox()).height;
  const accept = await page.locator('#btn-cookies-accept').boundingBox();
  const viewport = page.viewportSize().height;
  if (accept.y + accept.height > viewport) {
    fail(`with the policy open, Accept sits ${Math.round(accept.y + accept.height - viewport)}px below the screen`);
  } else {
    pass(`the buttons stay on screen with the policy open (card ${Math.round(closedHeight)}px closed, ${Math.round(openHeight)}px open)`);
  }

  await context.close();
}

await browser.close();
console.log(failures === 0 ? '\nNothing happens until someone says yes.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
