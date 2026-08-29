import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  FormQuestion,
  FormAnswer,
  FormConsistencyWarning,
  UserLanguage,
} from '../types';
import { OFFICIAL_FORMS, OfficialForm } from '../data/officialForms';
import { detectAndConvertShamsi } from '../utils/dateConverter';
import { ChatMessage, CustomFormObject, PhoneView } from './types';

/**
 * All Form Companion state and behaviour, with no JSX.
 *
 * Everything the old FormCompanion.tsx did between its state declarations and
 * its first `return (` lives here: form selection, question navigation, answer
 * extraction, localStorage persistence, the assistant chat, and voice input.
 * The UI layer reads this and renders; it holds no session state of its own.
 */

interface UseFormSessionArgs {
  userLanguage: UserLanguage;
  initialFormId?: string | null;
  customUploadedForm?: CustomFormObject | null;
  onClearCustomForm?: () => void;
}

export interface PendingExtraction {
  extractedAnswer: string;
  summaryFa: string;
  confidence: 'high' | 'medium' | 'low';
  needsConfirmation: boolean;
  warningFa?: string;
}

export interface AiCallError {
  fieldKey: string;
  failedText: string;
  messageFa: string;
}

const CUSTOM_ID = 'custom_uploaded';

const answersKey = (formId: string) => `form_answers_${formId}`;
const checkboxKey = (formId: string) => `form_checkboxes_${formId}`;

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (_) {
    return fallback;
  }
};

const countAnswered = (saved: Record<string, FormAnswer>) =>
  Object.values(saved).filter(
    (a) => a && typeof a.extractedAnswer === 'string' && a.extractedAnswer.trim().length > 0
  ).length;

/** Answered count for a form, without loading it. Used by the library cards. */
export const savedAnswerCount = (formId: string): number =>
  countAnswered(readJson<Record<string, FormAnswer>>(answersKey(formId), {}));

