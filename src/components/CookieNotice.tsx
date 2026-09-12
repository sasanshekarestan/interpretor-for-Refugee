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

interface CookieNoticeProps {
  /** Opens the fuller privacy explanation. */
  onOpenPrivacy?: () => void;
}

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
export const CookieNotice: React.FC<CookieNoticeProps> = ({ onOpenPrivacy }) => {
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
                   rounded-3xl shadow-lg p-4 sm:p-5 space-y-3.5"
      >
        {/* Short on purpose. At 390px the first draft of this filled the
            screen, which is a bad first thing to meet when you opened the app
            because a letter arrived. Everything that matters is still here:
            who counts, why, what is never sent, and that no costs nothing. */}
        <div dir="rtl" className="flex items-start gap-3">
          <Cookie className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 min-w-0">
            <h2 className="font-farsi font-bold text-lg leading-tight">
              اجازه می‌دهید بازدیدها را بشماریم؟
            </h2>
            <p className="font-farsi text-base text-on-emphasis-muted leading-relaxed">
              برای گرفتن بودجه باید بدانیم چند نفر از برنامه استفاده می‌کنند. Google Analytics یک
              کوکی روی دستگاه شما می‌گذارد. حرف‌ها، نامه‌ها و فرم‌های شما هرگز فرستاده نمی‌شود، و
              با «نه» هم همه‌چیز مثل قبل کار می‌کند.
            </p>
          </div>
        </div>

        <div dir="ltr" className="font-latin space-y-1 border-t border-white/15 pt-2.5">
          <h3 className="font-bold text-base">May we count visits?</h3>
          <p className="text-sm text-on-emphasis-muted leading-relaxed">
            To get funding we need to know how many people use Hamyar. Google Analytics puts one
            cookie on your device. Your conversations, letters and forms are never sent, and the
            app still works if you say no.
          </p>
        </div>

        {/* Equal weight on purpose. Refusing has to be as easy as agreeing. */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            id="btn-cookies-accept"
            onClick={() => decide(true)}
            className="min-h-[48px] flex-1 px-5 rounded-2xl bg-on-emphasis text-emphasis
                       hover:bg-on-emphasis-muted font-bold transition"
          >
            <span className="font-farsi">بله، اشکالی ندارد</span>
            <span className="text-xs opacity-70"> · Yes</span>
          </button>
          <button
            id="btn-cookies-reject"
            onClick={() => decide(false)}
            className="min-h-[48px] flex-1 px-5 rounded-2xl border-2 border-white/40
                       text-on-emphasis hover:bg-white/10 font-bold transition"
          >
            <span className="font-farsi">نه، ممنون</span>
            <span className="text-xs opacity-70"> · No</span>
          </button>
        </div>

        {onOpenPrivacy && (
          <button
            onClick={onOpenPrivacy}
            className="min-h-[44px] w-full text-sm text-on-emphasis-muted underline underline-offset-2 hover:text-on-emphasis transition"
          >
            <span className="font-farsi">حریم خصوصی و داده‌ها</span>
            <span> · Privacy and data</span>
          </button>
        )}
      </div>
    </div>
  );
};
