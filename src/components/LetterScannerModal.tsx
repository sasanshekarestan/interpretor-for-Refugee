import React, { useState, useRef } from 'react';
import {
  X, Camera, Upload, FileText, Check, AlertTriangle, Calendar, Volume2, Sparkles, Copy,
  Loader2, ClipboardList, Phone, BookOpen, HelpCircle, ChevronDown, RotateCcw,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { LetterAnalysisResult } from '../types';
import { playSpokenAudio } from '../utils/audioHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** Letters arrive as photos and as PDFs. Both are accepted. */
const ACCEPTED = 'image/*,application/pdf,.pdf';
const MAX_FILE_BYTES = 12 * 1024 * 1024;

interface LetterScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** A section that stays folded away until it is wanted. */
const Section: React.FC<{
  icon: React.ReactNode;
  titleFa: string;
  titleEn: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ icon, titleFa, titleEn, count, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-right hover:bg-slate-50 transition cursor-pointer"
        dir="rtl"
      >
        <span className="text-slate-400 shrink-0">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-farsi font-bold text-[14px] text-slate-900">{titleFa}</span>
          <span className="block text-[11.5px] text-slate-500">{titleEn}</span>
        </span>
        {typeof count === 'number' && count > 0 && (
          <span className="shrink-0 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full tabular-nums">
            {count}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-2.5">{children}</div>}
    </section>
  );
};

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

  const startAgain = () => {
    setResult(null);
    setTypedText('');
    setError(null);
    clearSelection();
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
        body: JSON.stringify({ image: selectedImage, text: typedText.trim() || undefined }),
      });

      if (!response.ok) {
        throw new Error(
          'The letter could not be read. Check the photo is clear and try again. | نامه خوانده نشد. مطمئن شوید عکس واضح است و دوباره تلاش کنید.'
        );
      }

      const data: LetterAnalysisResult = await response.json();

      // A reply we cannot read is worse than an honest failure: if nothing
      // came back that explains the letter, say so rather than showing a
      // page of empty boxes.
      if (!data?.whatDoesItSayFa && !data?.whatDoesItSayEn && !data?.whatIsThis) {
        throw new Error(
          'We could not make out what this letter says. Try a clearer photo of the whole page, in good light. | نتوانستیم بفهمیم این نامه چه می‌گوید. لطفاً از کل صفحه در نور خوب عکس واضح‌تری بگیرید.'
        );
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err?.message || 'Something went wrong while reading the document. | هنگام خواندن سند مشکلی پیش آمد.'
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

  const spokenSummary = [result?.whatIsThis, result?.whatDoesItSayFa].filter(Boolean).join('. ');

  const urgencyStyle = (urgency?: string) =>
    urgency === 'high'
      ? 'bg-rose-50 border-rose-200'
      : urgency === 'medium'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-white border-slate-200';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl border-slate-200 sm:border overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-indigo-50/70 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-indigo-950 text-[15px] leading-tight">Understand a Letter</h2>
            <p className="font-farsi font-bold text-indigo-900 text-[14px] leading-tight" dir="rtl">
              فهمیدن یک نامه
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close / بستن"
            className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Input Options */}
          {!result && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-5 bg-indigo-50/20 text-center transition">
                {/* Photos and PDFs both, and a camera that is offered rather
                    than forced - `capture` on the only input used to stop
                    people choosing a file they already have. */}
                <input type="file" accept={ACCEPTED} ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

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
                        <span className="font-semibold">{pdfPageCount} {pdfPageCount === 1 ? 'page' : 'pages'}</span>
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
                      <p className="font-bold text-indigo-950 text-sm sm:text-base">Add your letter</p>
                      <p className="text-sm text-indigo-900 font-farsi font-bold" dir="rtl">نامه خود را اضافه کنید</p>
                      <p className="text-xs text-indigo-700 font-farsi" dir="rtl">
                        از نامه عکس بگیرید، یا فایل عکس یا PDF آن را انتخاب کنید.
                      </p>
                      <p className="text-[11px] text-indigo-700/80">Take a photo, or choose an image or PDF file.</p>
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
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2" role="alert">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
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
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-100" />
                    <span>Reading your letter… | در حال خواندن نامه شما…</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-indigo-200" />
                    <span>Explain This Letter | توضیح و ترجمه نامه</span>
                  </>
                )}
              </button>

              {isAnalyzing && (
                <p className="text-[11px] text-center text-slate-500 font-farsi leading-relaxed" dir="rtl">
                  خواندن یک نامه چند صفحه‌ای ممکن است تا یک دقیقه طول بکشد. لطفاً صفحه را نبندید.
                </p>
              )}
            </div>
          )}

          {/* What the letter says */}
          {result && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-start justify-between gap-3 pb-1">
                <div className="min-w-0 space-y-1">
                  {/* Persian carries the label; the English category sits
                      under it, because the reader may know very little. */}
                  <span
                    dir="rtl"
                    className="inline-block px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 font-farsi font-bold text-[12px]"
                  >
                    {result.letterTypeFa || result.letterType || 'نامه رسمی'}
                  </span>
                  {result.letterTypeFa && result.letterType && (
                    <p className="text-[10.5px] text-slate-500 uppercase tracking-wide">{result.letterType}</p>
                  )}
                  {/* The sender's name is English inside a right-to-left
                      line, so it gets its own row: truncating a mixed line
                      cuts the wrong end and hides the start of the name. */}
                  {result.sender && (
                    <div className="pt-0.5">
                      <p className="font-farsi text-[11.5px] font-bold text-slate-500" dir="rtl">فرستنده</p>
                      <p dir="ltr" className="text-[12.5px] font-semibold text-slate-800 leading-snug break-words">
                        {result.sender}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={startAgain}
                  className="shrink-0 inline-flex items-center gap-1.5 text-[11.5px] text-indigo-700 font-bold hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="font-farsi">نامه جدید</span>
                </button>
              </div>

              {/* 1. What is this letter — Persian leads, English follows */}
              {(result.whatIsThisFa || result.whatIsThis) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <p className="font-farsi text-[12.5px] font-bold text-slate-600" dir="rtl">
                    این نامه چیست؟
                    <span className="font-sans font-semibold text-slate-400 text-[11px]"> · What is this?</span>
                  </p>
                  {result.whatIsThisFa && (
                    <p dir="rtl" className="font-farsi text-[14.5px] text-slate-900 leading-loose">
                      {result.whatIsThisFa}
                    </p>
                  )}
                  {result.whatIsThis && (
                    <p className="text-[12.5px] text-slate-600 leading-relaxed">{result.whatIsThis}</p>
                  )}
                </div>
              )}

              {/* 2. What it says — Persian first, because that is who is reading */}
              {result.whatDoesItSayFa && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-farsi font-bold text-teal-950 text-[13px]">این نامه چه می‌گوید</p>
                    <button
                      onClick={() => playSpokenAudio(spokenSummary, 'fa-IR')}
                      className="shrink-0 px-2.5 py-1.5 bg-white border border-teal-200 rounded-lg text-teal-800 text-[11px] font-bold flex items-center gap-1.5 hover:bg-teal-100/50"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="font-farsi">شنیدن</span>
                    </button>
                  </div>
                  <p dir="rtl" className="font-farsi text-[15px] text-slate-900 leading-loose">
                    {result.whatDoesItSayFa}
                  </p>
                </div>
              )}

              {result.whatDoesItSayEn && (
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">In simple English</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed">{result.whatDoesItSayEn}</p>
                </div>
              )}

              {/* 3. What you must do — the part that has consequences */}
              {result.whatDoINeedToDo?.length > 0 && (
                <div className="space-y-2">
                  <p className="font-farsi font-bold text-[13px] text-slate-900" dir="rtl">
                    کاری که باید انجام دهید
                  </p>
                  {result.whatDoINeedToDo.map((item, i) => (
                    <div key={i} className={`p-3.5 border rounded-2xl space-y-1.5 ${urgencyStyle(item.urgency)}`}>
                      <div className="flex items-start gap-2.5" dir="rtl">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-white border border-slate-300 text-[11px] font-bold text-slate-700 inline-flex items-center justify-center tabular-nums mt-0.5">
                          {i + 1}
                        </span>
                        <p className="font-farsi text-[14px] text-slate-900 leading-relaxed flex-1">{item.fa}</p>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-snug ps-8">{item.en}</p>
                      {item.urgency === 'high' && (
                        <p className="font-farsi text-[11.5px] font-bold text-rose-700 ps-8" dir="rtl">
                          فوری است
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Dates */}
              {result.importantDates?.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-amber-950 text-[12.5px]">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span className="font-farsi">تاریخ‌های مهم</span>
                    <span className="text-amber-800/80 font-semibold text-[11px]">Dates that matter</span>
                  </div>
                  {result.importantDates.map((d, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-amber-200 space-y-1">
                      <span className="font-mono font-bold text-[12px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {d.date}
                      </span>
                      {d.faAction && (
                        <p dir="rtl" className="font-farsi text-[13.5px] text-slate-900 leading-relaxed">{d.faAction}</p>
                      )}
                      {d.action && <p className="text-[12px] text-slate-600 leading-snug">{d.action}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* 5. Everything else, folded away until wanted */}
              {result.importantNamesContact?.length > 0 && (
                <Section icon={<Phone className="w-4 h-4" />} titleFa="شماره‌ها و افراد مهم" titleEn="Who to contact" count={result.importantNamesContact.length}>
                  {result.importantNamesContact.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                      <p className="font-bold text-[13px] text-slate-900">{c.nameOrOrg}</p>
                      {c.roleOrDetail && <p className="text-[12px] text-slate-600">{c.roleOrDetail}</p>}
                      {c.contactInfo && (
                        <p dir="ltr" className="font-mono text-[12.5px] text-slate-900 select-all">{c.contactInfo}</p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {result.ukContextTerms?.length > 0 && (
                <Section icon={<BookOpen className="w-4 h-4" />} titleFa="معنی کلمه‌های انگلیسی این نامه" titleEn="Words in this letter, explained" count={result.ukContextTerms.length}>
                  {result.ukContextTerms.map((t, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <p className="font-mono font-bold text-[12.5px] text-slate-900">{t.term}</p>
                      {t.faExplanation && (
                        <p dir="rtl" className="font-farsi text-[13px] text-slate-800 leading-relaxed">{t.faExplanation}</p>
                      )}
                      {t.simpleEn && <p className="text-[11.5px] text-slate-500 leading-snug">{t.simpleEn}</p>}
                    </div>
                  ))}
                </Section>
              )}

              {result.questionsToAsk?.length > 0 && (
                <Section icon={<HelpCircle className="w-4 h-4" />} titleFa="سوال‌هایی که می‌توانید بپرسید" titleEn="Questions to ask your caseworker or solicitor" count={result.questionsToAsk.length}>
                  {result.questionsToAsk.map((q, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <p dir="rtl" className="font-farsi text-[13.5px] text-slate-900 leading-relaxed">{q.questionFa}</p>
                      <p className="text-[12px] text-slate-600 select-all">{q.questionEn}</p>
                    </div>
                  ))}
                </Section>
              )}

              {result.timelineSteps?.length > 0 && (
                <Section icon={<ClipboardList className="w-4 h-4" />} titleFa="مرحله‌های بعدی" titleEn="What happens next" count={result.timelineSteps.length}>
                  {result.timelineSteps.map((s, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1" dir="rtl">
                      <p className="font-farsi font-bold text-[13px] text-slate-900">
                        {s.step ?? i + 1}. {s.titleFa}
                      </p>
                      {s.descriptionFa && (
                        <p className="font-farsi text-[12.5px] text-slate-700 leading-relaxed">{s.descriptionFa}</p>
                      )}
                      {s.titleEn && <p dir="ltr" className="text-[11.5px] text-slate-500">{s.titleEn}</p>}
                    </div>
                  ))}
                </Section>
              )}

              {/* 6. A reply they can send */}
              {result.suggestedResponseEn && (
                <Section icon={<Copy className="w-4 h-4" />} titleFa="پیش‌نویس پاسخ به انگلیسی" titleEn="A reply you can send">
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] text-slate-800 leading-relaxed select-all">
                    {result.suggestedResponseEn}
                  </p>
                  <button
                    onClick={handleCopyReply}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResponse ? 'Copied' : 'Copy this reply'}</span>
                    <span className="font-farsi">{copiedResponse ? '| کپی شد' : '| کپی کردن'}</span>
                  </button>
                  {result.suggestedResponseFa && (
                    <p dir="rtl" className="font-farsi text-[12px] text-slate-600 leading-relaxed">
                      ترجمه: {result.suggestedResponseFa}
                    </p>
                  )}
                </Section>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                {result.legalNotice ||
                  'This application provides translation and general guidance. It is not a solicitor and does not replace professional legal advice.'}
              </p>
              <p dir="rtl" className="font-farsi text-[11.5px] text-slate-500 leading-relaxed">
                این توضیح ترجمه و راهنمای عمومی است و جایگزین مشاوره حقوقی نیست. متن اصلی نامه همیشه مرجع است.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
