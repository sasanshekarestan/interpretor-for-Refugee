import React from 'react';
import { FormQuestion, FormAnswer, UserLanguage } from '../types';
import { ShamsiDateConverterWidget } from './ShamsiDateConverterWidget';
import { FormAnswerBlock } from './FormAnswerBlock';
import { getSuperSimpleQuestionGuidance } from '../utils/simpleQuestionHelper';
import { Sparkles, Volume2, Check } from 'lucide-react';

export interface FormQuestionCardProps {
  currentQ: FormQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  userLanguage: UserLanguage;
  answers: Record<string, FormAnswer>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, FormAnswer>>>;
  inputText: string;
  setInputText: (text: string) => void;
  isProcessing: boolean;
  processingFieldKey: string | null;
  aiCallError: string | null;
  setAiCallError: (err: string | null) => void;
  processUserAnswer: (rawText: string) => Promise<void>;
  isRecording: boolean;
  toggleRecording: () => void;
  copiedKey: string | null;
  handleCopyText: (text: string, key: string) => void;
  handlePrevQuestion: () => void;
  handleNextQuestion: () => void;
  handleToggleCheckboxOption: (fieldKey: string, optValue: string, optLabelEn: string, optLabelFa: string) => void;
  showDontUnderstand: boolean;
  setShowDontUnderstand: React.Dispatch<React.SetStateAction<boolean>>;
  onPlayAudio?: (text: string, lang: string) => void;
}

