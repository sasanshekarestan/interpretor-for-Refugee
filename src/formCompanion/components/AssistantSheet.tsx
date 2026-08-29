import React, { useEffect, useRef } from 'react';
import { X, Send, Loader2, Sparkles, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '../types';
import { t } from '../tokens';

interface AssistantSheetProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isProcessing: boolean;
  onUseSuggestion: (text: string) => void;
  questionFa?: string;
}

const STARTERS = [
  'معنی این سوال چیست؟',
  'چه مدرکی لازم دارم؟',
  'اگر جواب را نمی‌دانم چه کنم؟',
];

/**
 * The assistant, as a sheet you open on purpose.
 *
 * It covers the answer field while it is up, which is what keeps the promise
 * that only one input is ever on screen. Closing it returns you to the form.
 */
export const AssistantSheet: React.FC<AssistantSheetProps> = ({
  open,
  onClose,
  messages,
  input,
  onInputChange,
  onSend,
  isProcessing,
  onUseSuggestion,
  questionFa,
}) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="بستن دستیار"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 cursor-pointer"
      />

      <div
        className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[82vh] md:max-h-[70vh] md:max-w-lg md:mx-auto md:mb-6 md:rounded-3xl"
        dir="rtl"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 shrink-0">
          <Sparkles className={`w-5 h-5 ${t.primaryText}`} />
          <div className="flex-1 min-w-0">
            <p className="font-farsi font-bold text-[14px] text-slate-900">دستیار فرم</p>
            {questionFa && (
              <p className="font-farsi text-[11.5px] text-slate-500 truncate">درباره: {questionFa}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className={`w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer ${t.focus}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="font-farsi text-[13px] text-slate-500">
                هر چیزی درباره این بخش از فرم بپرسید:
              </p>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend()}
                  onMouseDown={() => onInputChange(s)}
                  className={`w-full text-right px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50
                    font-farsi text-[13px] text-slate-700 hover:bg-slate-100 cursor-pointer transition ${t.focus}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 font-farsi text-[13.5px] leading-relaxed whitespace-pre-wrap
                  ${m.sender === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
              >
                <span>{m.textFa}</span>
                {m.suggestedAnswer && (
                  <button
                    type="button"
                    onClick={() => onUseSuggestion(m.suggestedAnswer!)}
                    className={`mt-2.5 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                      ${t.primary} text-[12.5px] font-bold cursor-pointer transition ${t.focus}`}
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>این را در پاسخ من بگذار</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-end">
              <div className="rounded-2xl px-3.5 py-2.5 bg-slate-50 border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="shrink-0 border-t border-slate-200 p-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="سوال خود را بنویسید…"
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border border-slate-300 px-3.5 py-3
              font-farsi text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005EB8]/30"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!input.trim() || isProcessing}
            aria-label="ارسال"
            className={`w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl ${t.primary}
              disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition ${t.focus}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
