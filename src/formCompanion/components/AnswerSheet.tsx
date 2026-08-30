import React from 'react';
import { Printer, ArrowRight, AlertTriangle } from 'lucide-react';
import { FormQuestion, FormAnswer, FormConsistencyWarning } from '../../types';
import { Button, Notice } from './Primitives';
import { t } from '../tokens';

interface AnswerSheetProps {
  titleFa: string;
  titleEn: string;
  code: string;
  questions: FormQuestion[];
  answers: Record<string, FormAnswer>;
  warnings: FormConsistencyWarning[];
  onBack: () => void;
  onJumpToQuestion: (index: number) => void;
}

/**
 * What to copy onto the paper form, in order.
 *
 * This sheet is a reading aid for a person sitting at a desk with the real
 * document in front of them — it is never a substitute for the form itself.
 */
export const AnswerSheet: React.FC<AnswerSheetProps> = ({
  titleFa,
  titleEn,
  code,
  questions,
  answers,
  warnings,
  onBack,
  onJumpToQuestion,
}) => (
  <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
    <div className="max-w-2xl mx-auto px-3.5 py-5 space-y-4 font-farsi" dir="rtl">
      <div className="flex items-center gap-2 print:hidden">
        <Button variant="quiet" onClick={onBack}>
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فرم</span>
        </Button>
        <Button variant="primary" onClick={() => window.print()} className="mr-auto">
          <Printer className="w-4 h-4" />
          <span>چاپ این برگه</span>
        </Button>
      </div>

      <header className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            {code}
          </span>
          <h1 className="font-bold text-slate-900 text-[16px] leading-snug">{titleFa}</h1>
        </div>
        <p className="text-[12px] text-slate-500 text-left" dir="ltr">{titleEn}</p>
        <p className="text-[12.5px] text-slate-600 pt-1.5 leading-relaxed">
          پاسخ‌های زیر را با همین ترتیب روی فرم کاغذی خود بنویسید. این برگه فرم رسمی نیست.
        </p>
      </header>

      {warnings.length > 0 && (
        <Notice tone="attention">
          <div className="space-y-2">
            <p className="font-bold inline-flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              پیش از نوشتن، این موارد را بررسی کنید
            </p>
            <ul className="space-y-1.5 list-disc pr-4">
              {warnings.map((w, i) => (
                <li key={i}>
                  {w.issueFa}
                  {w.suggestionFa && <span className="text-amber-800/80"> — {w.suggestionFa}</span>}
                </li>
              ))}
            </ul>
          </div>
        </Notice>
      )}

      <ol className="space-y-2.5">
        {questions.map((q, index) => {
          const answer = answers[q.fieldKey];
          const answered = !!answer?.extractedAnswer?.trim();
          return (
            <li key={q.fieldKey} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shrink-0 tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-[13.5px] font-bold text-slate-800 leading-snug">{q.farsiTranslation}</p>
                  <p className="text-[11.5px] text-slate-500 text-left leading-snug" dir="ltr">{q.questionEn}</p>
                </div>
              </div>

              {answered ? (
                <p
                  dir="ltr"
                  className="text-left font-mono text-[13.5px] text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 break-words select-all print:border-slate-400"
                >
                  {answer.extractedAnswer}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => onJumpToQuestion(index)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50
                    text-[12.5px] text-slate-500 hover:bg-slate-100 cursor-pointer transition print:hidden ${t.focus}`}
                >
                  هنوز پاسخ داده نشده — برای پاسخ دادن بزنید
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  </div>
);
