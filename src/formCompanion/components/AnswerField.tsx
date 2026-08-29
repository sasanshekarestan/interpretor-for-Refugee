import React from 'react';
import { Mic, Square, Loader2, Copy, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { Notice } from './Primitives';
import { PendingExtraction, AiCallError } from '../useFormSession';
import { t } from '../tokens';

interface AnswerFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  disabled?: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  pending: PendingExtraction | null;
  error: AiCallError | null;
  englishAnswer?: string;
  placeholderFa: string;
}

/**
 * The one input on the screen.
 *
 * Voice is an adornment inside the field rather than a separate control, and
 * the assistant's own box lives in a sheet that covers this one — so a user is
 * never choosing between two boxes that look alike and do opposite things.
 */
export const AnswerField: React.FC<AnswerFieldProps> = ({
  value,
  onChange,
  onSubmit,
  onRetry,
  disabled,
  isProcessing,
  isRecording,
  onToggleRecording,
  pending,
  error,
  englishAnswer,
  placeholderFa,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    if (!englishAnswer) return;
    navigator.clipboard?.writeText(englishAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3" dir="rtl">
      <label htmlFor="answer-field" className="block font-farsi text-[13px] font-bold text-slate-700">
        پاسخ خود را بنویسید یا بگویید
      </label>

      <div
        className={`relative rounded-2xl border bg-white transition
          ${isRecording ? 'border-[#005EB8] ring-2 ring-[#005EB8]/25' : 'border-slate-300'}`}
      >
        <textarea
          id="answer-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          dir="auto"
          placeholder={placeholderFa}
          className="w-full bg-transparent resize-none px-3.5 py-3 pl-14 font-farsi text-[15px] leading-relaxed
            text-slate-900 placeholder:text-slate-400 focus:outline-none rounded-2xl"
        />

        <button
          type="button"
          onClick={onToggleRecording}
          aria-label={isRecording ? 'توقف ضبط صدا' : 'پاسخ با صدا'}
          aria-pressed={isRecording}
          className={`absolute left-2.5 bottom-2.5 w-10 h-10 inline-flex items-center justify-center rounded-xl
            cursor-pointer transition ${t.focus}
            ${isRecording ? 'bg-[#005EB8] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {isRecording ? <Square className="w-4 h-4" fill="currentColor" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      {isProcessing && (
        <p className="flex items-center gap-2 font-farsi text-[12.5px] text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          در حال آماده‌سازی پاسخ انگلیسی…
        </p>
      )}

      {error && (
        <Notice tone="fault">
          <div className="space-y-2">
            <p>{error.messageFa}</p>
            <button
              type="button"
              onClick={onRetry}
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${t.faultText} cursor-pointer underline underline-offset-2`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تلاش دوباره
            </button>
          </div>
        </Notice>
      )}

      {pending?.warningFa && !error && (
        <Notice tone="attention">
          <span className="inline-flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pending.warningFa}</span>
          </span>
        </Notice>
      )}

      {englishAnswer && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-farsi text-[12.5px] font-bold text-slate-600">
              این را روی فرم کاغذی بنویسید:
            </p>
            <button
              type="button"
              onClick={copy}
              className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer ${t.focus} rounded px-1`}
            >
              {copied ? <Check className={`w-3.5 h-3.5 ${t.doneText}`} /> : <Copy className="w-3.5 h-3.5" />}
              <span className="font-farsi">{copied ? 'کپی شد' : 'کپی'}</span>
            </button>
          </div>
          <p
            dir="ltr"
            className="text-left font-mono text-[14px] text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2.5 break-words select-all"
          >
            {englishAnswer}
          </p>
        </div>
      )}
    </div>
  );
};
