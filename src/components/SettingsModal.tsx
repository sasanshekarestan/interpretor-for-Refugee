import React from 'react';
import { EmbedSettings } from '../types';
import { X, SlidersHorizontal, Volume2, Trash2, BookOpen, BarChart3, Type } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmbedSettings;
  onUpdateSettings: (settings: Partial<EmbedSettings>) => void;
  onClearHistory: () => void;
  historyCount: number;
  onOpenLexicon?: () => void;
  onOpenAnalytics?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
  historyCount,
  onOpenLexicon,
  onOpenAnalytics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-700" />
            <h2 className="font-bold text-slate-900 text-base">Settings / تنظیمات</h2>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            title="Close Settings / بستن تنظیمات"
            aria-label="Close Settings / بستن تنظیمات"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 text-xs sm:text-sm">
          {/* Text Size Control */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-teal-700" />
              <span>Text Size / اندازه متن:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'large', label: 'Large' },
                { id: 'xlarge', label: 'Extra Large' },
              ].map((size) => (
                <button
                  key={size.id}
                  onClick={() => onUpdateSettings({ fontSize: size.id as any })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    (settings.fontSize || 'normal') === size.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speed */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="range-voice-speed" className="font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-teal-700" />
                <span>British Speech Pace / سرعت خواندن:</span>
              </label>
              <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                {(settings.voiceSpeed || 1.0).toFixed(2)}x
              </span>
            </div>
            <input
              id="range-voice-speed"
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.voiceSpeed || 1.0}
              onChange={(e) => onUpdateSettings({ voiceSpeed: parseFloat(e.target.value) })}
              title="Voice Pace Speed / سرعت پخش صوتی"
              aria-label="Voice Pace Speed / سرعت پخش صوتی"
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Slower & Clear (0.7x)</span>
              <span>Normal (1.0x)</span>
              <span>Brisk (1.3x)</span>
            </div>
          </div>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <div className="font-bold text-slate-800">Auto-Voice Playback</div>
              <div className="text-[11px] text-slate-500">
                Automatically read translations aloud after recording
              </div>
            </div>
            <button
              id="btn-toggle-autospeak-setting"
              onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
              title={settings.autoSpeak ? 'Auto-speak enabled / پخش صوتی خودکار فعال' : 'Auto-speak disabled / پخش صوتی غیرفعال'}
              aria-label={settings.autoSpeak ? 'Auto-speak enabled / پخش صوتی خودکار فعال' : 'Auto-speak disabled / پخش صوتی غیرفعال'}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out ${
                settings.autoSpeak ? 'bg-teal-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  settings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Moved Toolbar Tools: UK Terminology & Visitor Stats */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="font-bold text-slate-800 mb-2">Tools & Reference Guides:</div>
            
            {onOpenLexicon && (
              <button
                id="btn-settings-uk-lexicon"
                onClick={() => {
                  onClose();
                  onOpenLexicon();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-teal-700" />
                  <div>
                    <div className="font-bold text-slate-900">UK Terminology Lookup</div>
                    <div className="text-[11px] text-slate-500 font-farsi">راهنمای اصطلاحات هوم آفیس و خدمات بهداشتی (NHS)</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-teal-700">Open ➔</span>
              </button>
            )}

            {onOpenAnalytics && (
              <button
                id="btn-settings-analytics"
                onClick={() => {
                  onClose();
                  onOpenAnalytics();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-emerald-700" />
                  <div>
                    <div className="font-bold text-slate-900">Visitor & Usage Stats</div>
                    <div className="text-[11px] text-slate-500 font-farsi">آمار استفاده و ارزیابی سیستم</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700">Open ➔</span>
              </button>
            )}
          </div>

          {/* Clear History */}
          {historyCount > 0 && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">{historyCount} saved items</span>
              <button
                id="btn-clear-history"
                onClick={onClearHistory}
                title="Clear Session History / پاک کردن تاریخچه گفتگو"
                aria-label="Clear Session History / پاک کردن تاریخچه گفتگو"
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            id="btn-close-settings-done"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition"
          >
            Done / تایید
          </button>
        </div>
      </div>
    </div>
  );
};
