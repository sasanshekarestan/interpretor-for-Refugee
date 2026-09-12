/**
 * Google Analytics, and the consent that has to come before it.
 *
 * Hamyar needs evidence of use for funding bids: how many people, how often,
 * how long. That is a fair thing to want and GA4 measures it. But analytics
 * cookies are not "strictly necessary" under PECR, so in the UK they need
 * opt-in consent BEFORE they are set. A banner that only says "this site uses
 * cookies" with an OK button does not do that, and neither does treating
 * continued browsing as agreement. The ICO is explicit on both.
 *
 * So nothing here loads until someone has actually pressed Accept. Not the
 * gtag script, not the Consent Mode defaults, nothing. Press Reject and no
 * request is ever made to Google, which is the only way the app's promise
 * about not sharing your conversations stays true for the person who said no.
 *
 * The measurement ID comes from VITE_GA_MEASUREMENT_ID at build time. With no
 * ID set, the whole thing including the banner stays out of the way, so a
 * local build or a fork never phones anywhere.
 */

export type CookieChoice = 'accepted' | 'rejected';

const STORAGE_KEY = 'hamyar_cookie_choice';

/** Set in Vercel. Looks like G-XXXXXXXXXX. */
export const MEASUREMENT_ID: string =
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || '';

export const analyticsAvailable = (): boolean => Boolean(MEASUREMENT_ID);

/**
 * What the person chose, or null if they have not been asked yet.
 *
 * This one value is kept in localStorage without consent, and that is allowed:
 * remembering that someone said no is itself strictly necessary, or the
 * question would follow them around for ever.
 */
export const readCookieChoice = (): CookieChoice | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'accepted' || stored === 'rejected' ? stored : null;
  } catch {
    // Private mode, or storage blocked. Ask again rather than assume yes.
    return null;
  }
};

const writeCookieChoice = (choice: CookieChoice) => {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* The session still honours it; it is only forgotten on reload. */
  }
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

/** Puts gtag.js on the page. Only ever called after an explicit Accept. */
const loadGoogleAnalytics = () => {
  if (loaded || !MEASUREMENT_ID || typeof document === 'undefined') return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    window.dataLayer!.push(args);
  };
  window.gtag = gtag;

  // Consent Mode, in the order Google expects: the default is denied, and it
  // is only raised because a person pressed a button.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });
  gtag('consent', 'update', { analytics_storage: 'granted' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, {
    // The app is one page with tabs, so page_view is sent by hand or not at
    // all rather than once for the whole session.
    send_page_view: true,
    anonymize_ip: true,
  });
};

/** Called on load, and after a choice. Does nothing unless the answer was yes. */
export const applyCookieChoice = (choice: CookieChoice | null) => {
  if (choice === 'accepted') loadGoogleAnalytics();
  if (choice === 'rejected' && window.gtag) {
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
};

export const acceptCookies = () => {
  writeCookieChoice('accepted');
  applyCookieChoice('accepted');
};

/**
 * No is a real answer. Nothing is loaded, and any GA cookies from an earlier
 * yes are cleared, because leaving them would make the refusal cosmetic.
 */
export const rejectCookies = () => {
  writeCookieChoice('rejected');
  applyCookieChoice('rejected');
  clearAnalyticsCookies();
};

/** GA4 writes _ga and _ga_<container>. Both go. */
export const clearAnalyticsCookies = () => {
  if (typeof document === 'undefined') return;
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid');

  const host = window.location.hostname;
  // A cookie has to be deleted with the same domain and path it was set with,
  // and GA sets its own on the registrable domain, so both are tried.
  const domains = [host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

/** Clears the answer so the notice is asked again. Used by "change my choice". */
export const forgetCookieChoice = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to forget */
  }
  clearAnalyticsCookies();
};
