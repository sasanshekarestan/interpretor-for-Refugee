import React from 'react';
import { FileText, ListChecks } from 'lucide-react';
import { PhoneView } from '../types';
import { t } from '../tokens';

interface BottomBarProps {
  view: PhoneView;
  onChange: (view: PhoneView) => void;
  answered: number;
  total: number;
}

/**
 * Document / Questions, within thumb reach, with progress built in so the
 * progress bar does not need a row of its own above the form.
 */
export const BottomBar: React.FC<BottomBarProps> = ({ view, onChange, answered, total }) => {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  const tab = (id: PhoneView, icon: React.ReactNode, fa: string, en: string) => {
    const active = view === id;
    return (
      <button
        type="button"
        onClick={() => onChange(id)}
        aria-current={active}
        className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer transition
          ${active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'} ${t.focus}`}
      >
        <span className={active ? t.primaryText : ''}>{icon}</span>
        <span className="font-farsi text-[11px] font-bold leading-none">{fa}</span>
        <span className="sr-only">{en}</span>
      </button>
    );
  };

  return (
    <nav className={`${t.bar} border-t shrink-0 relative`} dir="rtl" style={{ height: 56 }}>
      {/* Progress lives in the bar itself, not in a row of its own. */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-100">
        <div
          className={`${t.doneFill} h-full transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={answered}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${answered} از ${total} پاسخ داده شده`}
        />
      </div>

      <div className="flex h-full items-stretch">
        {tab('document', <FileText className="w-5 h-5" />, 'سند رسمی', 'Document')}
        <div className="w-px bg-slate-200 my-3" />
        {tab('questions', <ListChecks className="w-5 h-5" />, 'سوال‌ها', 'Questions')}
      </div>

      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-slate-500 tabular-nums pointer-events-none">
        {answered}/{total}
      </span>
    </nav>
  );
};
