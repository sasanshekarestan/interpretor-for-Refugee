import React from 'react';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { OFFICIAL_FORMS, paperForms } from '../../data/officialForms';
import { savedAnswerCount } from '../useFormSession';
import { Button, Pill } from './Primitives';
import { t } from '../tokens';

interface FormLibraryProps {
  isDari: boolean;
  onSelect: (formId: string) => void;
  onUpload?: () => void;
}

/** The forms someone can open, with any half-finished one marked. */
export const FormLibrary: React.FC<FormLibraryProps> = ({ isDari, onSelect, onUpload }) => (
  <div className="max-w-3xl mx-auto px-3.5 py-5 space-y-5 font-farsi" dir="rtl">
    <div className="space-y-1">
      <h1 className="text-[22px] font-bold text-slate-900 leading-snug text-balance">
        فرم مورد نظر خود را انتخاب کنید
      </h1>
      <p className="text-[13.5px] text-slate-600 leading-relaxed">
        سند اصلی را می‌بینید و سوال‌ها را گام‌به‌گام به زبان ساده پاسخ می‌دهید.
      </p>
    </div>

    {/* Only forms that exist as a document. An online application has nothing
        to show beside a guide, so it is not offered here. */}
    <ul className="space-y-3">
      {paperForms(OFFICIAL_FORMS).map((form) => {
        const answered = savedAnswerCount(form.id);
        const total = form.questions.length;
        const complete = total > 0 && answered >= total;
        const title = isDari ? form.titleDari || form.titleFa : form.titleFa;

        return (
          <li key={form.id} className={`${t.surface} border rounded-2xl p-4 space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    {form.code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{form.issuer}</span>
                  {answered > 0 && (
                    <Pill tone={complete ? 'done' : 'neutral'}>
                      {complete && <Check className="w-3 h-3" />}
                      {complete ? `تکمیل شده (${answered} از ${total})` : `${answered} از ${total} پاسخ داده شده`}
                    </Pill>
                  )}
                </div>
                <h2 className="font-bold text-slate-900 text-[15.5px] leading-snug">{title}</h2>
                <p className="text-[12px] text-slate-500 text-left leading-snug" dir="ltr">
                  {form.titleEn}
                </p>
              </div>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed">{form.purposeFa}</p>

            <Button variant="primary" fullWidth onClick={() => onSelect(form.id)}>
              <span>{answered > 0 ? 'ادامه دهید' : 'شروع فرم'}</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </li>
        );
      })}
    </ul>

    {onUpload && (
      <div className={`${t.surface} border rounded-2xl p-4 space-y-3`}>
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 inline-flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 text-[14.5px]">فرم شما در این فهرست نیست؟</h2>
            <p className="text-[12.5px] text-slate-600 leading-snug">
              از فرم کاغذی خود عکس بگیرید تا راهنمای فارسی آن ساخته شود.
            </p>
          </div>
        </div>
        <Button variant="secondary" fullWidth onClick={onUpload}>
          <span>بارگذاری فرم خودم</span>
        </Button>
      </div>
    )}
  </div>
);
