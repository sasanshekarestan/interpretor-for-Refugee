import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, ListChecks, Hand, FileQuestion } from 'lucide-react';
import { UserLanguage } from '../types';
import { RenderedField } from '../components/OfficialPdfViewer';
import { useFormSession } from './useFormSession';
import { useFieldExplanation } from './fieldGuide';
import { CustomFormObject } from './types';
import { AppBar } from './components/AppBar';
import { BottomBar } from './components/BottomBar';
import { DocumentSurface } from './components/DocumentSurface';
import { QuestionCard } from './components/QuestionCard';
import { AnswerField } from './components/AnswerField';
import { AssistantPanel } from './components/AssistantPanel';
import { FieldGuide } from './components/FieldGuide';
import { FormLibrary } from './components/FormLibrary';
import { AnswerSheet } from './components/AnswerSheet';
import { Button, Notice } from './components/Primitives';
import { t } from './tokens';

export interface FormCompanionProps {
  userLanguage: UserLanguage;
  onGoBackToHome?: () => void;
  onPlayAudio?: (text: string, lang: string) => void;
  onOpenUploadModal?: () => void;
  onClearCustomForm?: () => void;
  initialFormId?: string | null;
  customUploadedForm?: CustomFormObject | null;
  /** Told when a form is open, so the shell can drop its header and tab strip. */
  onImmersiveChange?: (immersive: boolean) => void;
}

/**
 * Form Companion.
 *
 * One component tree at every width. On a phone the document fills the screen
 * under a single 56px bar; from `md:` up the same pieces sit side by side. The
 * two parallel layouts this replaced are why fixes used to land on one of them
 * and not the other.
 */
