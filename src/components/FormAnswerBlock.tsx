import React from 'react';
import { FormQuestion, FormAnswer, UserLanguage } from '../types';
import { 
  Mic, 
  Check, 
  Copy, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  RotateCcw 
} from 'lucide-react';

export interface FormAnswerBlockProps {
  currentQ: FormQuestion;
  inputText: string;
  setInputText: (val: string) => void;
  isProcessing: boolean;
  processingFieldKey: string | null;
  aiCallError: {
    fieldKey: string;
    failedText: string;
    messageFa: string;
  } | null;
  setAiCallError: (err: any) => void;
  processUserAnswer: (text: string) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  existingAnswer?: FormAnswer;
  copiedKey: string | null;
  handleCopyText: (text: string, key: string) => void;
  userLanguage: UserLanguage;
  handlePrevQuestion: () => void;
  handleNextQuestion: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const FormAnswerBlock: React.FC<FormAnswerBlockProps> = ({
  currentQ,
  inputText,
  setInputText,
  isProcessing,
  processingFieldKey,
  aiCallError,
  setAiCallError,
  processUserAnswer,
  isRecording,
  toggleRecording,
  existingAnswer,
  copiedKey,
  handleCopyText,
  userLanguage,
  handlePrevQuestion,
  handleNextQuestion,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const isDari = userLanguage === 'dari';
  const isCurrentProcessing = isProcessing && processingFieldKey === currentQ.fieldKey;

  return (
    <div className="space-y-4 font-farsi dir-rtl text-right">
      {/* Text Input / Voice Answer Section (when no predefined checkboxes, or as extra detail) */}
      {(!currentQ.options || currentQ.options.length === 0) && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-slate-300">
              {isDari ? 'پاسخ یا معلومات خود را بنویسید:' : 'پاسخ یا اطلاعات خود را وارد کنید:'}
            </span>
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`min-h-[48px] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isRecording ? (isDari ? 'در حال ثبت صدا...' : 'در حال ضبط صدا...') : 'پاسخ با صدا 🎙️'}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (aiCallError && aiCallError.fieldKey === currentQ.fieldKey) {
                  setAiCallError(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  if (inputText.trim()) {
                    processUserAnswer(inputText.trim());
                  }
                }
              }}
              placeholder={currentQ.exampleFormat || (isDari ? 'مثال: نام، نمبر، یا آدرس خود را بنویسید' : 'مثال: نام، شماره، یا آدرس خود را بنویسید')}
              className="flex-1 min-h-[52px] px-4 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm sm:text-base font-farsi dir-rtl focus:ring-2 focus:ring-[#005EB8]"
            />
            <button
              type="button"
              onClick={() => {
                if (inputText.trim()) {
                  processUserAnswer(inputText.trim());
                }
              }}
              disabled={isProcessing || !inputText.trim()}
              className="min-h-[52px] px-5 bg-[#005EB8] hover:bg-blue-600 disabled:opacity-40 text-white font-bold rounded-2xl text-sm transition shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {isCurrentProcessing ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>{isDari ? 'در حال تنظیم...' : 'در حال تنظیم...'}</span>
                </>
              ) : (
                <span>{isDari ? 'ثبت و ترجمه' : 'ثبت و ترجمه'}</span>
              )}
            </button>
          </div>

          {/* AI Call Error & Retry Chip - Keeps typed text intact */}
          {aiCallError && aiCallError.fieldKey === currentQ.fieldKey && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-farsi font-medium">{aiCallError.messageFa}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const textToRetry = aiCallError.failedText || inputText;
                  setAiCallError(null);
                  processUserAnswer(textToRetry);
                }}
                className="min-h-[44px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-farsi font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isDari ? 'تلاش دوباره ↺' : 'تلاش مجدد ↺'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Exact English Output Box (To write on paper form) */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-bold text-slate-300">
            {isDari ? 'متن انگلیسی برای نوشتن روی برگه کاغذی:' : 'متن انگلیسی جهت نوشتن روی برگه کاغذی:'}
          </span>
          {existingAnswer && !isCurrentProcessing && (
            <button
              type="button"
              onClick={() => handleCopyText(existingAnswer.extractedAnswer, currentQ.fieldKey)}
              className="min-h-[44px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copiedKey === currentQ.fieldKey ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{isDari ? 'کاپی شد!' : 'کپی شد!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{isDari ? 'کاپی متن' : 'کپی متن'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Small skeleton and typing indicator on that question only (never full-screen blocking spinner) */}
        {isCurrentProcessing ? (
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-700 min-h-[50px] flex flex-col justify-center gap-2 animate-fade-in">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-farsi">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              </div>
              <span className="font-medium">
                {isDari ? 'هوش مصنوعی در حال آماده‌سازی پاسخ انگلیسی...' : 'هوش مصنوعی در حال تنظیم دقیق پاسخ انگلیسی...'}
              </span>
            </div>
            <div className="space-y-1.5 pt-0.5">
              <div className="h-3.5 bg-slate-800 rounded-md animate-pulse w-3/4"></div>
              <div className="h-2.5 bg-slate-800/60 rounded-md animate-pulse w-1/2"></div>
            </div>
          </div>
        ) : (
          <div className={`p-3.5 bg-slate-900 rounded-xl font-mono text-base sm:text-lg dir-ltr text-left border-2 min-h-[50px] flex items-center select-all ${
            existingAnswer
              ? 'border-amber-500/70 text-amber-300 font-bold'
              : 'border-slate-800 text-slate-500 font-normal'
          }`}>
            {existingAnswer ? existingAnswer.extractedAnswer : '(هنوز پاسخی وارد نشده است)'}
          </div>
        )}
      </div>

      {/* Step Navigation Buttons (Large Next Button, min-h-[52px] tap targets) */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="min-h-[52px] py-3.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold rounded-2xl text-sm sm:text-base transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-5 h-5" />
          <span>{isDari ? 'سوال قبلی' : 'سوال قبلی'}</span>
        </button>

        <button
          type="button"
          onClick={handleNextQuestion}
          className="min-h-[52px] py-3.5 px-4 bg-[#005EB8] hover:bg-blue-600 text-white font-black rounded-2xl text-sm sm:text-base transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          <span>{currentQuestionIndex < totalQuestions - 1 ? (isDari ? 'سوال بعدی' : 'سوال بعدی') : (isDari ? 'بررسی نهایی' : 'بررسی نهایی')}</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
