import React, { useState, useRef } from 'react';
import { X, Camera, Upload, FileText, Check, AlertTriangle, Calendar, ArrowRight, Volume2, Sparkles, Copy } from 'lucide-react';
import { playSpokenAudio } from '../utils/audioHelper';

interface LetterAnalysisResult {
  id: string;
  letterType?: string;
  sender?: string;
  englishSummary: string;
  farsiSummary: string;
  keyDeadlines?: Array<{ date: string; action: string; farsiAction?: string }>;
  keyReferenceNumbers?: string[];
  suggestedResponseEn: string;
  suggestedResponseFa?: string;
}

interface LetterScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LetterScannerModal: React.FC<LetterScannerModalProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [typedText, setTypedText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<LetterAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !typedText.trim()) {
      setError('Please take a photo, upload an image, or type text from your letter.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/interpret/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          text: typedText.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze letter. Please check image quality and try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while reading the document.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyReply = () => {
    if (result?.suggestedResponseEn) {
      navigator.clipboard.writeText(result.suggestedResponseEn);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const handleSpeakFarsi = () => {
    if (result?.farsiSummary) {
      playSpokenAudio(result.farsiSummary, 'fa-IR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-indigo-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-indigo-950 text-base sm:text-lg flex items-center gap-1.5">
                <span>Understand a Letter</span>
                <span className="font-farsi font-semibold text-indigo-800">| فهمیدن یک نامه</span>
              </h2>
              <p className="text-xs text-indigo-700/90 font-farsi">
                عکس نامه هوم آفیس، بیمارستان یا وکیل را بگیرید تا به فارسی توضیح دهیم.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Input Options */}
          {!result && (
            <div className="space-y-4">
              {/* Photo Upload Box */}
              <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-6 bg-indigo-50/20 text-center transition">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedImage ? (
                  <div className="space-y-3">
                    <img
                      src={selectedImage}
                      alt="Letter scan preview"
                      className="max-h-56 mx-auto rounded-xl border border-indigo-200 shadow-sm object-contain"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Change Photo / تغییر عکس
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Remove / حذف
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer space-y-3 py-4"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-950 text-sm sm:text-base">
                        Take a photo or upload letter scan
                      </p>
                      <p className="text-xs text-indigo-700 font-farsi mt-1">
                        عکس نامه را بگیرید یا فایل آن را از گوشی انتخاب کنید
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Or Type Letter Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Or paste / type key text from the letter:</span>
                  <span className="font-farsi text-slate-500 font-normal">یا متن نامه را وارد کنید</span>
                </label>
                <textarea
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="e.g. Dear applicant, your Home Office interview is scheduled on 14th October at 10:30 AM at Croydon..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!selectedImage && !typedText.trim())}
                className={`w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition ${
                  isAnalyzing || (!selectedImage && !typedText.trim())
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin text-indigo-200" />
                    <span>Analyzing Letter... | در حال تحلیل و ترجمه نامه...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <span>Explain This Letter | توضیح و ترجمه نامه</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Analysis Results Display */}
          {result && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs uppercase tracking-wide">
                    {result.letterType || 'Official Letter'}
                  </span>
                  {result.sender && (
                    <span className="text-xs font-semibold text-slate-600 ml-2">From: {result.sender}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setResult(null);
                    setSelectedImage(null);
                    setTypedText('');
                  }}
                  className="text-xs text-indigo-700 font-semibold hover:underline"
                >
                  Analyze another letter / نامه جدید
                </button>
              </div>

              {/* Farsi Explanation Box */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-950 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span className="font-farsi">توضیح نامه به زبان فارسی (Farsi Summary):</span>
                  </div>
                  <button
                    onClick={handleSpeakFarsi}
                    className="p-1.5 bg-white border border-teal-200 rounded-lg text-teal-800 text-xs font-semibold flex items-center gap-1 hover:bg-teal-100/50"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>پخش صوتی</span>
                  </button>
                </div>
                <p dir="rtl" className="font-farsi text-sm text-slate-900 leading-relaxed font-medium">
                  {result.farsiSummary}
                </p>
              </div>

              {/* English Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">English Letter Overview:</div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{result.englishSummary}</p>
              </div>

              {/* Key Deadlines & References */}
              {result.keyDeadlines && result.keyDeadlines.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wide">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span>Important Deadlines / Appointments (مهلت‌ها و قرارهای مهم):</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.keyDeadlines.map((dl, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-white p-2.5 rounded-xl border border-amber-200">
                        <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{dl.date}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{dl.action}</p>
                          {dl.farsiAction && <p dir="rtl" className="font-farsi text-slate-600 mt-0.5">{dl.farsiAction}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Reply Draft */}
              {result.suggestedResponseEn && (
                <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs sm:text-sm text-indigo-950">
                      Suggested English Reply / پیش‌نویس پاسخ به انگلیسی:
                    </div>
                    <button
                      onClick={handleCopyReply}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedResponse ? 'Copied Reply' : 'Copy Reply'}</span>
                    </button>
                  </div>
                  <p className="p-3 bg-white border border-indigo-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
                    {result.suggestedResponseEn}
                  </p>
                  {result.suggestedResponseFa && (
                    <p dir="rtl" className="font-farsi text-xs text-indigo-900 leading-relaxed">
                      ترجمه پاسخ: {result.suggestedResponseFa}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
