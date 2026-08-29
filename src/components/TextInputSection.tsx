import React, { useState, useRef } from 'react';
import { Send, Mic, MicOff, Trash2, Keyboard } from 'lucide-react';
import { TranslationDirection } from '../types';
import { primeAudioPlayback } from '../utils/audioHelper';

interface TextInputSectionProps {
  direction: TranslationDirection;
  dialectHint: string;
  isProcessing: boolean;
  onTextSubmit: (text: string, overrideDirection?: TranslationDirection) => Promise<void>;
  onChangeDirection?: (dir: TranslationDirection) => void;
  onSwitchToVoice: () => void;
}

export const TextInputSection: React.FC<TextInputSectionProps> = ({
  direction,
  isProcessing,
  onTextSubmit,
  onChangeDirection,
  onSwitchToVoice,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isFarsiToEnglish = direction === 'farsi_to_english';

  const toggleDirection = (newDir: TranslationDirection) => {
    if (onChangeDirection) {
      onChangeDirection(newDir);
    }
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback to full Audio Voice Input mode if browser doesn't support Web Speech API
      onSwitchToVoice();
      return;
    }

    try {
      if (isListening) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isFarsiToEnglish ? 'fa-IR' : 'en-GB';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }
        const textToSet = (finalTranscript + interimTranscript).trim();
        if (textToSet) {
          setText(textToSet);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event?.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('Speech recognition unavailable:', e?.message || e);
      setIsListening(false);
      onSwitchToVoice();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isProcessing) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    primeAudioPlayback();
    onTextSubmit(text.trim(), direction);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Direction Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            id="btn-dir-farsi-to-en"
            onClick={() => toggleDirection('farsi_to_english')}
            title="Farsi & Dari to English Translation / ترجمه فارسی و دری به انگلیسی"
            aria-label="Farsi & Dari to English Translation / ترجمه فارسی و دری به انگلیسی"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isFarsiToEnglish
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="font-farsi">فارسی صحبت کنید ➔ English</span>
          </button>

          <button
            type="button"
            id="btn-dir-en-to-farsi"
            onClick={() => toggleDirection('english_to_farsi')}
            title="English to Farsi & Dari Translation / ترجمه انگلیسی به فارسی و دری"
            aria-label="English to Farsi & Dari Translation / ترجمه انگلیسی به فارسی و دری"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              !isFarsiToEnglish
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>English ➔ فارسی (Farsi & Dari)</span>
          </button>
        </div>

        <button
          type="button"
          id="btn-switch-to-voice-mode"
          onClick={onSwitchToVoice}
          title="Switch to Full Audio Voice Recording Mode / تغییر به حالت ضبط صوتی کامل"
          aria-label="Switch to Full Audio Voice Recording Mode / تغییر به حالت ضبط صوتی کامل"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 px-3 py-1.5 rounded-xl transition font-farsi"
        >
          <Mic className="w-4 h-4 text-teal-700" />
          <span>{isFarsiToEnglish ? '🎤 حالت ضبط صوتی (Voice Recording)' : 'Switch to Full Voice Mode'}</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Prominent Voice Mic Bar above/attached to Textarea */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 border border-slate-200 border-b-0 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700 font-farsi">
              {isFarsiToEnglish ? 'تایپ کنید یا دکمه میکروفون را فشار دهید:' : 'Type or click microphone to speak:'}
            </span>
          </div>

          <button
            type="button"
            id="btn-dictate-mic-input"
            onClick={startVoiceDictation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-teal-700 hover:bg-teal-800 text-white'
            }`}
            title="Click to dictate using your voice / برای صحبت کردن کلیک کنید"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 animate-bounce" />
                <span>در حال شنیدن... (توقف)</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>🎤 صحبت کنید (Audio Input)</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <textarea
            id="input-translate-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            dir={isFarsiToEnglish ? 'rtl' : 'ltr'}
            aria-label={isFarsiToEnglish ? 'متن مورد نظر خود را به زبان فارسی یا دری بنویسید' : 'Enter English statement to translate'}
            placeholder={
              isFarsiToEnglish
                ? 'متن خود را اینجا تایپ کنید یا دکمه میکروفون بالا را فشار دهید تا صحبت کنید (مثلاً: می‌خوام آدرس هوم آفیس رو بدونم یا کارتم مسدود شده...)'
                : 'Type here or click the microphone button above to speak in English...'
            }
            className={`w-full p-4 rounded-b-2xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-slate-900 placeholder:text-slate-400 text-sm resize-none transition leading-relaxed ${
              isFarsiToEnglish ? 'font-farsi text-base' : 'font-sans'
            } ${isListening ? 'ring-2 ring-rose-500/40 bg-rose-50/20' : ''}`}
          />

          {/* Floating audio mic shortcut right inside textarea */}
          <div className="absolute bottom-3 left-3 sm:left-auto sm:right-3 flex items-center gap-1.5">
            <button
              type="button"
              id="btn-inside-textarea-mic"
              onClick={startVoiceDictation}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs ${
                isListening
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-slate-100 hover:bg-teal-100 text-teal-800 border border-slate-200'
              }`}
              title="Speak voice input / صحبت کردن صوتی"
            >
              <Mic className="w-4 h-4 text-teal-700" />
              <span className="text-[11px] font-farsi hidden sm:inline">صحبت کنید</span>
            </button>

            {text && (
              <button
                type="button"
                id="btn-clear-text"
                onClick={() => setText('')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition border border-slate-200"
                title="Clear input text / پاک کردن متن"
                aria-label="Clear input text / پاک کردن متن"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-1">
          <button
            type="submit"
            id="btn-submit-text-interpret"
            disabled={!text.trim() || isProcessing}
            title="Interpret & Translate / تفسیر و ترجمه"
            aria-label="Interpret & Translate / تفسیر و ترجمه"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md ${
              !text.trim() || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isFarsiToEnglish
                ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20 active:scale-98'
                : 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-indigo-700/20 active:scale-98'
            }`}
          >
            <span>
              {isProcessing
                ? 'در حال ترجمه (Translating...)'
                : isFarsiToEnglish
                ? 'تفسیر و ترجمه به انگلیسی بریتانیایی'
                : 'ترجمه به فارسی و دری (Translate to Farsi & Dari)'}
            </span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

