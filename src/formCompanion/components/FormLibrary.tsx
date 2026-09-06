import React from 'react';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { OFFICIAL_FORMS, paperForms } from '../../data/officialForms';
import { savedAnswerCount } from '../useFormSession';
import { Button, Pill } from './Primitives';

interface FormLibraryProps {
  isDari: boolean;
  onSelect: (formId: string) => void;
  onUpload?: () => void;
}

/**
 * The forms someone can open, with any half-finished one marked.
 *
 * The cards had no hierarchy. Everything on them sat within three pixels of
 * everything else: the code chip, the Persian title at 15.5px, the English
 * title at 12px and the explanation at 14px, all in slate, so the eye had
 * nowhere to land and every card looked like a paragraph. A person is usually
 * looking for one form they have been told the name of, and the name is what
 * they should find first.
 *
 * So the order is now what a person actually needs, in the order they need it:
 * the code, because a caseworker says "fill in an HC1" out loud; the title,
 * large enough to be the thing you see; then one line saying what the form is
 * for. The English title and the issuing body are true but rarely the reason
 * anyone is here, so they sit under a rule at the foot of the card.
 */
export const FormLibrary: React.FC<FormLibraryProps> = ({ isDari, onSelect, onUpload }) => (
  <div className="max-w-3xl mx-auto px-3.5 py-5 space-y-5" dir="rtl">
    {/* The same opening panel as the interpreter and the letter reader:
        Persian block, then English block, on the emphasis surface. */}
    <div className="bg-emphasis text-on-emphasis rounded-3xl p-5 sm:p-6 space-y-3">
      <div className="space-y-2">
        <h1 className="font-farsi text-xl sm:text-2xl font-bold leading-tight">
          تکمیل فرم‌های رسمی
        </h1>
        <p className="font-farsi text-base text-on-emphasis-muted leading-relaxed">
          فرم خود را انتخاب کنید. سند اصلی را می‌بینید و سوال‌ها را گام‌به‌گام به زبان ساده پاسخ
          می‌دهید.
        </p>
      </div>
      <div dir="ltr" className="font-latin space-y-0.5 border-t border-white/15 pt-3">
        <h2 className="font-bold text-base">Form companion</h2>
        <p className="text-sm text-on-emphasis-muted leading-relaxed">
          Choose your form. You see the real document, and answer its questions one at a time in
          plain language.
        </p>
      </div>
    </div>

    {/* Only forms that exist as a document. An online application has nothing
        to show beside a guide, so it is not offered here. */}
    <ul className="space-y-4">
      {paperForms(OFFICIAL_FORMS).map((form) => {
        const answered = savedAnswerCount(form.id);
        const total = form.questions.length;
        const complete = total > 0 && answered >= total;
        const title = isDari ? form.titleDari || form.titleFa : form.titleFa;

        return (
          <li
            key={form.id}
            className="bg-surface border border-edge rounded-2xl p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* The name people are given. Filled, so it reads as a label on
                  a document rather than another grey word in the paragraph. */}
              <span
                dir="ltr"
                className="font-mono text-sm font-bold bg-primary text-on-primary px-2.5 py-1 rounded-lg shrink-0"
              >
                {form.code}
              </span>
              {answered > 0 && (
                <Pill tone={complete ? 'done' : 'neutral'}>
                  {complete && <Check className="w-3 h-3" />}
                  <span className="font-farsi">
                    {complete
                      ? `تکمیل شده (${answered} از ${total})`
                      : `${answered} از ${total} پاسخ داده شده`}
                  </span>
                </Pill>
              )}
            </div>

            {/* The thing you are looking for, at the size of the thing you are
                looking for. */}
            <h2 className="font-farsi font-bold text-ink text-lg sm:text-xl leading-snug">
              {title}
            </h2>

            {/* And one line on what it is for. */}
            <p className="font-farsi text-base text-ink-muted leading-relaxed">{form.purposeFa}</p>

            <Button variant="primary" fullWidth onClick={() => onSelect(form.id)}>
              <span className="font-farsi">{answered > 0 ? 'ادامه دهید' : 'شروع فرم'}</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>

            {/* True, useful to a support worker, and not why anyone came. */}
            <div dir="ltr" className="font-latin border-t border-edge pt-3 space-y-0.5">
              <p className="text-sm text-ink-muted leading-snug">{form.titleEn}</p>
              <p className="text-xs text-ink-muted">{form.issuer}</p>
            </div>
          </li>
        );
      })}
    </ul>

    {onUpload && (
      <div className="bg-surface border border-edge rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-primary inline-flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="font-farsi font-bold text-ink text-lg leading-snug">
              فرم شما در این فهرست نیست؟
            </h2>
            <p className="font-farsi text-base text-ink-muted leading-relaxed">
              از فرم کاغذی خود عکس بگیرید تا راهنمای فارسی آن ساخته شود.
            </p>
          </div>
        </div>
        <Button variant="secondary" fullWidth onClick={onUpload}>
          <span className="font-farsi">بارگذاری فرم خودم</span>
        </Button>
      </div>
    )}
  </div>
);
