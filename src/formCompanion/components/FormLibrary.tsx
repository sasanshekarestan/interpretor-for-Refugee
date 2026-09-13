import React from 'react';
import { ArrowLeft, Camera, Check, ExternalLink, Info } from 'lucide-react';
import { OFFICIAL_FORMS, OfficialForm, libraryForms } from '../../data/officialForms';
import { savedAnswerCount } from '../useFormSession';
import { Button, Pill } from './Primitives';

/**
 * A form we cannot show, and will not pretend to.
 *
 * In-year school admission is run council by council. There is no national
 * document, so there is nothing we could put on the screen that would not be
 * the wrong form for almost everyone reading it. Until this card existed the
 * entry claimed a PDF that was not in the repository, which meant a parent
 * looking for a school place tapped it and was shown, in English, the words
 * "Invalid PDF structure".
 *
 * What is still ours to give is the part a council form never explains: what
 * they are going to ask, what to have ready, and what an answer looks like.
 * That is the card. It does not open the document surface, because there is no
 * document.
 */
const CouncilFormCard: React.FC<{ form: OfficialForm; isDari: boolean }> = ({ form, isDari }) => (
  <li className="bg-surface border border-edge rounded-2xl p-4 sm:p-5 space-y-3.5">
    <span
      dir="ltr"
      className="font-mono text-sm font-bold bg-primary text-on-primary px-2.5 py-1 rounded-lg inline-block"
    >
      {form.code}
    </span>

    <h2 className="font-farsi font-bold text-ink text-lg sm:text-xl leading-snug">
      {isDari ? form.titleDari || form.titleFa : form.titleFa}
    </h2>
    <p className="font-farsi text-base text-ink-muted leading-relaxed">{form.purposeFa}</p>

    {/* Quiet information, not a fault. Nothing has gone wrong: this is simply
        how school admission works in England, and saying so plainly is more
        use than an apology. */}
    <div className="bg-attention-bg border-s-4 border-attention rounded-xl p-3.5 space-y-2">
      <div className="flex items-center gap-2">
        <Info className="w-5 h-5 text-attention shrink-0" aria-hidden="true" />
        <h3 className="font-farsi font-bold text-attention text-base">
          این فرم را باید از شورای محلی خودتان بگیرید
        </h3>
      </div>
      <p className="font-farsi text-base text-ink leading-relaxed">
        ثبت‌نام مدرسه در انگلستان از طریق شورای محل سکونت شما انجام می‌شود و فرم هر شورا فرق
        می‌کند. برای همین ما نمی‌توانیم یک فرم واحد به شما نشان بدهیم. اما آنچه از شما می‌پرسند
        تقریباً همه‌جا یکی است، و در پایین آمده است.
      </p>
    </div>

    {/* What they will ask. The value this card actually carries. */}
    <ol className="space-y-3">
      {form.questions.map((q, i) => (
        <li key={q.id} className="border border-edge rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-farsi font-bold text-primary text-base tabular-nums shrink-0">
              {i + 1}.
            </span>
            <h4 className="font-farsi font-bold text-ink text-base leading-snug">
              {isDari ? q.dariTranslation || q.farsiTranslation : q.farsiTranslation}
            </h4>
          </div>
          {q.explanationFa && (
            <p className="font-farsi text-base text-ink-muted leading-relaxed">{q.explanationFa}</p>
          )}
          {q.whatTypeInfoNeeded && (
            <p className="font-farsi text-sm text-ink-muted leading-relaxed">
              <span className="font-bold text-ink">چه چیزی لازم است: </span>
              {q.whatTypeInfoNeeded}
            </p>
          )}
          {q.exampleFormat && (
            <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">
              <bdi>{q.exampleFormat}</bdi>
            </p>
          )}
        </li>
      ))}
    </ol>

    {form.officialSourceUrl && (
      <a
        href={form.officialSourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="min-h-[44px] w-full px-4 rounded-xl bg-primary text-on-primary font-bold
                   inline-flex items-center justify-center gap-2 text-sm transition
                   hover:bg-primary-press"
      >
        <span className="font-farsi">پیدا کردن شورای محلی خودتان</span>
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </a>
    )}

    <div dir="ltr" className="font-latin border-t border-edge pt-3 space-y-0.5">
      <p className="text-sm text-ink-muted leading-snug">{form.titleEn}</p>
      <p className="text-xs text-ink-muted">{form.issuer}</p>
      <p className="text-xs text-ink-muted">
        Each council issues its own form. This card lists what they will ask.
      </p>
    </div>
  </li>
);

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

    {/* An online-only application has nothing to show beside a guide, so it is
        not offered here. A council form has no single document, so it is
        offered as guidance instead of as a form to open. */}
    <ul className="space-y-4">
      {libraryForms(OFFICIAL_FORMS).map((form) => {
        if (form.delivery === 'council') {
          return <CouncilFormCard key={form.id} form={form} isDari={isDari} />;
        }
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
