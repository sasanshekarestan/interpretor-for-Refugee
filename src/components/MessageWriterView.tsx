import React, { useState, useRef } from 'react';
import { UserLanguage, GeneratedMessage } from '../types';
import { 
  PenTool, 
  Send, 
  Volume2, 
  Copy, 
  Check, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Stethoscope, 
  ShieldAlert, 
  Scale, 
  Home, 
  Briefcase, 
  GraduationCap,
  Mic,
  MicOff
} from 'lucide-react';

interface MessageWriterViewProps {
  userLanguage: UserLanguage;
  onPlayAudio?: (text: string, lang: string) => void;
}

const RECIPIENT_CATEGORIES = [
  { id: 'caseworker', labelEn: 'Caseworker', labelFa: 'مسئول پرونده', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'solicitor', labelEn: 'Solicitor / Legal Aid', labelFa: 'وکیل حقوقی', icon: <Scale className="w-4 h-4" /> },
  { id: 'home_office', labelEn: 'Home Office', labelFa: 'اداره مهاجرت', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'housing', labelEn: 'Housing / Accom.', labelFa: 'اسکان پناهندگی / صاحبخانه', icon: <Home className="w-4 h-4" /> },
  { id: 'nhs_gp', labelEn: 'GP / NHS Health', labelFa: 'پزشک عمومی', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'council', labelEn: 'Local Council', labelFa: 'شهرداری', icon: <Building2 className="w-4 h-4" /> },
  { id: 'school', labelEn: 'School / College', labelFa: 'مدرسه یا کالج فرزندان', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'employer', labelEn: 'Employer / Work', labelFa: 'کارفرما', icon: <Briefcase className="w-4 h-4" /> },
];

