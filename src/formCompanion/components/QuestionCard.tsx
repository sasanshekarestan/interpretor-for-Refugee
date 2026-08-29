import React, { useState } from 'react';
import { Volume2, HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { FormQuestion } from '../../types';
import { getSuperSimpleQuestionGuidance } from '../../utils/simpleQuestionHelper';
import { t } from '../tokens';

interface QuestionCardProps {
  question: FormQuestion;
  index: number;
  total: number;
  isDari: boolean;
  isAnswered: boolean;
  checkedValues: string[];
  onToggleOption: (fieldKey: string, value: string) => void;
  onPlayAudio?: (text: string, lang: string) => void;
}

/**
 * One question. Persian first, the exact English underneath it, and the plain
 * explanation folded away until it is asked for — so a question fits on a
 * phone screen without scrolling.
 */
export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  isDari,
  isAnswered,
  checkedValues,
  onToggleOption,
  onPlayAudio,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const guidance = getSuperSimpleQuestionGuidance(question, isDari);
  const questionFa = isDari ? question.dariTranslation || question.farsiTranslation : question.farsiTranslation;

  return (
    <section className={`${t.surface} border rounded-2xl p-4 space-y-3.5`} dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0 tabular-nums">
            {index + 1}/{total}
          </span>
          <span className="font-farsi text-[11px] text-slate-500 truncate">{question.section}</span>
          {isAnswered && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${t.doneText} shrink-0`}>
              <Check className="w-3.5 h-3.5" />
              پاسخ داده شد
            </span>
          )}
        </div>

        {onPlayAudio && (
          <button
            type="button"
            onClick={() => onPlayAudio(guidance.audioText, isDari ? 'fa' : 'fa')}
            className={`shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition ${t.focus}`}
            aria-label="شنیدن توضیح این سوال"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <h2 className="font-farsi font-bold text-slate-900 text-[19px] leading-relaxed text-balance">
          {questionFa}
        </h2>
        <p className="text-[13px] text-slate-500 leading-snug text-left" dir="ltr">
          {question.questionEn}
        </p>
      </div>

      {question.isLegallySensitive && question.legalAidNotice && (
        <div className={`${t.attention} border rounded-xl p-3 flex gap-2.5 text-[12.5px] font-farsi leading-relaxed`}>
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{question.legalAidNotice}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowHelp((s) => !s)}
        aria-expanded={showHelp}
        className={`w-full flex items-center gap-2 text-right px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200
          text-[13px] font-farsi font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition ${t.focus}`}
      >
        <HelpCircle className={`w-4 h-4 ${t.faint}`} />
        <span className="flex-1">{showHelp ? 'بستن توضیح' : 'نمی‌فهمم — ساده توضیح بده'}</span>
      </button>

      {showHelp && (
        <div className="space-y-2.5 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 font-farsi text-[13.5px] leading-relaxed text-slate-700">
          <p>{guidance.meaningSimple}</p>
          {guidance.whyTheyAsk && <p className="text-slate-500 text-[12.5px]">{guidance.whyTheyAsk}</p>}
          {guidance.concreteExample && (
            <p className="text-slate-600">
              <span className="font-bold">مثال: </span>
              <span dir="auto">{guidance.concreteExample}</span>
            </p>
          )}
        </div>
      )}

      {question.isCheckbox && question.options && question.options.length > 0 && (
        <div className="space-y-2">
          <p className="font-farsi text-[12.5px] text-slate-500">
            هر کدام که درست است را انتخاب کنید:
          </p>
          {question.options.map((option) => {
            const checked = checkedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onToggleOption(question.fieldKey, option.value)}
                aria-pressed={checked}
                className={`w-full text-right px-3 py-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${t.focus}
                  ${checked ? t.doneSoft : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-md border-2 inline-flex items-center justify-center
                    ${checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'}`}
                >
                  {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-farsi text-[13.5px] font-bold leading-snug">{option.labelFa}</span>
                  <span className="block text-[12px] text-slate-500 text-left" dir="ltr">{option.labelEn}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
