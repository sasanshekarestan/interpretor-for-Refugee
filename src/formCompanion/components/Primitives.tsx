import React from 'react';
import { t } from '../tokens';

type ButtonVariant = 'primary' | 'secondary' | 'quiet';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: `${t.primary} font-bold shadow-sm`,
  secondary: 'bg-white text-slate-800 border border-slate-300 font-semibold hover:bg-slate-50',
  quiet: 'bg-transparent text-slate-600 font-medium hover:bg-slate-100',
};

/** Three variants. There is no fourth. */
export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  fullWidth,
  className = '',
  children,
  ...rest
}) => (
  <button
    type="button"
    className={`${VARIANTS[variant]} ${t.focus} ${t.tapTarget} ${fullWidth ? 'w-full' : ''}
      inline-flex items-center justify-center gap-2 px-4 rounded-xl text-sm transition
      disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/** A square control for icon-only actions in the app bar. */
export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
> = ({ label, className = '', children, ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl
      text-slate-600 hover:bg-slate-100 transition cursor-pointer ${t.focus} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

type NoticeTone = 'info' | 'attention' | 'fault' | 'done';

const TONES: Record<NoticeTone, string> = {
  info: 'bg-slate-50 text-slate-700 border-slate-200',
  attention: t.attention,
  fault: t.faultSoft,
  done: t.doneSoft,
};

/**
 * One banner component, and at most one banner on screen at a time.
 * Every notice can be dismissed — none of them may permanently cost the user
 * vertical space above their form.
 */
export const Notice: React.FC<{
  tone?: NoticeTone;
  children: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}> = ({ tone = 'info', children, onDismiss, dismissLabel = 'بستن' }) => (
  <div
    className={`${TONES[tone]} border rounded-xl px-3.5 py-2.5 flex items-start gap-3 text-[13px] leading-relaxed font-farsi`}
    dir="rtl"
  >
    <div className="flex-1 min-w-0">{children}</div>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        className={`shrink-0 text-xs font-bold underline underline-offset-2 opacity-80 hover:opacity-100 cursor-pointer ${t.focus} rounded`}
      >
        {dismissLabel}
      </button>
    )}
  </div>
);

/** A small status pill. Colour carries the state; the label repeats it in words. */
export const Pill: React.FC<{ tone?: 'done' | 'neutral'; children: React.ReactNode }> = ({
  tone = 'neutral',
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
      tone === 'done' ? t.doneSoft : 'bg-slate-100 text-slate-700 border-slate-200'
    }`}
  >
    {children}
  </span>
);
