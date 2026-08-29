import React from 'react';
import { TranslationDirection, EmbedSettings, UserLanguage } from '../types';
import { 
  Globe2,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  direction?: TranslationDirection;
  onToggleDirection?: () => void;
  settings: EmbedSettings;
  onUpdateSettings: (settings: Partial<EmbedSettings>) => void;
  onOpenQuickPhrases: () => void;
  onOpenSettings: () => void;
  selectedDialectHint: string;
  onSelectDialectHint: (hint: string) => void;
  isCompactMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  direction,
  onToggleDirection,
  settings,
  onUpdateSettings,
  onOpenSettings,
  selectedDialectHint,
  onSelectDialectHint,
  isCompactMode = false,
}) => {
  const currentLang = settings.userLanguage || 'farsi';

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur sticky top-0 z-30 transition-all shadow-2xs print:hidden w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 py-2.5 sm:px-6 sm:py-3 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand & Purpose */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 shrink-0">
              <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <h1 className="font-bold text-slate-900 text-xs xs:text-sm sm:text-base md:text-lg leading-tight tracking-tight flex flex-wrap items-center gap-1 sm:gap-1.5 break-words">
                  <span>Farsi & Dari UK Interpreter</span>
                  <span className="text-teal-700 font-farsi font-semibold text-xs sm:text-base">| همراه و مترجم بریتانیا</span>
                </h1>
              </div>
              <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-500 font-medium flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 break-words">
                <span className="text-teal-700 font-semibold">Understand. Speak. Complete.</span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-slate-600 font-farsi">بفهمید. صحبت کنید. تکمیل کنید.</span>
              </p>
            </div>
          </div>

          {/* Controls: Settings */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Settings */}
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              title="Settings / تنظیمات"
              aria-label="Settings / تنظیمات"
              className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};


