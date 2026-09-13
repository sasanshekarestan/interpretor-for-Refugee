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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emphasis/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full shadow-hamyar border border-edge overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-edge bg-page flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <h2 className="leading-tight">
              <span dir="rtl" className="block font-farsi font-bold text-ink text-lg">تنظیمات</span>
              <span dir="ltr" className="block font-latin text-sm text-ink-muted">Settings</span>
            </h2>
          </div>
          <button
            id="btn-close-settings-modal"
            onClick={onClose}
            title="Close Settings / بستن تنظیمات"
            aria-label="Close Settings / بستن تنظیمات"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-muted hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 text-xs sm:text-sm">
          {/* Text Size Control */}
          <div className="space-y-2">
            <label className="font-bold text-ink flex items-center gap-1.5">
              <Type className="w-4 h-4 text-primary" />
              <span className="text-start leading-tight">
                <span dir="rtl" className="block font-farsi font-bold text-base text-ink">اندازهٔ متن</span>
                <span dir="ltr" className="block font-latin text-sm text-ink-muted">Text size</span>
              </span>
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
                      ? 'bg-primary text-white border-primary shadow-hamyar'
                      : 'bg-page hover:bg-page text-ink-muted border-edge'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speed */}
          <div className="space-y-2 pt-2 border-t border-edge">
            <div className="flex items-center justify-between">
              <label htmlFor="range-voice-speed" className="font-bold text-ink flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-primary" />
                <span className="text-start leading-tight">
                  <span dir="rtl" className="block font-farsi font-bold text-base text-ink">سرعت خواندن</span>
                  <span dir="ltr" className="block font-latin text-sm text-ink-muted">Speech pace</span>
                </span>
              </label>
              <span className="font-mono text-xs font-semibold text-primary bg-page px-2 py-0.5 rounded">
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
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Slower & Clear (0.7x)</span>
              <span>Normal (1.0x)</span>
              <span>Brisk (1.3x)</span>
            </div>
          </div>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-edge">
            <div>
              <div className="leading-tight">
                <span dir="rtl" className="block font-farsi font-bold text-base text-ink">پخش خودکار صدا</span>
                <span dir="ltr" className="block font-latin text-sm text-ink-muted">Read translations aloud automatically</span>
              </div>
              <div className="text-xs text-ink-muted">
                Automatically read translations aloud after recording
              </div>
            </div>
            <button
              id="btn-toggle-autospeak-setting"
              onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
              title={settings.autoSpeak ? 'Auto-speak enabled / پخش صوتی خودکار فعال' : 'Auto-speak disabled / پخش صوتی غیرفعال'}
              aria-label={settings.autoSpeak ? 'Auto-speak enabled / پخش صوتی خودکار فعال' : 'Auto-speak disabled / پخش صوتی غیرفعال'}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out ${
                settings.autoSpeak ? 'bg-primary' : 'bg-page'
              }`}
            >
              <div
                className={`bg-surface w-4 h-4 rounded-full shadow-hamyar transform transition duration-200 ease-in-out ${
                  settings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Moved Toolbar Tools: UK Terminology & Visitor Stats */}
          <div className="space-y-2 pt-3 border-t border-edge">
            <div className="mb-2 leading-tight">
              <span dir="rtl" className="block font-farsi font-bold text-base text-ink">ابزارها و راهنماها</span>
              <span dir="ltr" className="block font-latin text-sm text-ink-muted">Tools and reference</span>
            </div>
            
            {onOpenLexicon && (
              <button
                id="btn-settings-uk-lexicon"
                onClick={() => {
                  onClose();
                  onOpenLexicon();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-page hover:bg-page border border-edge transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-bold text-ink">UK Terminology Lookup</div>
                    <div className="text-xs text-ink-muted font-farsi">راهنمای اصطلاحات هوم آفیس و خدمات بهداشتی (NHS)</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">Open</span>
              </button>
            )}

            {onOpenAnalytics && (
              <button
                id="btn-settings-analytics"
                onClick={() => {
                  onClose();
                  onOpenAnalytics();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-page hover:bg-page border border-edge transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-bold text-ink">Visitor & Usage Stats</div>
                    <div className="text-xs text-ink-muted font-farsi">آمار استفاده و ارزیابی سیستم</div>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary">Open</span>
              </button>
            )}
          </div>

          {/* Clear History */}
          {historyCount > 0 && (
            <div className="pt-3 border-t border-edge flex items-center justify-between">
              <span className="text-xs text-ink-muted">{historyCount} saved items</span>
              <button
                id="btn-clear-history"
                onClick={onClearHistory}
                title="Clear Session History / پاک کردن تاریخچه گفتگو"
                aria-label="Clear Session History / پاک کردن تاریخچه گفتگو"
                className="inline-flex items-center gap-1 text-xs text-fault hover:text-fault bg-fault-bg hover:bg-fault-bg px-2.5 py-1.5 rounded-lg font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-edge bg-page flex justify-end">
          <button
            id="btn-close-settings-done"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary text-white font-semibold text-xs transition"
          >
            <span className="text-start leading-tight">
              <span dir="rtl" className="block font-farsi font-bold text-base">تأیید</span>
              <span dir="ltr" className="block font-latin text-sm opacity-80">Done</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
