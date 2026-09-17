import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, X, Database, UserX, EyeOff, Cookie } from 'lucide-react';
import { CookieChoice, analyticsAvailable, readCookieChoice, forgetCookieChoice } from '../utils/analytics';

interface PrivacyBannerProps {
  /**
   * Opens the full Privacy Policy. The banner's own short panel keeps the
   * cookie "Change my choice" control, and links out to this for the detail,
   * so both stay reachable rather than one shadowing the other.
   */
  onOpenPrivacyPolicy?: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [showModal, setShowModal] = useState(false);
  const [cookieChoice, setCookieChoice] = useState<CookieChoice | null>(null);

  useEffect(() => {
    if (showModal) setCookieChoice(readCookieChoice());
  }, [showModal]);

  const handleOpen = () => setShowModal(true);

  return (
    <>
      {/* A notice, in the shape design.md gives every notice: a rule down the
          edge, a heading, and one language per block. It was a dark slab with
          a three-stop gradient across it, and the Persian carried a class
          called "dir-rtl", which is not a thing - so the one paragraph that
          most needed right-to-left was never actually set to it, and read as
          scrambled punctuation. */}
      <div className="bg-surface border border-edge border-l-4 border-l-primary rounded-lg p-4 sm:p-5 w-full max-w-full">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary shrink-0 mt-1" aria-hidden="true" />

          <div className="min-w-0 flex-1 space-y-4">
            <div dir="rtl" className="space-y-1">
              <h3 className="font-farsi font-bold text-lg text-ink leading-tight">
                گفتگوهای شما کاملاً خصوصی است
              </h3>
              <p className="font-farsi text-base text-ink-muted leading-relaxed">
                اطلاعات شما امن است. گفتگوهای شما به پرونده، اداره مهاجرت
                (<span dir="ltr">Home Office</span>)، صاحب‌خانه یا سازمان دیگری فرستاده نمی‌شود،
                مگر خودتان بخواهید.
              </p>
            </div>

            <div className="space-y-1 border-t border-edge pt-3">
              <h4 className="font-bold text-base text-ink">Your conversations are private</h4>
              <p className="text-base text-ink-muted leading-relaxed">
                Your information is handled securely. We do not share your conversations with your
                caseworker, Home Office, landlord or other organisations unless you explicitly
                choose to share something.
              </p>
            </div>

            <button
              id="btn-privacy-details"
              onClick={handleOpen}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-edge-control
                         text-ink hover:bg-page transition cursor-pointer text-sm font-semibold"
            >
              <span className="font-farsi">حریم خصوصی و داده‌ها</span>
              <span className="text-ink-muted">Privacy and data</span>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-emphasis/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-hamyar border border-edge max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-edge">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-ink text-lg">Privacy & Data Security</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-ink-muted hover:text-ink-muted hover:bg-page"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-ink-muted leading-relaxed">
              <div className="p-3 bg-page rounded-2xl border border-edge text-primary">
                <p className="font-semibold text-ink mb-1">Our Data Commitment to You / تعهد ما به حفظ حریم خصوصی شما</p>
                <p>
                  This application is designed specifically as an independent communication tool for asylum seekers and refugees in the UK.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserX className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-ink text-xs">Never sent to the authorities</h4>
                    <p className="text-ink-muted">Nothing you do here is reported to the Home Office, NASS, a caseworker, a solicitor or a landlord. We hold no accounts and no server-side record of your documents or conversations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EyeOff className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-ink text-xs">How translation works</h4>
                    {/* This used to say translation was "stateless" and that
                        everything stayed on the device. That is not true: a
                        scanned photo or a recording is sent to Google to be
                        read. Saying otherwise to people frightened of being
                        tracked is exactly the wrong thing to do, so it says the
                        real thing now and points to the full policy. */}
                    <p className="text-ink-muted">To translate a photo or a recording, it is sent to Google's AI service, read, and discarded. On our paid tier Google does not use it to train its models. We do not sell data or track you for advertising.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-ink text-xs">Kept only on your device</h4>
                    <p className="text-ink-muted">Anything you save stays in your own device's browser. You can clear your history and saved documents at any time with a single tap.</p>
                  </div>
                </div>
              </div>

              {onOpenPrivacyPolicy && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    onOpenPrivacyPolicy();
                  }}
                  className="inline-flex items-center min-h-[44px] text-primary underline underline-offset-2
                             hover:no-underline text-xs font-semibold"
                >
                  <span className="font-farsi">سیاست کامل حریم خصوصی</span>
                  <span> · Read the full Privacy Policy</span>
                </button>
              )}
            </div>

            {/* Consent is not a one-time thing: a person has to be able to
                change their mind as easily as they gave it. Clearing the
                answer brings the notice back and deletes the GA cookies. */}
            {analyticsAvailable() && (
              <div className="p-3 bg-page rounded-2xl border border-edge space-y-2">
                <div className="flex items-start gap-2">
                  <Cookie className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-ink text-xs">Counting visits</h4>
                    <p className="text-ink-muted">
                      {cookieChoice === 'accepted'
                        ? 'You agreed to let us count visits with Google Analytics.'
                        : cookieChoice === 'rejected'
                          ? 'You said no, so nothing is counted and no cookie is set.'
                          : 'You have not been asked yet.'}
                    </p>
                  </div>
                </div>
                {cookieChoice && (
                  <button
                    onClick={() => {
                      forgetCookieChoice();
                      setCookieChoice(null);
                      setShowModal(false);
                    }}
                    className="min-h-[44px] w-full px-3 rounded-xl border border-edge-control bg-surface
                               hover:bg-page text-ink text-xs font-bold transition"
                  >
                    <span className="font-farsi">تغییر انتخاب</span>
                    <span className="text-ink-muted"> · Change my choice</span>
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-edge flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary-press transition"
              >
                Understood / متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
