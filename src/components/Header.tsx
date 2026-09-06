import React from 'react';
import { TranslationDirection, EmbedSettings, UserLanguage } from '../types';
import { SlidersHorizontal, Volume2 } from 'lucide-react';
import { HamyarWordmark } from './HamyarWordmark';

interface HeaderProps {
  direction?: TranslationDirection;
  onToggleDirection?: () => void;
  settings: EmbedSettings;
  onUpdateSettings: (settings: Partial<EmbedSettings>) => void;
  onOpenQuickPhrases: () => void;
  onOpenSettings: () => void;
  /** Speak a prepared phrase out loud for the person in front of them. */
  onOpenSayItForMe?: () => void;
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
  onOpenSayItForMe,
  selectedDialectHint,
  onSelectDialectHint,
  isCompactMode = false,
}) => {
  const currentLang = settings.userLanguage || 'farsi';

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur sticky top-0 z-30 transition-all shadow-2xs print:hidden w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 py-2.5 sm:px-6 sm:py-3 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* The wordmark carries the name, so there is no round badge and no
              Persian heading beside it any more: three marks competing for the
              same corner was two too many. It takes its colour from the text,
              which is how one file serves a light header and a dark one. */}
          {/* Not stretched. Given the full width of a desktop header, the
              Persian line right-aligns to the far edge and ends up nowhere near
              the English under it. Sized to its content, the two sit together
              and each still starts from its own side. */}
          <div className="min-w-0">
            <HamyarWordmark className="h-6 sm:h-7 w-auto text-primary" title="Hamyar / همیار" />
            <p className="font-farsi text-sm text-ink-muted leading-snug mt-1" dir="rtl">
              همراهی برای زندگی آسان‌تر در بریتانیا
            </p>
            <p className="text-sm text-ink-muted leading-snug">
              A companion for easy integration in the UK
            </p>
          </div>

          {/* Controls. These live up here rather than floating over the page:
              a fixed button in the corner lands on top of whatever happens to
              be scrolled under it, which on the home screen was the link that
              starts a conversation. */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenSayItForMe && (
              <button
                id="btn-say-it-for-me"
                onClick={onOpenSayItForMe}
                title="Say it for me / برای من بگو"
                aria-label="Say it for me / برای من بگو"
                className="min-h-[44px] min-w-[44px] p-2 rounded-full text-on-primary bg-primary hover:bg-primary-press transition shrink-0 cursor-pointer flex items-center justify-center"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
            {/* Settings */}
            <button
              id="btn-settings"
              onClick={onOpenSettings}
              title="Settings / تنظیمات"
              aria-label="Settings / تنظیمات"
              className="min-h-[44px] min-w-[44px] p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition shrink-0 cursor-pointer flex items-center justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};


