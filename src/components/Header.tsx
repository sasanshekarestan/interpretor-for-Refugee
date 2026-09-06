import React from 'react';
import { TranslationDirection, EmbedSettings, UserLanguage } from '../types';
import { 
  Globe2,
  SlidersHorizontal,
  Volume2
} from 'lucide-react';

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
          {/* Brand & Purpose */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 shrink-0">
              <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            {/* One language per block. These used to run together on one line
                separated by a pipe, so two reading directions met in the middle
                and neither name got a clean start. Persian leads because that
                is who the app is for; the English sits under it for whoever is
                on the other side of the desk. */}
            {/* Both lines start from the same edge. Marking the Persian rtl
                here threw it to the far side of the header, away from the
                English underneath it: a single word has no bidi ambiguity to
                resolve, so it does not need the direction set. */}
            <div className="min-w-0 flex-1">
              <h1 className="font-farsi font-bold text-primary text-lg leading-tight">همیار</h1>
              <p className="text-sm text-ink-muted leading-tight truncate">
                Farsi &amp; Dari UK Interpreter
              </p>
            </div>
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


