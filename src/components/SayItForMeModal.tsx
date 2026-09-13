import React, { useState, useRef } from 'react';
import { Volume2, X, Sparkles, Copy, Check, Mic, MicOff } from 'lucide-react';

interface SayItForMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAudio?: (text: string, lang: string) => void;
  initialText?: string;
}

export const SayItForMeModal: React.FC<SayItForMeModalProps> = ({ isOpen, onClose, onPlayAudio, initialText = '' }) => {
  const [inputText, setInputText] = useState(initialText);
  const [tone, setTone] = useState<'natural' | 'polite' | 'professional' | 'simple'>('natural');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{ englishText: string; farsiTranslation: string; phonetic?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  if (!isOpen) return null;

  const toggleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser. Please type or use the Live Interpreter tab.');
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
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
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

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/say-it-for-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, tone }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (onPlayAudio && data.englishText) {
          onPlayAudio(data.englishText, 'en-GB');
        }
      } else {
        setResult({
          englishText: `I would like to say: ${inputText}. Could you please assist me?`,
          farsiTranslation: `من می‌خواهم بگویم: ${inputText}`,
        });
      }
    } catch (e) {
      setResult({
        englishText: inputText,
        farsiTranslation: inputText,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.englishText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-emphasis/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-hamyar border border-edge space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-edge">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-page text-primary">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink text-base">Say It For Me / از زبان من بگو</h3>
              <p className="text-xs text-ink-muted">Speak or type in Farsi/Dari — we speak natural UK English out loud.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-ink-muted hover:text-ink-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selection */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-ink-muted">Select Tone / لحن:</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'natural', label: 'Natural (طبیعی)' },
              { id: 'polite', label: 'Polite (محترمانه)' },
              { id: 'professional', label: 'Professional (رسمی)' },
              { id: 'simple', label: 'Simple (ساده)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  tone === t.id ? 'bg-primary text-white shadow-hamyar' : 'bg-page text-ink-muted hover:bg-page'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area with Mic Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-ink-muted">Type or Speak your message:</label>
            <button
              type="button"
              onClick={toggleVoiceDictation}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                isListening ? 'bg-fault text-white animate-pulse' : 'bg-page text-primary hover:bg-page border border-edge'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListening ? 'شنیدن...' : 'ضبط صوتی (Speak)'}</span>
            </button>
          </div>
          <div className="relative">
            <textarea dir="rtl"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              placeholder="عبارت خود را به فارسی بگوئید یا تایپ کنید..."
              className={`w-full p-3.5 rounded-2xl border border-edge-control text-xs font-farsi focus:ring-2 focus:ring-primary ${
                isListening ? 'ring-2 ring-fault bg-fault-bg' : ''
              }`}
            />
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={!inputText.trim() || isProcessing}
          className="w-full py-3 bg-primary hover:bg-primary text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isProcessing ? 'Generating Speech...' : 'Say This Out Loud '}</span>
        </button>

        {/* Output Card */}
        {result && (
          <div className="p-4 bg-emphasis text-on-emphasis rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-on-emphasis-muted">Say this out loud:</span>
              <div className="flex items-center gap-2">
                {onPlayAudio && (
                  <button
                    onClick={() => onPlayAudio(result.englishText, 'en-GB')}
                    className="px-2.5 py-1 bg-white hover:bg-on-emphasis-muted text-emphasis font-bold rounded-lg text-xs flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Audio</span>
                  </button>
                )}
                <button onClick={handleCopy} className="p-1 text-ink-muted hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-on-emphasis" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-base font-bold text-white leading-relaxed">{result.englishText}</p>
            <p dir="rtl" className="text-base font-farsi text-on-emphasis-muted pt-1 border-t border-white/15">
              {result.farsiTranslation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

