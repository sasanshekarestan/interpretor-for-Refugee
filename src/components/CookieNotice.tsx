import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';
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
  const [showPolicy, setShowPolicy] = useState(false);

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
                   rounded-3xl shadow-lg p-4 sm:p-5 space-y-3.5"
      >
        {/* The wording is the standard notice Sasan asked for, with one
            phrase removed: "and personalize content". Hamyar personalises
            nothing - no profiling, no recommendations, nothing that differs
            per person - and claiming otherwise in a privacy notice is a false
            statement about the product, made to exactly the people most
            frightened of being profiled.

            "Visit our Cookie Policy" pointed at nothing, so the policy is
            written below and opens in place rather than sending a person off
            to a page that does not exist. */}
        <div dir="rtl" className="flex items-start gap-3">
          <Cookie className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 min-w-0">
            <h2 className="font-farsi font-bold text-lg leading-tight">کوکی‌ها</h2>
            <p className="font-farsi text-base text-on-emphasis-muted leading-relaxed">
              ما از کوکی‌ها و فناوری‌های مشابه استفاده می‌کنیم تا تجربهٔ شما بهتر شود و آمار
              بازدید سایت را بسنجیم. با زدن «قبول»، با استفاده از همهٔ کوکی‌ها موافقت می‌کنید.
              برای اینکه بدانید چطور از آن‌ها استفاده می‌کنیم،{' '}
              <button
                onClick={() => setShowPolicy((open) => !open)}
                className="underline underline-offset-2 font-bold text-on-emphasis"
              >
                سیاست کوکی
              </button>{' '}
              ما را ببینید.
            </p>
          </div>
        </div>

        <div dir="ltr" className="font-latin space-y-1 border-t border-white/15 pt-2.5">
          <h3 className="font-bold text-base">Cookies</h3>
          <p className="text-sm text-on-emphasis-muted leading-relaxed">
            We use cookies and similar technologies to help improve your experience and analyze
            site traffic. By clicking &lsquo;Accept&rsquo;, you consent to the use of all cookies.
            Visit our{' '}
            <button
              id="btn-cookie-policy"
              onClick={() => setShowPolicy((open) => !open)}
              className="underline underline-offset-2 font-bold text-on-emphasis"
            >
              Cookie Policy
            </button>{' '}
            to read more about how we use them.
          </p>
        </div>

        {/* The policy itself. Short, specific, and checkable: a person can
            hold every line of it against what the app actually does. */}
        {showPolicy && (
          <div className="rounded-2xl bg-white/10 border border-white/20 p-3.5 space-y-3 max-h-[38vh] overflow-y-auto">
            <div dir="rtl" className="font-farsi space-y-1.5">
              <h4 className="font-bold text-base">سیاست کوکی</h4>
              <p className="text-sm text-on-emphasis-muted leading-relaxed">
                اگر «قبول» را بزنید، Google Analytics یک کوکی به نام <span dir="ltr">_ga</span> روی دستگاه شما
                می‌گذارد. با آن می‌شمارند چند نفر از برنامه استفاده می‌کنند و هر بار چقدر. این
                کوکی تا دو سال روی دستگاه می‌ماند، مگر آنکه خودتان پاکش کنید.
              </p>
              <p className="text-sm text-on-emphasis-muted leading-relaxed">
                این آمار را برای گرفتن بودجه و ادامهٔ کار برنامه لازم داریم. حرف‌ها، نامه‌ها،
                فرم‌ها و مدارک شما هرگز فرستاده نمی‌شود و ما آن‌ها را نمی‌بینیم.
              </p>
              <p className="text-sm text-on-emphasis-muted leading-relaxed">
                اگر «رد» را بزنید هیچ کوکی گذاشته نمی‌شود، هیچ چیزی به Google فرستاده نمی‌شود، و
                همهٔ بخش‌های برنامه دقیقاً مثل قبل کار می‌کند. هر وقت خواستید می‌توانید نظرتان را
                در بخش «حریم خصوصی و داده‌ها» عوض کنید.
              </p>
            </div>
            <div dir="ltr" className="font-latin space-y-1.5 border-t border-white/15 pt-2.5">
              <h4 className="font-bold text-base">Cookie Policy</h4>
              <p className="text-sm text-on-emphasis-muted leading-relaxed">
                If you accept, Google Analytics sets one cookie called _ga on your device. It
                counts how many people use Hamyar and how long each visit lasts. It stays for up
                to two years unless you delete it.
              </p>
              <p className="text-sm text-on-emphasis-muted leading-relaxed">
                We need those numbers to get funding and keep Hamyar running. Your conversations,
                letters, forms and documents are never sent, and we cannot see them.
              </p>
              <p className="text-sm text-on-emphasis-muted leading-relaxed">
                If you reject, no cookie is set, nothing is sent to Google, and every part of the
                app works exactly the same. You can change your mind at any time under
                &ldquo;Privacy and data&rdquo;.
              </p>
            </div>
          </div>
        )}

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
