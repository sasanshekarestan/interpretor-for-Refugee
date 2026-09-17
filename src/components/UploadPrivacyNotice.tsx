import React from 'react';
import { Info } from 'lucide-react';

interface UploadPrivacyNoticeProps {
  /**
   * Opens the full privacy policy. Optional: where a screen has no way to open
   * it, the notice simply omits the link rather than showing a dead one.
   */
  onOpenPolicy?: () => void;
}

/**
 * A short privacy note shown right where a person is about to send a photo.
 *
 * This came from Jon Beech at Leeds Asylum Support Network, who made the fair
 * point that the Gemini back-end was explained in the full policy but not at
 * the moment it matters: when someone is about to upload a photo of a document.
 * For some people the fact that Google reads it is reassurance; for others it
 * is a reason to stop. Either way they should know before they tap, not after,
 * and be able to decide with the facts in front of them.
 *
 * So it says the plain truth in one short paragraph, in both languages, with a
 * way through to the full policy. It is deliberately not alarming and not
 * buried: an even, factual note next to the button.
 */
export const UploadPrivacyNotice: React.FC<UploadPrivacyNoticeProps> = ({ onOpenPolicy }) => (
  <div className="rounded-2xl bg-page border border-edge p-3.5 text-start">
    <div className="flex items-start gap-2.5">
      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0 space-y-2">
        <p dir="rtl" className="font-farsi text-sm text-ink-muted leading-relaxed">
          عکس شما برای خواندن و ترجمه به{' '}
          <span dir="ltr" className="font-latin">Google Gemini</span> فرستاده می‌شود. همیار نسخه‌ای
          از آن نگه نمی‌دارد. گوگل از آن برای آموزش مدل‌های هوش مصنوعی خود استفاده نمی‌کند، اما ممکن
          است اطلاعات را برای مدتی کوتاه و تنها برای امنیت و مسائل قانونی نگه دارد.
        </p>
        <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed border-t border-edge pt-2">
          Your photo will be sent to Google Gemini to read and translate it. Hamyar does not keep a
          copy. Google does not use it to train its AI models, but may retain information temporarily
          for security and legal purposes.
          {onOpenPolicy && (
            <>
              {' '}
              <button
                type="button"
                onClick={onOpenPolicy}
                className="text-primary underline underline-offset-2 hover:no-underline font-semibold"
              >
                More about privacy
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  </div>
);
