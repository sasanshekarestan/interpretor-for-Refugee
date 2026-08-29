import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserLanguage } from '../types';
import { useFormSession } from './useFormSession';
import { CustomFormObject } from './types';
import { AppBar } from './components/AppBar';
import { BottomBar } from './components/BottomBar';
import { DocumentSurface } from './components/DocumentSurface';
import { QuestionCard } from './components/QuestionCard';
import { AnswerField } from './components/AnswerField';
import { AssistantSheet } from './components/AssistantSheet';
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
    />
  );

  const hasUnsavedAnswer =
    !!question &&
    !!s.inputText.trim() &&
    s.inputText.trim() !== (answer?.userRawInput || '').trim();

  const questionPane = question ? (
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

        <button
          type="button"
          onClick={() => s.setIsAssistantOpen(true)}
          className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border border-slate-200 bg-white
            text-right cursor-pointer hover:bg-slate-50 transition ${t.focus}`}
          dir="rtl"
        >
          <Sparkles className={`w-4 h-4 ${t.primaryText} shrink-0`} />
          <span className="font-farsi text-[13px] font-bold text-slate-700 flex-1">
            سوالی دارید؟ از دستیار بپرسید
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

      <AssistantSheet
        open={s.isAssistantOpen}
        onClose={() => s.setIsAssistantOpen(false)}
        messages={s.chatMessages}
        input={s.chatInput}
        onInputChange={s.setChatInput}
        onSend={() => s.sendChatMessage()}
        isProcessing={s.isChatProcessing}
        onUseSuggestion={s.useSuggestion}
        questionFa={question?.farsiTranslation}
      />

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
