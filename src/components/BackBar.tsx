import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AppTab } from '../types';
import { TAB_LABELS } from './tabLabels';

interface BackBarProps {
  /** Where pressing it lands. Its name is on the button. */
  destination: AppTab;
  onBack: () => void;
}

/**
 * Back.
 *
 * There was no way back. Every screen was a tab in component state and nothing
 * touched the browser's history, so the phone's own back gesture left the app
 * entirely instead of returning to the previous screen. Someone who opened the
 * letter reader by mistake had to work out that the small house icon at the
 * foot of the screen was the way out.
 *
 * So: one button, on every screen except home, and the browser's back button
 * and this one now do the same thing.
 *
 * It is deliberately louder than the rest of the chrome. This is the control
 * people reach for most, and the audience for this app includes people with
 * uncorrected vision reading a cracked screen in a waiting room. A quiet grey
 * chevron would be correct and useless.
 *
 * It names its destination rather than saying only "back", because a person
 * who is lost is helped by knowing where the button goes, not that it goes.
 */
export const BackBar: React.FC<BackBarProps> = ({ destination, onBack }) => {
  const label = TAB_LABELS[destination];

  return (
    <div className="bg-surface border-b border-edge print:hidden w-full max-w-full">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5">
        <button
          id="btn-back"
          type="button"
          onClick={onBack}
          aria-label={`بازگشت به ${label.fa} / Back to ${label.en}`}
          className="group inline-flex items-center gap-3 min-h-[48px] ps-2 pe-4 rounded-full
                     border-2 border-primary bg-surface text-primary
                     hover:bg-primary hover:text-on-primary
                     focus-visible:outline-none transition cursor-pointer max-w-full"
        >
          {/* A filled disc, so the arrow reads at a glance and at a distance.
              It inverts on hover along with the rest of the button. */}
          <span
            aria-hidden="true"
            className="shrink-0 w-9 h-9 rounded-full bg-primary text-on-primary
                       group-hover:bg-on-primary group-hover:text-primary
                       flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </span>

          <span className="text-left leading-tight min-w-0">
            <span className="block font-farsi text-base font-bold truncate">
              بازگشت به {label.fa}
            </span>
            <span className="block text-xs font-semibold opacity-80 truncate">
              Back to {label.en}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};
