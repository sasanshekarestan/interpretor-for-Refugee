import React, { useState } from 'react';
import { Loader2, Hand, PenLine, AlertTriangle, Volume2, X, Copy, Check, MessageSquarePlus } from 'lucide-react';
import { RenderedField } from '../../components/OfficialPdfViewer';
import { FieldExplanation, parseFieldName } from '../fieldGuide';
import { Notice } from './Primitives';
import { t } from '../tokens';

interface FieldGuideProps {
  field: RenderedField | null;
  explanation: FieldExplanation | null;
  status: 'idle' | 'loading' | 'error';
  onClear: () => void;
  onPlayAudio?: (text: string, lang: string) => void;
  /** Send this part of the form to the assistant as a question. */
  onAsk?: (formText: string) => void;
}

/**
 * What the box you just touched is asking for.
 *
 * The person's journey is the paper form itself: they put a finger on a box,
 * and this says what that box means. There is no separate list of questions
 * to keep in step with the document.
 */
export const FieldGuide: React.FC<FieldGuideProps> = ({
  field,
  explanation,
  status,
  onClear,
  onPlayAudio,
  onAsk,
}) => {
  const [copied, setCopied] = useState(false);

  if (!field) {
    return (
      <div
        className={`${t.surface} border border-dashed rounded-2xl px-4 py-6 text-center space-y-2 font-farsi`}
        dir="rtl"
      >
        <Hand className={`w-6 h-6 mx-auto ${t.faint}`} />
        <p className="font-bold text-[14px] text-slate-800">روی هر قسمت از فرم بزنید</p>
        <p className="text-[13px] text-slate-600 leading-relaxed">
          هر جای فرم را که لمس کنید، توضیح همان قسمت به زبان ساده اینجا نشان داده می‌شود.
        </p>
      </div>
    );
  }

  const parsed = parseFieldName(field.name);

  /** What the form prints here: a whole line, or a box's own label. */
  const formText = field.source === 'line' ? field.name : parsed.label || field.name;

  const copyFormText = () => {
    navigator.clipboard?.writeText(formText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spoken = explanation
    ? `${explanation.labelFa}. ${explanation.meaningFa}. ${explanation.whatToWriteFa}`
    : '';

  return (
    <section className={`${t.surface} border rounded-2xl p-4 space-y-3.5`} dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {parsed.reference && (
            <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              {parsed.reference}
            </span>
          )}
          <span className="font-farsi text-[11.5px] text-slate-500">
            {field.type === 'choice' ? 'خانه تیک زدن' : 'خانه نوشتن'}
            {parsed.choice ? ` · ${parsed.choice}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onPlayAudio && spoken && (
            <button
              type="button"
              onClick={() => onPlayAudio(spoken, 'fa')}
              aria-label="شنیدن توضیح"
              className={`w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer ${t.focus}`}
            >
              <Volume2 className="w-4.5 h-4.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            aria-label="بستن توضیح این قسمت"
            className={`w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer ${t.focus}`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* The form's own words for this part. A canvas has no text to select,
          so the text is reproduced here as real selectable text - and can be
          copied, or sent straight to the assistant, without selecting it. */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
        <p className="font-farsi text-[11.5px] font-bold text-slate-500" dir="rtl">
          متن روی فرم
        </p>
        <p dir="ltr" className="text-left text-[13px] text-slate-800 leading-relaxed select-all break-words">
          {formText}
        </p>
        <div className="flex items-center gap-2">
          {onAsk && (
            <button
              type="button"
              onClick={() => onAsk(formText)}
              className={`flex-1 min-h-[40px] inline-flex items-center justify-center gap-2 px-3 rounded-xl
                ${t.primary} text-[12.5px] font-bold cursor-pointer transition ${t.focus}`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="font-farsi">درباره این بپرس</span>
            </button>
          )}
          <button
            type="button"
            onClick={copyFormText}
            aria-label="کپی متن"
            className={`min-h-[40px] px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300
              bg-white text-slate-700 text-[12px] font-bold cursor-pointer hover:bg-slate-50 transition ${t.focus}`}
          >
            {copied ? <Check className={`w-4 h-4 ${t.doneText}`} /> : <Copy className="w-4 h-4" />}
            <span className="font-farsi">{copied ? 'کپی شد' : 'کپی'}</span>
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <div className="flex items-center gap-2.5 py-2 font-farsi text-[13px] text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          در حال آماده کردن توضیح این قسمت…
        </div>
      )}

      {status === 'error' && (
        <Notice tone="fault">
          توضیح این قسمت آماده نشد. اتصال اینترنت را بررسی کنید و دوباره روی همان قسمت بزنید.
        </Notice>
      )}

      {explanation && (
        <div className="space-y-3">
          <h2 className="font-farsi font-bold text-slate-900 text-[18px] leading-relaxed text-balance">
            {explanation.labelFa}
          </h2>

          <p className="font-farsi text-[14px] text-slate-700 leading-relaxed">{explanation.meaningFa}</p>

          {explanation.whatToWriteFa && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
              <p className="font-farsi text-[12.5px] font-bold text-slate-600 flex items-center gap-1.5">
                <PenLine className={`w-3.5 h-3.5 ${t.faint}`} />
                چه چیزی در این خانه می‌نویسید
              </p>
              <p className="font-farsi text-[13.5px] text-slate-700 leading-relaxed">
                {explanation.whatToWriteFa}
              </p>
              {explanation.exampleAnswer && (
                <p
                  dir="ltr"
                  className="text-left font-mono text-[13px] text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 mt-1.5"
                >
                  {explanation.exampleAnswer}
                </p>
              )}
            </div>
          )}

          {explanation.cautionFa && (
            <Notice tone="attention">
              <span className="inline-flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{explanation.cautionFa}</span>
              </span>
            </Notice>
          )}

          {explanation.source === 'ai' && (
            <p className="font-farsi text-[11.5px] text-slate-400 leading-relaxed">
              این توضیح توسط دستیار هوشمند نوشته شده است. متن روی فرم کاغذی همیشه مرجع اصلی است.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