export const MessageWriterView: React.FC<MessageWriterViewProps> = ({ userLanguage, onPlayAudio }) => {
  const [recipient, setRecipient] = useState('caseworker');
  const [tone, setTone] = useState<'polite' | 'firm' | 'professional' | 'simple'>('polite');
  const [userDraft, setUserDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported on this browser. Please type or use the Live Audio Interpreter.');
      return;
    }

    try {
      if (isListening) {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fa-IR';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setUserDraft((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (!userDraft.trim()) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/message/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userDraft,
          recipientCategory: recipient,
          tone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedMessage(data);
      } else {
        // Fallback
        setGeneratedMessage({
          id: 'msg_' + Date.now(),
          timestamp: Date.now(),
          recipientCategory: recipient,
          originalText: userDraft,
          englishMessage: `Dear ${recipient},\n\nI am writing regarding my ongoing application. ${userDraft}\n\nThank you for your assistance.\n\nKind regards,`,
          farsiTranslation: `با سلام، این نامه درباره درخواست جاری من است. ${userDraft} با تشکر از کمک شما.`,
          tone,
          suggestions: ['Make sure to include your reference number if writing to Home Office.'],
        });
      }
    } catch (e) {
      setGeneratedMessage({
        id: 'msg_' + Date.now(),
        timestamp: Date.now(),
        recipientCategory: recipient,
        originalText: userDraft,
        englishMessage: `Dear ${recipient},\n\nI am writing to update you on my situation: ${userDraft}\n\nThank you very much.\n\nSincerely,`,
        farsiTranslation: `سلام، این پیام برای اطلاع‌رسانی وضعیت من است: ${userDraft}`,
        tone,
        suggestions: [],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedMessage) {
      navigator.clipboard.writeText(generatedMessage.englishMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-emphasis text-on-emphasis p-6 rounded-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm font-bold">
          <PenTool className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span dir="ltr" className="font-latin">Message writer</span>
        </div>
        <div dir="rtl" className="space-y-2">
          <h2 className="font-farsi text-2xl font-bold leading-tight">نوشتن پیام</h2>
          <p className="font-farsi text-lg text-on-emphasis-muted leading-relaxed">به فارسی یا دری بنویسید. ما آن را به انگلیسی روشن و محترمانه تبدیل می‌کنیم تا مسئول پرونده، وکیل یا پزشک شما فوراً بفهمد.</p>
        </div>
        <div dir="ltr" className="font-latin space-y-0.5 border-t border-white/15 pt-3">
          <p className="font-bold text-base">Write a message</p>
          <p className="text-sm text-on-emphasis-muted leading-relaxed">Tell us what you want to say in Farsi or Dari. We turn it into clear, polite UK English, so your caseworker, solicitor or GP understands it straight away.</p>
        </div>
      </div>

      {/* Main Composer Box */}
      <div className="bg-surface rounded-3xl p-6 border border-edge shadow-hamyar space-y-5">
        {/* Step 1: Select Recipient */}
        <div className="space-y-2">
          <label className="block space-y-0.5">
            <span dir="rtl" className="block font-farsi font-bold text-base text-ink">۱. پیام برای چه کسی است؟</span>
            <span dir="ltr" className="block font-latin text-sm text-ink-muted">1. Who are you writing to?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RECIPIENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setRecipient(cat.id)}
                className={`min-h-[56px] p-3 rounded-2xl border text-base transition flex items-center gap-2 cursor-pointer ${
                  recipient === cat.id
                    ? 'bg-primary border-primary text-on-primary font-bold shadow-hamyar'
                    : 'bg-page border-edge hover:bg-surface text-ink'
                }`}
              >
                <span className={recipient === cat.id ? 'text-on-primary' : 'text-ink-muted'}>
                  {cat.icon}
                </span>
                <span className="text-start min-w-0 leading-tight">
                  <span dir="rtl" className="block font-farsi font-bold break-words">{cat.labelFa}</span>
                  <span dir="ltr" className="block font-latin text-sm opacity-80 break-words">{cat.labelEn}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Tone Selection */}
        <div className="space-y-2">
          <label className="block space-y-0.5">
            <span dir="rtl" className="block font-farsi font-bold text-base text-ink">۲. لحن پیام</span>
            <span dir="ltr" className="block font-latin text-sm text-ink-muted">2. Choose the tone</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'polite', labelFa: 'محترمانه', labelEn: 'Polite' },
              { id: 'professional', labelFa: 'رسمی', labelEn: 'Professional' },
              { id: 'firm', labelFa: 'قاطع و فوری', labelEn: 'Firm and urgent' },
              { id: 'simple', labelFa: 'ساده', labelEn: 'Simple' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={`min-h-[48px] px-4 rounded-2xl transition border cursor-pointer ${
                  tone === t.id
                    ? 'bg-primary text-on-primary border-primary shadow-hamyar'
                    : 'bg-page border-edge text-ink hover:bg-surface'
                }`}
              >
                <span className="text-start leading-tight">
                  <span dir="rtl" className="block font-farsi font-bold text-base">{t.labelFa}</span>
                  <span dir="ltr" className="block font-latin text-sm opacity-80">{t.labelEn}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Input Area */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <label className="block space-y-0.5">
              <span dir="rtl" className="block font-farsi font-bold text-base text-ink">
                ۳. به فارسی یا دری بنویسید یا بگویید
              </span>
              <span dir="ltr" className="block font-latin text-sm text-ink-muted">
                3. Write or say it in Farsi or Dari
              </span>
            </label>
            <button
              type="button"
              onClick={toggleVoiceDictation}
              className={`min-h-[44px] px-3 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                isListening
                  ? 'bg-fault text-on-primary animate-pulse'
                  : 'bg-page text-primary hover:bg-surface border border-edge-control'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-bounce" aria-hidden="true" /> : <Mic className="w-4 h-4" aria-hidden="true" />}
              <span className="text-start leading-tight">
                <span dir="rtl" className="block font-farsi font-bold text-base">
                  {isListening ? 'در حال شنیدن…' : 'گفتن به جای نوشتن'}
                </span>
                <span dir="ltr" className="block font-latin text-sm opacity-80">
                  {isListening ? 'Listening' : 'Speak instead'}
                </span>
              </span>
            </button>
          </div>

          <div className="relative">
            <textarea dir="rtl"
              value={userDraft}
              onChange={(e) => setUserDraft(e.target.value)}
              rows={4}
              placeholder="مثلا: سلام، من می‌خواهم بدانم نتایج مصاحبه من چه زمانی آماده می‌شود یا دکمه میکروفون بالا را فشار دهید..."
              className={`w-full p-4 rounded-2xl border border-edge-control focus:ring-2 focus:ring-primary text-lg leading-[1.9] text-ink font-farsi shadow-hamyar ${
                isListening ? 'ring-2 ring-fault bg-fault-bg' : ''
              }`}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateMessage}
          disabled={!userDraft.trim() || isGenerating}
          className="w-full min-h-[56px] px-6 bg-primary hover:bg-primary-press disabled:bg-page
                     disabled:text-ink-muted disabled:cursor-not-allowed text-on-primary rounded-2xl
                     transition shadow-hamyar flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-start leading-tight">
            <span dir="rtl" className="block font-farsi font-bold text-base">
              {isGenerating ? 'در حال نوشتن…' : 'پیام انگلیسی را بنویس'}
            </span>
            <span dir="ltr" className="block font-latin text-sm opacity-80">
              {isGenerating ? 'Writing your message' : 'Write it in English'}
            </span>
          </span>
        </button>
      </div>

      {/* BEFORE YOU SEND - REVIEW RESULT CARD */}
      {generatedMessage && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-edge border-s-4 border-s-primary shadow-hamyar space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-edge">
            <div className="flex items-center gap-2 text-primary">
              <UserCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-start leading-tight">
                <span dir="rtl" className="block font-farsi font-bold text-base">قبل از ارسال بررسی کنید</span>
                <span dir="ltr" className="block font-latin text-sm text-ink-muted">Before you send</span>
              </span>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-page border border-edge text-ink-muted">
              Tone: {tone}
            </span>
          </div>

          {/* Generated English Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-muted">Your message in clear UK English:</span>
              <div className="flex items-center gap-2">
                {onPlayAudio && (
                  <button
                    onClick={() => onPlayAudio(generatedMessage.englishMessage, 'en-GB')}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-bold"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Play Aloud</span>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-emphasis text-on-emphasis font-sans rounded-2xl text-sm leading-relaxed whitespace-pre-wrap select-all">
              {generatedMessage.englishMessage}
            </div>
          </div>

          {/* Farsi Translation of Message */}
          <div dir="rtl" className="space-y-1.5 pt-2 border-t border-edge">
            <span className="text-xs font-bold text-primary">ترجمه فارسی پیام (جهت اطمینان شما):</span>
            <p className="p-3.5 bg-page rounded-2xl text-xs font-farsi text-ink leading-relaxed border border-edge">
              {generatedMessage.farsiTranslation}
            </p>
          </div>

          {/* Tone refinement buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-muted mr-1">Refine options:</span>
            <button
              onClick={() => {
                setTone('polite');
                handleGenerateMessage();
              }}
              className="px-3 py-1.5 bg-page hover:bg-page rounded-xl text-xs font-semibold text-ink-muted"
            >
              Make it more polite
            </button>
            <button
              onClick={() => {
                setTone('simple');
                handleGenerateMessage();
              }}
              className="px-3 py-1.5 bg-page hover:bg-page rounded-xl text-xs font-semibold text-ink-muted"
            >
              Make it simpler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
