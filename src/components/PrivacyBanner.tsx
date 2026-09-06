import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Database, UserX, EyeOff } from 'lucide-react';

interface PrivacyBannerProps {
  onOpenPrivacyModal?: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onOpenPrivacyModal }) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpen = () => {
    if (onOpenPrivacyModal) {
      onOpenPrivacyModal();
    } else {
      setShowModal(true);
    }
  };

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-700">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="font-bold text-slate-900 text-lg">Privacy & Data Security</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-teal-900">
                <p className="font-semibold text-slate-900 mb-1">Our Data Commitment to You / تعهد ما به حفظ حریم خصوصی شما</p>
                <p>
                  This application is designed specifically as an independent communication tool for asylum seekers and refugees in the UK.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserX className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Zero External Reporting</h4>
                    <p className="text-slate-600">Your audio, transcribed text, and form entries are strictly confined to your session. We do not transmit reports to the UK Home Office, NASS, solicitors, or landlords.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EyeOff className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">No Advertisers or Profiling</h4>
                    <p className="text-slate-600">We do not sell data or track users for advertising. All translation processing is stateless.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Database className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Local Control & Deletion</h4>
                    <p className="text-slate-600">You can clear your conversation history and cached saved documents at any time from the settings menu with a single click.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
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
