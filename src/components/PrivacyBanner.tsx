import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, X, Database, Server, UserX, EyeOff } from 'lucide-react';

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
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-3.5 sm:p-5 shadow-sm border border-teal-800/40 relative overflow-hidden w-full max-w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 w-full min-w-0">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 rounded-xl bg-teal-800/60 border border-teal-600/30 text-teal-300 shrink-0 mt-0.5">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-white flex flex-wrap items-center gap-1.5 break-words">
                  <span>🔒 Your conversations are private</span>
                </h3>
                <span className="text-teal-300 font-farsi text-xs font-semibold break-words">| گفتگوهای شما کاملاً خصوصی است</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed break-words">
                Your information is handled securely. We do not share your conversations with your caseworker, Home Office, landlord or other organisations unless you explicitly choose to share something.
              </p>
              <p className="text-[11px] text-teal-200 font-farsi mt-1 dir-rtl text-right break-words">
                اطلاعات شما امن است. گفتگوهای شما به پرونده، اداره مهاجرت (Home Office)، صاحب‌خانه یا سازمان دیگری فرستاده نمی‌شود.
              </p>
            </div>
          </div>

          <button
            id="btn-privacy-details"
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition shrink-0 self-start sm:self-center cursor-pointer"
          >
            <span>Privacy & data</span>
            <span className="font-farsi">→</span>
          </button>
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