export const FormQuestionCard: React.FC<FormQuestionCardProps> = ({
  currentQ,
  currentQuestionIndex,
  totalQuestions,
  userLanguage,
  answers,
  setAnswers,
  inputText,
  setInputText,
  isProcessing,
  processingFieldKey,
  aiCallError,
  setAiCallError,
  processUserAnswer,
  isRecording,
  toggleRecording,
  copiedKey,
  handleCopyText,
  handlePrevQuestion,
  handleNextQuestion,
  handleToggleCheckboxOption,
  showDontUnderstand,
  setShowDontUnderstand,
  onPlayAudio,
}) => {
  const isDari = userLanguage === 'dari';
  const simpleGuidance = getSuperSimpleQuestionGuidance(currentQ.fieldKey, isDari);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xs space-y-5">
      {/* Question Header & Code */}
      <div className="space-y-3 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg">
              {currentQ.questionCode || `Q${currentQ.number}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentQ.section}
            </span>
          </div>

          {onPlayAudio && (
            <button
              type="button"
              onClick={() => {
                const textToRead =
                  simpleGuidance?.audioText ||
                  `${isDari ? currentQ.dariTranslation : currentQ.farsiTranslation}. ${currentQ.explanationFa || simpleGuidance?.meaningSimple || ''}`;
                onPlayAudio(textToRead, userLanguage);
              }}
              className="min-h-[44px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold font-farsi flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
              title="خواندن صوتی سوال و راهنما • Read Question Aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>شنیدن صوتی 🔊</span>
            </button>
          )}
        </div>

        {/* Persian/Dari Question with English Sub-Text */}
        <div>
          <h3 className="font-black text-xl sm:text-2xl text-white leading-relaxed font-farsi">
            {isDari ? currentQ.dariTranslation : currentQ.farsiTranslation}
          </h3>
          <p className="text-xs sm:text-sm font-mono text-slate-400 dir-ltr text-left mt-1.5 font-normal select-all">
            {currentQ.questionEn}
          </p>
        </div>

        {/* Clearly Visible "نمی‌فهمم" Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDontUnderstand((prev) => !prev)}
            className={`w-full min-h-[52px] px-4 py-3 rounded-xl font-farsi font-bold text-sm sm:text-base flex items-center justify-between gap-3 transition shadow-xs cursor-pointer border ${
              showDontUnderstand
                ? 'bg-slate-950 text-white border-slate-600'
                : 'bg-slate-800/90 hover:bg-slate-800 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                💡
              </span>
              <div className="text-right">
                <span className="font-bold text-base sm:text-lg block text-white">
                  {isDari ? 'نمی‌فهمم' : 'نمی‌فهمم'}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-normal">
                  توضیح به زبان ساده و روزمره
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-3 py-1.5 rounded-xl font-sans font-bold shrink-0 ${
                showDontUnderstand ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-700 text-white'
              }`}
            >
              {showDontUnderstand ? 'بستن ✕' : 'توضیح ساده ▾'}
            </span>
          </button>
        </div>

        {/* Collapsible Single "نمی‌فهمم" / Guidance Explanation Box */}
        {showDontUnderstand && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-700 shadow-xl space-y-4 font-farsi dir-rtl animate-fade-in">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm sm:text-base border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-slate-300 shrink-0" />
              <span>راهنمای ساده و منظور این سوال:</span>
            </div>

            {/* Jargon-free Plain Meaning / Explanation */}
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
              {simpleGuidance?.meaningSimple || currentQ.explanationFa}
            </p>

            {simpleGuidance?.whyTheyAsk && (
              <p className="text-xs text-slate-300 leading-normal bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-100 font-bold">چرا می‌پرسند؟ </span>
                {simpleGuidance.whyTheyAsk}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Checkboxes / Options (if any) */}
      {currentQ.options && currentQ.options.length > 0 && (
        <div className="space-y-3 pt-1">
          <span className="text-xs sm:text-sm font-bold text-slate-300 block font-farsi">
            گزینه‌های مورد نظر را انتخاب کنید:
          </span>
          <div className="space-y-2">
            {currentQ.options.map((opt) => {
              const currentSelectedStr = answers[currentQ.fieldKey]?.extractedAnswer || '';
              const isSelected =
                currentSelectedStr.includes(opt.value) || currentSelectedStr.includes(opt.labelEn);

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    handleToggleCheckboxOption(
                      currentQ.fieldKey,
                      opt.value,
                      opt.labelEn,
                      opt.labelFa || ''
                    )
                  }
                  className={`w-full min-h-[50px] p-3.5 rounded-xl border text-right transition flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-600 shadow-xs font-bold'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-slate-950 border-white' : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </span>
                    <span className="font-farsi">{opt.labelFa || opt.labelEn}</span>
                  </div>
                  <span
                    className={`text-xs font-mono dir-ltr shrink-0 ${
                      isSelected ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {opt.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Shamsi Calendar Converter if Date Question */}
      {(currentQ.fieldKey === 'dob' ||
        currentQ.questionEn.toLowerCase().includes('birth') ||
        currentQ.questionEn.toLowerCase().includes('date')) && (
        <div className="pt-1">
          <ShamsiDateConverterWidget
            onSelectGregorianDate={(ukDateFormatted) => {
              const newAnswer: FormAnswer = {
                fieldKey: currentQ.fieldKey,
                questionNumber: currentQ.number,
                questionEn: currentQ.questionEn,
                userRawInput: `تاریخ میلادی: ${ukDateFormatted}`,
                extractedAnswer: ukDateFormatted,
                languageUsed: userLanguage,
                confidence: 'high',
                needsConfirmation: false,
                confirmed: true,
                timestamp: Date.now(),
              };
              setAnswers((prev) => ({ ...prev, [currentQ.fieldKey]: newAnswer }));
            }}
          />
        </div>
      )}

      {/* Shared Answer Block Component */}
      <div className="pt-2">
        <FormAnswerBlock
          currentQ={currentQ}
          inputText={inputText}
          setInputText={setInputText}
          isProcessing={isProcessing}
          processingFieldKey={processingFieldKey}
          aiCallError={aiCallError}
          setAiCallError={setAiCallError}
          processUserAnswer={processUserAnswer}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          existingAnswer={answers[currentQ.fieldKey]}
          copiedKey={copiedKey}
          handleCopyText={handleCopyText}
          userLanguage={userLanguage}
          handlePrevQuestion={handlePrevQuestion}
          handleNextQuestion={handleNextQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />
      </div>
    </div>
  );
};