export const FormCompanion: React.FC<FormCompanionProps> = ({
  userLanguage,
  onPlayAudio,
  onOpenUploadModal,
  onClearCustomForm,
  initialFormId,
  customUploadedForm,
  onImmersiveChange,
}) => {
  const s = useFormSession({ userLanguage, initialFormId, customUploadedForm, onClearCustomForm });
  const [confirmReset, setConfirmReset] = useState(false);

  // The boxes on the page in front of the person, and the one they touched.
  const [pageFields, setPageFields] = useState<RenderedField[]>([]);
  const [pageText, setPageText] = useState('');
  const [activeField, setActiveField] = useState<RenderedField | null>(null);
  /**
   * Following the paper form is the way in. The step-by-step list is still
   * there for anyone who wants to be led through it, but it is opt-in - it
   * was a second journey running alongside the document, and it only ever
   * covered 9 of the form's boxes.
   */
  const [guideMode, setGuideMode] = useState(true);

  const handleFieldsRendered = useCallback(
    (info: { pageIndex: number; fields: RenderedField[]; pageText: string }) => {
      setPageFields(info.fields);
      setPageText(info.pageText);
    },
    []
  );

  const { explanation, status: explanationStatus } = useFieldExplanation({
    formId: s.selectedFormId || '',
    formTitle: s.selectedForm?.titleEn || '',
    field: activeField,
    pageText,
    questions: s.questions,
    userLanguage,
  });

  const { setChatFieldContext } = s;

  const handleSelectField = useCallback(
    (field: RenderedField) => {
      setActiveField(field);
      setGuideMode(true);
      setChatFieldContext(field.name);
      s.setPhoneView('questions');
    },
    [setChatFieldContext, s.setPhoneView]
  );

  const clearActiveField = useCallback(() => {
    setActiveField(null);
    setChatFieldContext(null);
  }, [setChatFieldContext]);

  /**
   * Put a piece of the form into the question box.
   *
   * The document is drawn to a canvas, so its words cannot be selected the
   * way text on a page can. Rather than leave people trying, the text they
   * touched is carried into the assistant for them, ready to ask about.
   */
  /** Ask about the page as a whole, with every word printed on it. */
  const askAboutPage = useCallback(() => {
    clearActiveField();
    setGuideMode(true);
    s.setPhoneView('questions');
    s.sendChatMessage('این صفحه چه می‌گوید و باید چکار کنم؟', { pageText });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearActiveField, pageText, s.sendChatMessage, s.setPhoneView]);

  const askAboutFormText = useCallback(
    (formText: string) => {
      s.setChatInput(`«${formText}»\n`);
      window.setTimeout(() => {
        const box = document.getElementById('assistant-input') as HTMLTextAreaElement | null;
        box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        box?.focus();
        const end = box?.value.length ?? 0;
        box?.setSelectionRange(end, end);
      }, 60);
    },
    [s.setChatInput]
  );

  // A different page, or a different form, means a different set of boxes.
  useEffect(() => {
    setActiveField(null);
    setChatFieldContext(null);
  }, [s.documentPageIndex, s.selectedFormId, setChatFieldContext]);

  const hasForm = !!s.selectedFormId && !!s.selectedForm;

  useEffect(() => {
    onImmersiveChange?.(hasForm);
    return () => onImmersiveChange?.(false);
  }, [hasForm, onImmersiveChange]);

  if (!hasForm || !s.selectedForm) {
    return <FormLibrary isDari={s.isDari} onSelect={s.selectForm} onUpload={onOpenUploadModal} />;
  }

  const form = s.selectedForm;
  const question = s.currentQuestion;
  const answer = question ? s.answers[question.fieldKey] : undefined;
  const pdfUrl = form.pdfPath
    ? form.pdfPath.startsWith('public/')
      ? form.pdfPath.replace(/^public/, '')
      : form.pdfPath
    : undefined;

  const documentPane = (
    <DocumentSurface
      form={form}
      customPages={s.customPages}
      pageIndex={s.documentPageIndex}
      onSelectPage={s.setDocumentPageIndex}
      fields={pageFields}
      activeFieldId={activeField?.id ?? null}
      onSelectField={handleSelectField}
      onFieldsRendered={handleFieldsRendered}
    />
  );

  const assistant = (
    <AssistantPanel
      messages={s.chatMessages}
      input={s.chatInput}
      onInputChange={s.setChatInput}
      onSend={(m) => s.sendChatMessage(m)}
      isProcessing={s.isChatProcessing}
      onUseSuggestion={guideMode ? undefined : s.useSuggestion}
      contextFa={
        guideMode
          ? explanation?.labelFa || (activeField ? 'قسمت انتخاب‌شده فرم' : undefined)
          : question?.farsiTranslation
      }
    />
  );

  const hasUnsavedAnswer =
    !!question &&
    !!s.inputText.trim() &&
    s.inputText.trim() !== (answer?.userRawInput || '').trim();

  /**
   * Following the paper: what the touched box means, then the assistant.
   * No second list of questions to keep in step with the document.
   */
  const guidePane = (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
      <div className="max-w-xl mx-auto px-3.5 py-4 space-y-3.5">
        {/* The whole page, not one box. Tapping a line answers about that
            line, which is the wrong answer to "what is this page and what
            do I have to do" - the commonest question of all. */}
        <button
          type="button"
          onClick={askAboutPage}
          disabled={s.isChatProcessing || !pageText}
          className={`w-full flex items-center gap-2.5 px-4 py-3.5 rounded-2xl text-right transition
            disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${t.focus}
            ${activeField ? 'bg-white border border-slate-200 hover:bg-slate-50' : `${t.primary} shadow-sm`}`}
          dir="rtl"
        >
          <FileQuestion className={`w-5 h-5 shrink-0 ${activeField ? t.faint : 'text-white/90'}`} />
          <span className="flex-1 min-w-0">
            <span className={`block font-farsi font-bold text-[14px] ${activeField ? 'text-slate-800' : 'text-white'}`}>
              این صفحه چه می‌گوید و باید چکار کنم؟
            </span>
            <span className={`block text-[11px] ${activeField ? 'text-slate-500' : 'text-white/80'}`}>
              Explain this whole page · صفحه {s.documentPageIndex + 1}
            </span>
          </span>
        </button>

        <FieldGuide
          field={activeField}
          explanation={explanation}
          status={explanationStatus}
          onClear={clearActiveField}
          onPlayAudio={onPlayAudio}
          onAsk={askAboutFormText}
        />

        {assistant}

        {s.totalQuestions > 0 && (
          <button
            type="button"
            onClick={() => {
              setGuideMode(false);
              clearActiveField();
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white
              text-right cursor-pointer hover:bg-slate-50 transition ${t.focus}`}
            dir="rtl"
          >
            <ListChecks className={`w-4 h-4 ${t.faint} shrink-0`} />
            <span className="font-farsi text-[13px] font-bold text-slate-700 flex-1">
              ترجیح می‌دهید قدم‌به‌قدم راهنمایی شوید؟
            </span>
          </button>
        )}
      </div>
    </div>
  );

  const wizardPane = question ? (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
      <div className="max-w-xl mx-auto px-3.5 py-4 space-y-3.5">
        {/* At most one banner, and it can always be dismissed. */}
        {s.showRestoredBanner && (
          <Notice tone="done" onDismiss={s.dismissRestoredBanner}>
            پاسخ‌های قبلی شما بازیابی شد. از همان‌جا که مانده بودید ادامه دهید.
          </Notice>
        )}

        <QuestionCard
          question={question}
          index={s.currentQuestionIndex}
          total={s.totalQuestions}
          isDari={s.isDari}
          isAnswered={!!answer?.extractedAnswer?.trim()}
          checkedValues={s.selectedCheckboxValues[question.fieldKey] || []}
          onToggleOption={s.toggleCheckboxOption}
          onPlayAudio={onPlayAudio}
        />

        {/* Several questions are flagged as tick-boxes but carry no options yet.
            Those still need a way to answer, so the field stands in. */}
        {!(question.isCheckbox && (question.options?.length ?? 0) > 0) && (
          <AnswerField
            value={s.inputText}
            onChange={s.setInputText}
            onSubmit={() => s.submitAnswer(s.inputText)}
            onRetry={() => s.submitAnswer(s.aiCallError?.failedText || s.inputText)}
            isProcessing={s.isProcessing}
            isRecording={s.isRecording}
            onToggleRecording={s.toggleRecording}
            pending={s.pendingExtraction}
            error={s.aiCallError}
            englishAnswer={answer?.extractedAnswer}
            placeholderFa={question.exampleFormat ? `مثال: ${question.exampleFormat}` : 'پاسخ شما…'}
          />
        )}

        {assistant}

        <button
          type="button"
          onClick={() => setGuideMode(true)}
          className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white
            text-right cursor-pointer hover:bg-slate-50 transition ${t.focus}`}
          dir="rtl"
        >
          <Hand className={`w-4 h-4 ${t.faint} shrink-0`} />
          <span className="font-farsi text-[13px] font-bold text-slate-700 flex-1">
            به جای این، روی خود فرم بزنید و توضیح بگیرید
          </span>
        </button>

        {/* One primary action, and it says what happens: record the answer
            first if there is one waiting, otherwise move on. */}
        <div className="flex items-center gap-2.5 pt-1" dir="rtl">
          <Button
            variant="secondary"
            onClick={s.prevQuestion}
            disabled={s.currentQuestionIndex === 0}
            className="flex-1"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="font-farsi">قبلی</span>
          </Button>

          {hasUnsavedAnswer ? (
            <Button
              variant="primary"
              onClick={() => s.submitAnswer(s.inputText)}
              disabled={s.isProcessing}
              className="flex-[1.6]"
            >
              <span className="font-farsi">ثبت پاسخ</span>
            </Button>
          ) : (
            <Button variant="primary" onClick={s.nextQuestion} className="flex-[1.6]">
              <span className="font-farsi">
                {s.currentQuestionIndex === s.totalQuestions - 1 ? 'دیدن برگه پاسخ‌ها' : 'سوال بعدی'}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  ) : null;

  // Following the form is the default. The step-by-step list is still there
  // for anyone who wants to be led, but it is no longer the only way in.
  const questionPane = guideMode || !wizardPane ? guidePane : wizardPane;

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-50 print:static print:h-auto">
      <AppBar
        code={form.code}
        titleFa={s.displayTitle || form.titleEn}
        onBack={s.closeForm}
        onOpenAnswerSheet={() => {
          s.saveCurrentInput();
          s.runConsistencyCheck();
          s.setShowReviewMode(true);
        }}
        onStartAgain={() => setConfirmReset(true)}
        onUploadOwnForm={onOpenUploadModal}
        pdfUrl={pdfUrl}
        officialSourceUrl={form.officialSourceUrl}
      />

      {s.showReviewMode ? (
        <AnswerSheet
          titleFa={s.displayTitle || form.titleFa}
          titleEn={form.titleEn}
          code={form.code}
          questions={s.questions}
          answers={s.answers}
          warnings={s.consistencyWarnings}
          onBack={() => s.setShowReviewMode(false)}
          onJumpToQuestion={(i) => {
            s.goToQuestion(i);
            s.setShowReviewMode(false);
            s.setPhoneView('questions');
          }}
        />
      ) : (
        <>
          {/* One instance of each pane. On a phone CSS shows whichever the
              bottom bar selected; from md: up it shows both, side by side.
              Nothing is rendered twice — that duplication is what made fixes
              land on one layout and not the other. */}
          <div className="flex-1 min-h-0 flex">
            <div
              className={`${s.phoneView === 'document' ? 'flex' : 'hidden'} md:flex
                flex-1 min-w-0 flex-col md:border-l md:border-slate-200`}
            >
              {documentPane}
            </div>
            <div
              className={`${s.phoneView === 'questions' ? 'flex' : 'hidden'} md:flex
                flex-1 min-w-0 flex-col md:flex-none md:w-[420px] lg:w-[460px] md:shrink-0`}
            >
              {questionPane}
            </div>
          </div>

          <div className="md:hidden">
            <BottomBar
              view={s.phoneView}
              onChange={s.setPhoneView}
              answered={s.answeredCount}
              total={s.totalQuestions}
            />
          </div>
        </>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="لغو"
            onClick={() => setConfirmReset(false)}
            className="absolute inset-0 bg-slate-900/40 cursor-pointer"
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-5 max-w-sm w-full space-y-4 font-farsi" dir="rtl">
            <div className="space-y-1.5">
              <h2 className="font-bold text-[16px] text-slate-900">همه پاسخ‌ها پاک شود؟</h2>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                پاسخ‌هایی که تا الان داده‌اید حذف می‌شود و از سوال اول شروع می‌کنید. این کار برگشت‌پذیر نیست.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmReset(false)}>
                <span>انصراف</span>
              </Button>
              <button
                type="button"
                onClick={() => {
                  s.clearAnswers();
                  setConfirmReset(false);
                }}
                className={`${t.fault} ${t.tapTarget} ${t.focus} flex-1 inline-flex items-center justify-center
                  rounded-xl px-4 text-sm font-bold cursor-pointer transition`}
              >
                شروع دوباره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
