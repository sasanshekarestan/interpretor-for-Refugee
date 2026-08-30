import React, { useState, useRef } from 'react';
import { X, Camera, Upload, FileText, Check, AlertTriangle, Calendar, ArrowRight, Volume2, Sparkles, Copy, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { playSpokenAudio } from '../utils/audioHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** Letters arrive as photos and as PDFs. Both are accepted. */
const ACCEPTED = 'image/*,application/pdf,.pdf';
const MAX_FILE_BYTES = 12 * 1024 * 1024;

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
  /** What was picked: a photo shows itself, a PDF shows its first page. */
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const clearSelection = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setFileName(null);
    setIsPdf(false);
    setPdfPageCount(0);
  };

  /** Draw page one of a PDF, so the person can see they picked the right file. */
  const renderPdfPreview = async (dataUrl: string) => {
    const base64 = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : '';
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    setPdfPageCount(doc.numPages);

    const page = await doc.getPage(1);
    const unscaled = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(2, 520 / unscaled.width) });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, canvasContext: context, viewport }).promise;
    setPreviewUrl(canvas.toDataURL('image/png'));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const image = file.type.startsWith('image/');

    if (!pdf && !image) {
      setError('This file type is not supported. Use a photo or a PDF. | این نوع فایل پشتیبانی نمی‌شود. عکس یا فایل PDF انتخاب کنید.');
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('This file is too large (over 12 MB). Try a photo of the page instead. | این فایل خیلی بزرگ است (بیش از ۱۲ مگابایت). به جای آن از صفحه عکس بگیرید.');
      return;
    }

    setError(null);
    setResult(null);
    setIsPreparing(true);
    clearSelection();

    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });

      setSelectedImage(dataUrl);
      setFileName(file.name);
      setIsPdf(pdf);

      if (pdf) {
        await renderPdfPreview(dataUrl);
      } else {
        setPreviewUrl(dataUrl);
      }
    } catch (_) {
      clearSelection();
      setError('This file could not be opened. Try another file or a photo. | این فایل باز نشد. فایل دیگری انتخاب کنید یا عکس بگیرید.');
    } finally {
      setIsPreparing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !typedText.trim()) {
      setError('Add a photo, a PDF, or type some text from your letter. | یک عکس یا فایل PDF اضافه کنید، یا متن نامه را بنویسید.');
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
        throw new Error(
          'The letter could not be read. Check the photo is clear and try again. | نامه خوانده نشد. مطمئن شوید عکس واضح است و دوباره تلاش کنید.'
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(
        err?.message ||
          'Something went wrong while reading the document. | هنگام خواندن سند مشکلی پیش آمد.'
      );
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
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-5 bg-indigo-50/20 text-center transition">
                {/* Photos and PDFs both, and a camera that is offered rather
                    than forced - `capture` on the only input used to stop
                    people choosing a file they already have. */}
                <input
                  type="file"
                  accept={ACCEPTED}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isPreparing ? (
                  <div className="py-8 space-y-2 text-indigo-800">
                    <Loader2 className="w-7 h-7 mx-auto animate-spin" />
                    <p className="text-xs font-semibold">Opening your file…</p>
                    <p className="text-xs font-farsi" dir="rtl">در حال باز کردن فایل شما…</p>
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt={isPdf ? 'First page of the PDF you chose' : 'The photo of the letter you chose'}
                      className="max-h-56 mx-auto rounded-xl border border-indigo-200 shadow-sm object-contain bg-white"
                    />

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600">
                      {isPdf ? <FileText className="w-3.5 h-3.5 text-indigo-600" /> : <Camera className="w-3.5 h-3.5 text-indigo-600" />}
                      <span className="font-mono truncate max-w-[220px]">{fileName}</span>
                      {isPdf && pdfPageCount > 0 && (
                        <span className="font-semibold">
                          {pdfPageCount} {pdfPageCount === 1 ? 'page' : 'pages'}
                        </span>
                      )}
                    </div>

                    {isPdf && pdfPageCount > 1 && (
                      <p className="text-[11px] text-slate-500 font-farsi" dir="rtl">
                        همه {pdfPageCount} صفحه خوانده می‌شود. اینجا فقط صفحه اول را می‌بینید.
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Change file <span className="font-farsi">| تغییر فایل</span>
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Remove <span className="font-farsi">| حذف</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="space-y-1">
                      <p className="font-bold text-indigo-950 text-sm sm:text-base">
                        Add your letter
                      </p>
                      <p className="text-sm text-indigo-900 font-farsi font-bold" dir="rtl">
                        نامه خود را اضافه کنید
                      </p>
                      <p className="text-xs text-indigo-700 font-farsi" dir="rtl">
                        از نامه عکس بگیرید، یا فایل عکس یا PDF آن را انتخاب کنید.
                      </p>
                      <p className="text-[11px] text-indigo-700/80">
                        Take a photo, or choose an image or PDF file.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 min-h-[52px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>Take a photo</span>
                        <span className="font-farsi font-semibold text-indigo-100">| عکس گرفتن</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 min-h-[52px] px-4 rounded-xl bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-800 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Upload className="w-4 h-4 shrink-0" />
                        <span>Choose a file</span>
                        <span className="font-farsi font-semibold text-indigo-600">| انتخاب فایل</span>
                      </button>
                    </div>

                    {/* bdi keeps the Latin "PDF" from jumping to the wrong
                        end of the Persian phrase */}
                    <p className="text-[11px] text-slate-500">
                      JPG, PNG or PDF · <bdi dir="rtl" className="font-farsi">عکس یا فایل PDF</bdi>
                    </p>
                  </div>
                )}
              </div>

              {/* Or Type Letter Text */}
              <div className="space-y-1.5">
                <label htmlFor="letter-text" className="text-xs font-bold text-slate-700 flex items-center justify-between gap-3">
                  <span>Or type the text from your letter:</span>
                  <span className="font-farsi text-slate-600 font-semibold" dir="rtl">یا متن نامه را اینجا بنویسید</span>
                </label>
                <textarea
                  id="letter-text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="متن نامه را اینجا بنویسید — Dear applicant, your Home Office interview is on 14 October at 10:30am in Croydon…"
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
