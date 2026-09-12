import React, { useEffect, useState } from 'react';
import { ChevronDown, Cookie } from 'lucide-react';
import {
  CookieChoice,
  acceptCookies,
  analyticsAvailable,
  applyCookieChoice,
  readCookieChoice,
  rejectCookies,
} from '../utils/analytics';

/**
 * The first-visit cookie notice.
 *
 * Two buttons, not one. In the UK, analytics cookies need opt-in consent
 * before they are set, and the ICO is clear that refusing has to be as easy as
 * agreeing. A single "OK" would not be consent, it would be an announcement,
 * and it would leave Mehr Health relying on a banner that does not do the job
 * it appears to do. So Accept and Reject are the same size, the same shape and
 * side by side, and nothing loads until one of them is pressed.
 *
 * It says what the cookies are actually for in a sentence a person can check,
 * which for this app is worth more than the usual paragraph about "improving
 * your experience": someone who has been told all their life that being
 * counted is dangerous deserves to know they are being counted, by whom, and
 * that saying no costs them nothing.
 *
 * Persian first, then English, on the emphasis surface, like every other thing
 * in this app that explains rather than acts.
 */
export const CookieNotice: React.FC = () => {
  const [choice, setChoice] = useState<CookieChoice | null | undefined>(undefined);

  useEffect(() => {
    const stored = readCookieChoice();
    setChoice(stored);
    applyCookieChoice(stored);
  }, []);

  // Nothing to ask about if no measurement ID is configured, and nothing to
  // ask twice. `undefined` means the first read has not happened yet, which
  // keeps the notice from flashing up before a stored "no" is seen.
  if (!analyticsAvailable() || choice === undefined || choice !== null) return null;

  const decide = (accept: boolean) => {
    if (accept) acceptCookies();
    else rejectCookies();
    setChoice(accept ? 'accepted' : 'rejected');
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="کوکی‌ها / Cookies"
      className="fixed inset-x-0 bottom-0 z-50 print:hidden pointer-events-none
                 pb-[calc(env(safe-area-inset-bottom)+76px)] md:pb-0 px-3 sm:px-4"
    >
      {/* Sits above the phone navigation rather than under it, or the buttons
          would be unreachable on exactly the screens most people use.

          The wrapper is pointer-events-none and only the card takes clicks.
          The bottom padding that lifts this clear of the navigation is part of
          the wrapper, so without that the padding sat invisibly over the whole
          tab bar and swallowed every tap on it. The app's navigation was dead
          until a person answered, which is not what a notice should do: this
          one is deliberately not a modal, and the app stays usable behind it. */}
      <div
        className="pointer-events-auto max-w-3xl mx-auto mb-3 bg-emphasis text-on-emphasis
                   rounded-3xl shadow-lg p-4 space-y-3"
      >
        {/* The wording is the standard notice Sasan asked for, with one
            phrase removed: "and personalize content". Hamyar personalises
            nothing - no profiling, no recommendations, nothing that differs
            per person - and claiming otherwise in a privacy notice is a false
            statement about the product, made to exactly the people most
            frightened of being profiled. */}
        <div dir="rtl" className="flex items-start gap-3">
          <Cookie className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 min-w-0">
            <p className="font-farsi text-sm text-on-emphasis-muted leading-relaxed">
              ما از کوکی‌ها و فناوری‌های مشابه استفاده می‌کنیم تا تجربهٔ شما بهتر شود و آمار
              بازدید سایت را بسنجیم. با زدن «قبول»، با استفاده از همهٔ کوکی‌ها موافقت می‌کنید.
              برای اینکه بدانید چطور از آن‌ها استفاده می‌کنیم،{' '}
              <span className="font-bold text-on-emphasis">سیاست کوکی</span> ما را ببینید.
            </p>
          </div>
        </div>

        <div dir="ltr" className="font-latin border-t border-white/15 pt-2.5">
          <p className="text-sm text-on-emphasis-muted leading-relaxed">
            We use cookies and similar technologies to help improve your experience and analyze
            site traffic. By clicking &lsquo;Accept&rsquo;, you consent to the use of all cookies.
            Visit our <span className="font-bold text-on-emphasis">Cookie Policy</span> to read
            more about how we use them.
          </p>
        </div>

        {/* The policy, folded away.
            It was six paragraphs sitting open under the notice, which on a
            phone pushed Accept and Reject most of the way off the screen. It
            is a native details element now: closed by default, keyboard
            operable without any of our own state, and rewritten as short
            labelled lines rather than prose, because a person checking what a
            cookie does wants to find the answer rather than read an essay. */}
        <details className="group rounded-2xl bg-white/10 border border-white/20">
          <summary
            id="btn-cookie-policy"
            className="min-h-[44px] px-3.5 flex items-center gap-2 list-none [&::-webkit-details-marker]:hidden"
          >
            <ChevronDown
              className="w-4 h-4 shrink-0 transition group-open:rotate-180"
              aria-hidden="true"
            />
            <span className="font-farsi font-bold text-sm">سیاست کوکی</span>
            <span className="text-sm text-on-emphasis-muted">· Cookie Policy</span>
          </summary>

          <div className="px-3.5 pb-3.5 pt-1 space-y-3 max-h-[30vh] overflow-y-auto">
            <dl dir="rtl" className="font-farsi space-y-1.5 text-sm">
              <div>
                <dt className="font-bold inline">کدام کوکی؟ </dt>
                <dd className="inline text-on-emphasis-muted">
                  یکی، به نام <span dir="ltr">_ga</span>، از Google Analytics. تا دو سال می‌ماند.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">برای چه؟ </dt>
                <dd className="inline text-on-emphasis-muted">
                  شمردن اینکه چند نفر از برنامه استفاده می‌کنند، برای گرفتن بودجه.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">چه چیزی فرستاده نمی‌شود؟ </dt>
                <dd className="inline text-on-emphasis-muted">
                  گفتگوها، نامه‌ها، فرم‌ها و مدارک شما. ما آن‌ها را نمی‌بینیم.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">اگر «رد» را بزنم؟ </dt>
                <dd className="inline text-on-emphasis-muted">
                  هیچ کوکی گذاشته نمی‌شود، چیزی به Google نمی‌رود، و برنامه کامل کار می‌کند.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">تغییر نظر؟ </dt>
                <dd className="inline text-on-emphasis-muted">
                  هر وقت خواستید، در «حریم خصوصی و داده‌ها».
                </dd>
              </div>
            </dl>

            <dl dir="ltr" className="font-latin space-y-1.5 text-sm border-t border-white/15 pt-2.5">
              <div>
                <dt className="font-bold inline">Which cookie? </dt>
                <dd className="inline text-on-emphasis-muted">
                  One, called _ga, from Google Analytics. It lasts up to two years.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">What for? </dt>
                <dd className="inline text-on-emphasis-muted">
                  Counting how many people use Hamyar, so we can get funding.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">What is never sent? </dt>
                <dd className="inline text-on-emphasis-muted">
                  Your conversations, letters, forms and documents. We cannot see them.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">If I reject? </dt>
                <dd className="inline text-on-emphasis-muted">
                  No cookie is set, nothing goes to Google, and the whole app still works.
                </dd>
              </div>
              <div>
                <dt className="font-bold inline">Change my mind? </dt>
                <dd className="inline text-on-emphasis-muted">
                  Any time, under &ldquo;Privacy and data&rdquo;.
                </dd>
              </div>
            </dl>
          </div>
        </details>

        {/* Equal weight on purpose. Refusing has to be as easy as agreeing. */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            id="btn-cookies-accept"
            onClick={() => decide(true)}
            className="min-h-[48px] flex-1 px-5 rounded-2xl bg-on-emphasis text-emphasis
                       hover:bg-on-emphasis-muted font-bold transition"
          >
            <span className="font-farsi">قبول</span>
            <span className="text-xs opacity-70"> · Accept</span>
          </button>
          <button
            id="btn-cookies-reject"
            onClick={() => decide(false)}
            className="min-h-[48px] flex-1 px-5 rounded-2xl border-2 border-white/40
                       text-on-emphasis hover:bg-white/10 font-bold transition"
          >
            <span className="font-farsi">رد کردن</span>
            <span className="text-xs opacity-70"> · Reject</span>
          </button>
        </div>

      </div>
    </div>
  );
};
