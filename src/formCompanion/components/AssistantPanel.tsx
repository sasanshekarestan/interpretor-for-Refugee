import React, { useEffect, useRef } from 'react';
import { Send, Loader2, Sparkles, CornerDownLeft } from 'lucide-react';
import { ChatMessage } from '../types';
import { t } from '../tokens';

interface AssistantPanelProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: (message?: string) => void;
  isProcessing: boolean;
  onUseSuggestion?: (text: string) => void;
  /** What the person is looking at, so the starters are about that. */
  contextFa?: string;
  starters?: string[];
}

const DEFAULT_STARTERS = [
  'معنی این قسمت چیست؟',
  'چه مدرکی لازم دارم؟',
  'اگر جواب را نمی‌دانم چه کنم؟',
];

/**
 * The assistant, visible on the page rather than hidden behind a button.
 * It sits under whatever guidance is on screen and stays open, so asking a
 * question is one tap and the answer arrives beside the form.
 */
export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  messages,
  input,
  onInputChange,
  onSend,
  isProcessing,
  onUseSuggestion,
  contextFa,
  starters = DEFAULT_STARTERS,
}) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isProcessing]);

  return (
    <section className={`${t.surface} border rounded-2xl overflow-hidden`} dir="rtl">
      <header className="flex items-center gap-2.5 px-3.5 py-3 border-b border-slate-200">
        <Sparkles className={`w-4 h-4 ${t.primaryText} shrink-0`} />
        <div className="min-w-0 flex-1">
          <h2 className="font-farsi font-bold text-[13.5px] text-slate-900">دستیار فرم</h2>
          {contextFa && (
            <p className="font-farsi text-[11.5px] text-slate-500 truncate">درباره: {contextFa}</p>
          )}
        </div>
      </header>

      <div className="px-3.5 py-3 space-y-3 max-h-[46vh] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="font-farsi text-[12.5px] text-slate-500">
              هر چیزی درباره این قسمت از فرم بپرسید:
            </p>
            <div className="flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className={`px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-farsi text-[12.5px]
                    text-slate-700 hover:bg-slate-100 cursor-pointer transition ${t.focus}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 font-farsi text-[13.5px] leading-relaxed whitespace-pre-wrap
                  ${m.sender === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 border border-slate-200 text-slate-800'}`}
              >
                <span>{m.textFa}</span>
                {m.suggestedAnswer && onUseSuggestion && (
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
          ))
        )}

        {isProcessing && (
          <div className="flex justify-end">
            <div className="rounded-2xl px-3.5 py-2.5 bg-slate-50 border border-slate-200">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200 p-2.5 flex items-end gap-2">
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
          aria-label="سوال خود را از دستیار بپرسید"
          placeholder="سوال خود را بنویسید…"
          className="flex-1 min-h-[44px] max-h-28 resize-none rounded-xl border border-slate-300 px-3.5 py-3
            font-farsi text-[13.5px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005EB8]/30"
        />
        <button
          type="button"
          onClick={() => onSend()}
          disabled={!input.trim() || isProcessing}
          aria-label="ارسال"
          className={`w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl ${t.primary}
            disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition ${t.focus}`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
