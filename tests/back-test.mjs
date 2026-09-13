/**
 * Back has to work three ways: the button, the browser, and the Android
 * hardware key (which is the browser's back, so testing that covers it).
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

for (const [label, viewport] of [
  ['phone', { width: 390, height: 844 }],
  ['desktop', { width: 1280, height: 900 }],
]) {
  const page = await browser.newPage({ viewport });
  // These suites test the app, not the cookie notice, and a one-time banner over
  // the bottom of the screen would intercept the taps they are checking. The
  // choice is seeded as "rejected" so the notice never appears and no analytics
  // loads; cookie-test.mjs is where the notice itself is exercised, including
  // that the app stays usable while it is up.
  await page.addInitScript(() => {
    try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });

  const navId = (tab) =>
    label === 'phone' ? `#tab-nav-mobile-${tab}` : `#tab-nav-${tab}`;

  // Home has nowhere to go back to, so it must not offer.
  if (await page.locator('#btn-back').count()) {
    fail(`${label}: back button shown on home`);
  } else {
    pass(`${label}: no back button on home`);
  }

  // Home -> interpreter.
  await page.click(navId('interpreter'));
  await page.waitForTimeout(300);

  const back = page.locator('#btn-back');
  if ((await back.count()) !== 1) {
    fail(`${label}: no back button after navigating to the interpreter`);
  } else {
    const text = (await back.innerText()).replace(/\s+/g, ' ').trim();
    if (!text.includes('Back to Home') || !text.includes('خانه')) {
      fail(`${label}: back button does not name its destination: "${text}"`);
    } else {
      pass(`${label}: back button names Home in both languages`);
    }

    const box = await back.boundingBox();
    if (!box || box.height < 44) {
      fail(`${label}: back button is ${box ? box.height : 0}px tall, under the 44px floor`);
    } else {
      pass(`${label}: back button is ${Math.round(box.height)}px tall`);
    }
  }

  // The button itself.
  await back.click();
  await page.waitForTimeout(300);
  if (!(await page.locator(`${navId('home')}[aria-current="page"]`).count())) {
    fail(`${label}: the back button did not return to home`);
  } else {
    pass(`${label}: the back button returns to home`);
  }

  // Two steps forward, then the browser's own back twice.
  await page.click(navId('interpreter'));
  await page.waitForTimeout(200);
  await page.click(navId('letter_scanner'));
  await page.waitForTimeout(200);

  await page.goBack();
  await page.waitForTimeout(300);
  if (!(await page.locator(`${navId('interpreter')}[aria-current="page"]`).count())) {
    fail(`${label}: browser back did not land on the interpreter`);
  } else {
    pass(`${label}: browser back lands one screen back`);
  }

  await page.goBack();
  await page.waitForTimeout(300);
  if (!(await page.locator(`${navId('home')}[aria-current="page"]`).count())) {
    fail(`${label}: browser back did not land on home`);
  } else {
    pass(`${label}: browser back reaches home`);
  }
  if (await page.locator('#btn-back').count()) {
    fail(`${label}: back button still shown after returning to home`);
  } else {
    pass(`${label}: back button clears on home`);
  }

  // Forward again, to check the trail is rebuilt from history rather than guessed.
  await page.goForward();
  await page.waitForTimeout(300);
  const fwdBack = page.locator('#btn-back');
  if ((await fwdBack.count()) !== 1) {
    fail(`${label}: no back button after going forward`);
  } else {
    const text = (await fwdBack.innerText()).replace(/\s+/g, ' ').trim();
    if (!text.includes('Back to Home')) {
      fail(`${label}: after forward, back points at "${text}" rather than home`);
    } else {
      pass(`${label}: forward restores the right destination`);
    }
  }

  // The site must not be left by pressing back from a deep screen.
  await page.click(navId('form_companion'));
  await page.waitForTimeout(300);
  await page.locator('#btn-back').click();
  await page.waitForTimeout(300);
  if (!page.url().startsWith(BASE)) {
    fail(`${label}: back left the site (${page.url()})`);
  } else {
    pass(`${label}: back never leaves the site`);
  }

  // A new screen must start at its own top. Tapping a card from halfway down
  // the home page used to open the next screen halfway down too.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const card = page.locator('text=Write a message').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const scrolledTo = await page.evaluate(() => window.scrollY);
  if (scrolledTo < 100) {
    fail(`${label}: could not scroll the home page far enough to test (y=${scrolledTo})`);
  }
  await card.click();
  await page.waitForTimeout(400);
  const landedAt = await page.evaluate(() => window.scrollY);
  if (landedAt !== 0) {
    fail(`${label}: the new screen opened at y=${landedAt} instead of its top`);
  } else {
    pass(`${label}: a card tapped from y=${Math.round(scrolledTo)} opens the next screen at the top`);
  }

  // And coming back returns to the card, not to the top.
  await page.goBack();
  await page.waitForTimeout(500);
  const returnedTo = await page.evaluate(() => window.scrollY);
  if (Math.abs(returnedTo - scrolledTo) > 40) {
    fail(`${label}: back returned to y=${returnedTo}, not the y=${Math.round(scrolledTo)} they left`);
  } else {
    pass(`${label}: back returns to where they were on the page`);
  }

  await page.screenshot({
    path: `/tmp/claude-0/-home-claude/feaae1de-2a1d-5d0c-94d3-36da1d9bde93/scratchpad/back-${label}.png`,
    fullPage: false,
  });
  await page.close();
}

await browser.close();
console.log(failures === 0 ? '\nAll back-navigation checks passed.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 1 && 0 : 1);