export const useFormSession = ({
  userLanguage,
  initialFormId,
  customUploadedForm,
  onClearCustomForm,
}: UseFormSessionArgs) => {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(initialFormId || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<Record<string, string[]>>({});
  const [inputText, setInputText] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiCallError, setAiCallError] = useState<AiCallError | null>(null);
  const [pendingExtraction, setPendingExtraction] = useState<PendingExtraction | null>(null);

  const [phoneView, setPhoneView] = useState<PhoneView>('document');
  const [documentPageIndex, setDocumentPageIndex] = useState(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const [showReviewMode, setShowReviewMode] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [consistencyWarnings, setConsistencyWarnings] = useState<FormConsistencyWarning[]>([]);

  const speechRecognitionRef = useRef<any>(null);

  const isDari = userLanguage === 'dari';

  // ---------------------------------------------------------------- form data

  const isCustomFormActive = selectedFormId === CUSTOM_ID && !!customUploadedForm;

  const selectedForm: OfficialForm | undefined = useMemo(() => {
    if (isCustomFormActive && customUploadedForm) {
      return {
        id: CUSTOM_ID,
        code: 'CUSTOM',
        titleEn: customUploadedForm.title,
        titleFa: customUploadedForm.titleFa,
        titleDari: customUploadedForm.titleFa,
        issuer: 'User Upload',
        category: 'custom',
        purposeFa: customUploadedForm.description,
        purposeEn: customUploadedForm.description,
        pdfPath: '',
        officialSourceUrl: '',
        pageCount: customUploadedForm.uploadedPages?.length || 1,
        questions: customUploadedForm.questions,
      } as OfficialForm;
    }
    return OFFICIAL_FORMS.find((f) => f.id === selectedFormId);
  }, [selectedFormId, isCustomFormActive, customUploadedForm]);

  /** Sequential numbering, so question codes always match the guide. */
  const questions: FormQuestion[] = useMemo(() => {
    const raw = selectedForm?.questions ?? [];
    return raw.map((q, idx) => ({ ...q, number: idx + 1, questionCode: `Q${idx + 1}` }));
  }, [selectedForm]);

  const currentQuestion: FormQuestion | undefined = questions[currentQuestionIndex] || questions[0];

  /** Pages of an uploaded form; undefined for a library form. */
  const customPages = isCustomFormActive ? customUploadedForm?.uploadedPages : undefined;

  const answeredCount = countAnswered(answers);
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const displayTitle = isDari
    ? selectedForm?.titleDari || selectedForm?.titleFa || ''
    : selectedForm?.titleFa || '';

  // -------------------------------------------------------------- selection

  const selectForm = useCallback(
    (formId: string) => {
      setSelectedFormId(formId);
      setPhoneView('document');
      setDocumentPageIndex(0);
      setShowReviewMode(false);
      setInputText('');
      setPendingExtraction(null);
      setAiCallError(null);
      setChatMessages([]);
      setChatInput('');
      setIsAssistantOpen(false);
      setConsistencyWarnings([]);

      if (formId !== CUSTOM_ID) onClearCustomForm?.();

      const target =
        formId === CUSTOM_ID
          ? customUploadedForm
          : OFFICIAL_FORMS.find((f) => f.id === formId);

      const saved = readJson<Record<string, FormAnswer>>(answersKey(formId), {});
      const savedCount = countAnswered(saved);

      const firstUnanswered = target?.questions?.findIndex((q) => {
        const a = saved[q.fieldKey];
        return !a || !a.extractedAnswer || a.extractedAnswer.trim().length === 0;
      });

      setCurrentQuestionIndex(firstUnanswered !== undefined && firstUnanswered !== -1 ? firstUnanswered : 0);
      setShowRestoredBanner(savedCount > 0);
    },
    [customUploadedForm, onClearCustomForm]
  );

  /** Back to the library, and let go of any uploaded form with it. */
  const closeForm = useCallback(() => {
    setSelectedFormId(null);
    setAnswers({});
    setSelectedCheckboxValues({});
    setChatMessages([]);
    setInputText('');
    setPendingExtraction(null);
    setShowReviewMode(false);
    setIsAssistantOpen(false);
    onClearCustomForm?.();
  }, [onClearCustomForm]);

  // An uploaded form always wins; a chosen library form is only applied once,
  // so clearing an upload can no longer drag the previous selection back.
  const appliedInitialRef = useRef<string | null>(null);
  useEffect(() => {
    if (customUploadedForm) {
      setSelectedFormId(CUSTOM_ID);
      setPhoneView('document');
      setCurrentQuestionIndex(0);
      setDocumentPageIndex(0);
      setShowReviewMode(false);
      setInputText('');
      setPendingExtraction(null);
      return;
    }
    if (initialFormId && appliedInitialRef.current !== initialFormId) {
      appliedInitialRef.current = initialFormId;
      selectForm(initialFormId);
    }
    if (!initialFormId) appliedInitialRef.current = null;
  }, [initialFormId, customUploadedForm, selectForm]);

  // ------------------------------------------------------------ persistence

  useEffect(() => {
    if (!selectedFormId) return;
    setAnswers(readJson<Record<string, FormAnswer>>(answersKey(selectedFormId), {}));
    setSelectedCheckboxValues(readJson<Record<string, string[]>>(checkboxKey(selectedFormId), {}));
  }, [selectedFormId]);

  useEffect(() => {
    if (!selectedFormId || Object.keys(answers).length === 0) return;
    try {
      localStorage.setItem(answersKey(selectedFormId), JSON.stringify(answers));
    } catch (_) {}
  }, [answers, selectedFormId]);

  useEffect(() => {
    if (!selectedFormId || Object.keys(selectedCheckboxValues).length === 0) return;
    try {
      localStorage.setItem(checkboxKey(selectedFormId), JSON.stringify(selectedCheckboxValues));
    } catch (_) {}
  }, [selectedCheckboxValues, selectedFormId]);

  // Show the question's saved answer when the question changes.
  useEffect(() => {
    if (!currentQuestion) return;
    const existing = answers[currentQuestion.fieldKey];
    setInputText(existing?.userRawInput || existing?.extractedAnswer || '');
    setPendingExtraction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, selectedFormId, currentQuestion?.fieldKey]);

  const clearAnswers = useCallback(() => {
    if (!selectedFormId) return;
    try {
      localStorage.removeItem(answersKey(selectedFormId));
      localStorage.removeItem(checkboxKey(selectedFormId));
    } catch (_) {}
    setAnswers({});
    setSelectedCheckboxValues({});
    setInputText('');
    setPendingExtraction(null);
    setCurrentQuestionIndex(0);
    setShowRestoredBanner(false);
  }, [selectedFormId]);

  // -------------------------------------------------------------- answering

  const writeAnswer = useCallback(
    (question: FormQuestion, raw: string, extracted: string, confidence: FormAnswer['confidence'] = 'high') => {
      const answer: FormAnswer = {
        fieldKey: question.fieldKey,
        questionNumber: question.number,
        questionEn: question.questionEn,
        userRawInput: raw,
        extractedAnswer: extracted,
        languageUsed: userLanguage,
        confidence,
        needsConfirmation: false,
        confirmed: true,
        timestamp: Date.now(),
      };
      setAnswers((prev) => ({ ...prev, [question.fieldKey]: answer }));
    },
    [userLanguage]
  );

  const saveCurrentInput = useCallback(() => {
    if (!currentQuestion || !inputText.trim()) return;
    const existing = answers[currentQuestion.fieldKey];
    if (existing && existing.userRawInput === inputText.trim()) return;
    writeAnswer(
      currentQuestion,
      inputText.trim(),
      pendingExtraction?.extractedAnswer || inputText.trim(),
      pendingExtraction?.confidence || 'high'
    );
  }, [currentQuestion, inputText, answers, pendingExtraction, writeAnswer]);

  const runConsistencyCheck = useCallback(async () => {
    try {
      const res = await fetch('/api/form/consistency-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formAnswers: (Object.values(answers) as FormAnswer[]).map((a) => ({
            fieldKey: a.fieldKey,
            answer: a.extractedAnswer,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setConsistencyWarnings(data.warnings || []);
      }
    } catch (_) {
      // A failed check must never block the user from their answer sheet.
    }
  }, [answers]);

  const goToQuestion = useCallback(
    (index: number) => {
      saveCurrentInput();
      setCurrentQuestionIndex(Math.max(0, Math.min(questions.length - 1, index)));
    },
    [questions.length, saveCurrentInput]
  );

  const nextQuestion = useCallback(() => {
    saveCurrentInput();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      runConsistencyCheck();
      setShowReviewMode(true);
    }
  }, [currentQuestionIndex, questions.length, saveCurrentInput, runConsistencyCheck]);

  const prevQuestion = useCallback(() => {
    saveCurrentInput();
    setCurrentQuestionIndex((i) => Math.max(0, i - 1));
  }, [saveCurrentInput]);

  const toggleCheckboxOption = useCallback(
    (fieldKey: string, optionValue: string) => {
      const target = questions.find((q) => q.fieldKey === fieldKey) || currentQuestion;
      if (!target) return;

      const current = selectedCheckboxValues[fieldKey] || [];
      const updated = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];

      setSelectedCheckboxValues((prev) => ({ ...prev, [fieldKey]: updated }));

      const opts = target.options || [];
      const chosen = opts.filter((o) => updated.includes(o.value));
      const answerEn =
        chosen.length > 0
          ? `Tick on Form: ${chosen.map((o) => `[X] ${o.labelEn}`).join(' / ')}`
          : 'None ticked';
      const summaryFa =
        chosen.length > 0
          ? `گزینه‌های تیک خورده: ${chosen.map((o) => o.labelFa).join(' ، ')}`
          : 'هیچ گزینه‌ای تیک نخورده است';

      writeAnswer(target, summaryFa, answerEn);
    },
    [questions, currentQuestion, selectedCheckboxValues, writeAnswer]
  );

  /** Send the typed or spoken answer to the parser, with Shamsi dates handled locally. */
  const submitAnswer = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || !currentQuestion) return;

      setIsProcessing(true);
      setAiCallError(null);

      const q = currentQuestion;
      const looksLikeDate =
        q.fieldKey === 'dob' ||
        q.questionEn.toLowerCase().includes('birth') ||
        q.questionEn.toLowerCase().includes('date');
      const shamsi = detectAndConvertShamsi(value);

      if (shamsi && looksLikeDate) {
        setIsProcessing(false);
        writeAnswer(q, value, shamsi.gregorianFormatted);
        setPendingExtraction({
          extractedAnswer: shamsi.gregorianFormatted,
          summaryFa: `تاریخ شمسی شما (${shamsi.shamsiStr}) به تاریخ میلادی بریتانیا (${shamsi.gregorianFormatted} - ${shamsi.gregorianTextFa}) تبدیل شد.`,
          confidence: 'high',
          needsConfirmation: false,
          warningFa: 'در تمام فرم‌های رسمی بریتانیا (اداره مهاجرت و NHS) تاریخ تولد به میلادی ثبت می‌شود.',
        });
        return;
      }

      try {
        const res = await fetch('/api/form/parse-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionEn: q.questionEn,
            userSpeechOrText: value,
            userLanguage,
            fieldKey: q.fieldKey,
          }),
        });

        if (!res.ok) throw new Error('parse failed');

        const data = await res.json();
        const extracted = data.extractedAnswer || value;
        writeAnswer(q, value, extracted, data.confidence || 'high');
        setPendingExtraction({
          extractedAnswer: extracted,
          summaryFa: data.summaryFa || `پاسخ شما: ${value}`,
          confidence: data.confidence || 'high',
          needsConfirmation: false,
          warningFa: data.warningFa,
        });
      } catch (_) {
        // The typed text is never thrown away when the network fails.
        setAiCallError({
          fieldKey: q.fieldKey,
          failedText: value,
          messageFa: isDari
            ? 'ارتباط با هوش مصنوعی برقرار نشد. متن تایپ‌شده شما محفوظ است.'
            : 'ارتباط با هوش مصنوعی برقرار نشد. متن تایپ‌شده شما حفظ شده است.',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [currentQuestion, userLanguage, isDari, writeAnswer]
  );

  // ------------------------------------------------------------- assistant

  const sendChatMessage = useCallback(
    async (message?: string) => {
      const text = (message ?? chatInput).trim();
      if (!text || isChatProcessing) return;

      setChatMessages((prev) => [
        ...prev,
        { id: 'msg_user_' + Date.now(), sender: 'user', textFa: text, timestamp: Date.now(), fieldKey: currentQuestion?.fieldKey },
      ]);
      setChatInput('');
      setIsChatProcessing(true);

      const shamsi = detectAndConvertShamsi(text);
      const looksLikeDate =
        currentQuestion &&
        (currentQuestion.fieldKey === 'dob' ||
          currentQuestion.questionEn.toLowerCase().includes('birth') ||
          currentQuestion.questionEn.toLowerCase().includes('date'));

      if (shamsi && looksLikeDate) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'msg_ai_' + Date.now(),
            sender: 'ai',
            textFa: `تاریخ شمسی شما (${shamsi.shamsiStr}) به تاریخ میلادی بریتانیا تبدیل شد:\n\n📅 ${shamsi.gregorianFormatted} (${shamsi.gregorianTextFa})\n\nدر تمام فرم‌های رسمی بریتانیا (اداره مهاجرت و NHS) تاریخ تولد به میلادی ثبت می‌شود.`,
            timestamp: Date.now(),
            fieldKey: currentQuestion?.fieldKey,
            suggestedAnswer: shamsi.gregorianFormatted,
          },
        ]);
        setIsChatProcessing(false);
        return;
      }

      try {
        const res = await fetch('/api/form/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            formTitle: selectedForm?.titleEn || 'UK Form Document',
            questions,
            activeFieldKey: currentQuestion?.fieldKey,
            currentAnswers: answers,
            userLanguage,
          }),
        });

        if (!res.ok) throw new Error('chat failed');

        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'msg_ai_' + Date.now(),
            sender: 'ai',
            textFa: data.replyFa || 'متشکرم. توضیحات ثبت گردید.',
            timestamp: Date.now(),
            fieldKey: data.fieldKey || currentQuestion?.fieldKey,
            suggestedAnswer: data.suggestedAnswer,
          },
        ]);
      } catch (_) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'msg_ai_' + Date.now(),
            sender: 'ai',
            textFa: currentQuestion
              ? `درباره «${text}»:\n\nسوال این خانه: ${currentQuestion.farsiTranslation}\n\n${currentQuestion.explanationFa}`
              : 'در حال حاضر ارتباط با دستیار برقرار نیست. لطفاً دوباره تلاش کنید.',
            timestamp: Date.now(),
            fieldKey: currentQuestion?.fieldKey,
          },
        ]);
      } finally {
        setIsChatProcessing(false);
      }
    },
    [chatInput, isChatProcessing, currentQuestion, selectedForm, questions, answers, userLanguage]
  );

  /** Put the assistant's suggestion into the answer field, for the user to accept. */
  const useSuggestion = useCallback((suggestion: string) => {
    setInputText(suggestion);
    setIsAssistantOpen(false);
  }, []);

  // ----------------------------------------------------------------- voice

  const toggleRecording = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isRecording) {
      try {
        speechRecognitionRef.current?.stop();
      } catch (_) {}
      setIsRecording(false);
      return;
    }

    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => setIsRecording(false), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = userLanguage === 'english' ? 'en-GB' : 'fa-IR';
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript + ' ';
        if (transcript.trim()) setInputText(transcript.trim());
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (_) {
      setIsRecording(false);
    }
  }, [isRecording, userLanguage]);

  useEffect(() => {
    return () => {
      try {
        speechRecognitionRef.current?.stop();
      } catch (_) {}
    };
  }, []);

  return {
    // data
    isDari,
    selectedFormId,
    selectedForm,
    displayTitle,
    questions,
    currentQuestion,
    currentQuestionIndex,
    customPages,
    answers,
    selectedCheckboxValues,
    answeredCount,
    totalQuestions,
    progress,
    consistencyWarnings,

    // view state
    phoneView,
    setPhoneView,
    documentPageIndex,
    setDocumentPageIndex,
    showReviewMode,
    setShowReviewMode,
    showRestoredBanner,
    dismissRestoredBanner: () => setShowRestoredBanner(false),
    isAssistantOpen,
    setIsAssistantOpen,

    // answering
    inputText,
    setInputText,
    isProcessing,
    pendingExtraction,
    aiCallError,
    submitAnswer,
    toggleCheckboxOption,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    saveCurrentInput,
    clearAnswers,
    runConsistencyCheck,

    // assistant
    chatMessages,
    chatInput,
    setChatInput,
    isChatProcessing,
    sendChatMessage,
    useSuggestion,

    // voice
    isRecording,
    toggleRecording,

    // selection
    selectForm,
    closeForm,
  };
};

export type FormSession = ReturnType<typeof useFormSession>;
