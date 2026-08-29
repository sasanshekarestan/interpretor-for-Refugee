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
  { id: 'caseworker', labelEn: 'Caseworker', labelFa: 'مسئول پرونده (Caseworker)', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'solicitor', labelEn: 'Solicitor / Legal Aid', labelFa: 'وکیل حقوقی (Solicitor)', icon: <Scale className="w-4 h-4" /> },
  { id: 'home_office', labelEn: 'Home Office', labelFa: 'اداره مهاجرت (Home Office)', icon: <ShieldAlert className="w-4 h-4" /> },
  { id: 'housing', labelEn: 'Housing / Accom.', labelFa: 'اسکان پناهندگی / صاحبخانه', icon: <Home className="w-4 h-4" /> },
  { id: 'nhs_gp', labelEn: 'GP / NHS Health', labelFa: 'پزشک عمومی (GP / NHS)', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'council', labelEn: 'Local Council', labelFa: 'شهرداری (Council)', icon: <Building2 className="w-4 h-4" /> },
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
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white p-6 rounded-3xl shadow-sm border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-800/60 text-amber-200 text-xs font-semibold">
            <PenTool className="w-3.5 h-3.5" />
            <span>Message Writer Companion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
            <span>✍️ Write a message</span>
            <span className="text-amber-300 font-farsi font-normal">| نوشتن پیام واضح و محترمانه</span>
          </h2>
          <p className="text-xs text-amber-100 max-w-xl">
            Tell us what you want to say in Farsi or Dari. We will turn it into clear, natural UK English so your caseworker, solicitor, or GP understands immediately.
          </p>
        </div>
      </div>

      {/* Main Composer Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
        {/* Step 1: Select Recipient */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            1. Who are you writing to? / گیرنده پیام کیست؟
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RECIPIENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setRecipient(cat.id)}
                className={`p-3 rounded-2xl border text-xs font-medium transition flex items-center gap-2 ${
                  recipient === cat.id
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className={recipient === cat.id ? 'text-amber-600' : 'text-slate-500'}>
                  {cat.icon}
                </span>
                <div className="text-left overflow-hidden">
                  <p className="truncate">{cat.labelEn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Tone Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            2. Choose tone / لحن پیام:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'polite', labelEn: '🟢 Polite (محترمانه)', desc: 'Warm & courteous' },
              { id: 'professional', labelEn: '🔵 Professional (رسمی)', desc: 'Formal UK business' },
              { id: 'firm', labelEn: '🟡 Firm & Urgent (قاطع و فوری)', desc: 'Clear boundaries' },
              { id: 'simple', labelEn: '⚪ Simple (ساده)', desc: 'Short sentences' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                  tone === t.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              3. Write or speak what you want to say in Farsi / Dari:
            </label>
            <button
              type="button"
              onClick={toggleVoiceDictation}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4 text-amber-700" />}
              <span>{isListening ? 'در حال شنیدن...' : '🎤 ضبط صوتی (Speak)'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              value={userDraft}
              onChange={(e) => setUserDraft(e.target.value)}
              rows={4}
              placeholder="مثلا: سلام، من می‌خواهم بدانم نتایج مصاحبه من چه زمانی آماده می‌شود یا دکمه میکروفون بالا را فشار دهید..."
              className={`w-full p-4 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm text-slate-900 font-farsi dir-rtl shadow-2xs ${
                isListening ? 'ring-2 ring-rose-500/40 bg-rose-50/20' : ''
              }`}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateMessage}
          disabled={!userDraft.trim() || isGenerating}
          className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-2xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{isGenerating ? 'Generating UK English Message...' : 'Create UK English Message →'}</span>
        </button>
      </div>

      {/* BEFORE YOU SEND - REVIEW RESULT CARD */}
      {generatedMessage && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-500 shadow-md space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <span>Before you send / قبل از ارسال بررسی کنید</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
              Tone: {tone}
            </span>
          </div>

          {/* Generated English Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">🇬🇧 Your message in clear UK English:</span>
              <div className="flex items-center gap-2">
                {onPlayAudio && (
                  <button
                    onClick={() => onPlayAudio(generatedMessage.englishMessage, 'en-GB')}
                    className="inline-flex items-center gap-1 text-xs text-amber-700 hover:underline font-semibold"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Play Aloud</span>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline font-semibold"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white font-sans rounded-2xl text-sm leading-relaxed whitespace-pre-wrap select-all">
              {generatedMessage.englishMessage}
            </div>
          </div>

          {/* Farsi Translation of Message */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dir-rtl">
            <span className="text-xs font-bold text-teal-900">ترجمه فارسی پیام (جهت اطمینان شما):</span>
            <p className="p-3.5 bg-slate-50 rounded-2xl text-xs font-farsi text-slate-800 leading-relaxed border border-slate-200">
              {generatedMessage.farsiTranslation}
            </p>
          </div>

          {/* Tone refinement buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Refine options:</span>
            <button
              onClick={() => {
                setTone('polite');
                handleGenerateMessage();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              Make it more polite
            </button>
            <button
              onClick={() => {
                setTone('simple');
                handleGenerateMessage();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              Make it simpler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
