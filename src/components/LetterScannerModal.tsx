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

/**
 * The letter reader.
 *
 * Brought onto the design system in September 2026. Before that this one file
 * held 74 off-system colours and eighteen type sizes below the 14px floor, one
 * of them 10.5px, on the screen where a frightened person reads what the Home
 * Office has just told them. It also put English first in its own header and
 * joined the two languages on one line with a pipe, in the buttons and in
 * every error message, which design.md bans outright: two reading directions
 * meet in the middle and neither language gets a clean start.
 *
 * Nothing about what this screen does has changed. Only what it looks like,
 * what size it is, and which language leads.
 */

/** Letters arrive as photos and as PDFs. Both are accepted. */
const ACCEPTED = 'image/*,application/pdf,.pdf';
const MAX_FILE_BYTES = 12 * 1024 * 1024;

/**
 * Anything said to a person, said twice.
 *
 * These used to be single strings with " | " in the middle, which meant every
 * failure rendered as one line running left to right and then right to left.
 * Keeping them apart is what lets each language have its own block, its own
 * direction and its own size.
 */
interface Bilingual {
  fa: string;
  en: string;
}

/** An error that already knows how to say itself in both languages. */
class BilingualError extends Error {
  readonly bilingual: Bilingual;
  constructor(bilingual: Bilingual) {
    super(bilingual.en);
    this.bilingual = bilingual;
  }
}

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
    <section className="border border-edge rounded-2xl overflow-hidden bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-[52px] flex items-center gap-3 px-4 py-3 text-right hover:bg-page transition cursor-pointer"
        dir="rtl"
      >
        <span className="text-ink-muted shrink-0">{icon}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-farsi font-bold text-base text-ink leading-snug">{titleFa}</span>
          <span dir="ltr" className="block font-latin text-sm text-ink-muted leading-snug">
            {titleEn}
          </span>
        </span>
        {typeof count === 'number' && count > 0 && (
          <span className="shrink-0 text-sm font-bold text-ink-muted bg-page border border-edge px-2.5 py-0.5 rounded-full tabular-nums">
            {count}
          </span>
        )}
        <ChevronDown
          className={`w-5 h-5 text-ink-muted shrink-0 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
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
  const [error, setError] = useState<Bilingual | null>(null);
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
      setError({
        fa: 'این نوع فایل پشتیبانی نمی‌شود. یک عکس یا فایل PDF انتخاب کنید.',
        en: 'This file type is not supported. Use a photo or a PDF.',
      });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError({
        fa: 'این فایل خیلی بزرگ است (بیش از ۱۲ مگابایت). به جای آن از صفحه عکس بگیرید.',
        en: 'This file is too large (over 12 MB). Try a photo of the page instead.',
      });
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
      setError({
        fa: 'این فایل باز نشد. فایل دیگری انتخاب کنید یا عکس بگیرید.',
        en: 'This file could not be opened. Try another file or a photo.',
      });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !typedText.trim()) {
      setError({
        fa: 'یک عکس یا فایل PDF اضافه کنید، یا متن نامه را بنویسید.',
        en: 'Add a photo, a PDF, or type some text from your letter.',
      });
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
        // Telling someone to retake the photo when the service itself is down
        // sends them round in circles with a camera. The server says which it
        // is, so say the true thing.
        const failure = await response.json().catch(() => ({}));
        if (failure?.kind === 'quota' || failure?.kind === 'no_key') {
          throw new BilingualError({
            fa: 'در حال حاضر نمی‌توانیم به سرویس خواندن نامه وصل شویم. این ایراد از برنامه است، نه از عکس شما. لطفاً بعداً دوباره سر بزنید.',
            en: 'We cannot reach the reading service at the moment. This is a problem with the app, not with your photo. Please try again later.',
          });
        }
        if (failure?.kind === 'rate_limit') {
          throw new BilingualError({
            fa: 'سرویس الان شلوغ است. یک دقیقه صبر کنید و دوباره تلاش کنید.',
            en: 'The service is busy right now. Wait a minute and try again.',
          });
        }
        if (failure?.kind === 'timeout') {
          throw new BilingualError({
            fa: 'پاسخ خیلی طول کشید. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
            en: 'That took too long. Check your connection and try again.',
          });
        }
        throw new BilingualError({
          fa: 'نامه خوانده نشد. مطمئن شوید عکس واضح است و دوباره تلاش کنید.',
          en: 'The letter could not be read. Check the photo is clear and try again.',
        });
      }

      const data: LetterAnalysisResult = await response.json();

      // A reply we cannot read is worse than an honest failure: if nothing
      // came back that explains the letter, say so rather than showing a
      // page of empty boxes.
      if (!data?.whatDoesItSayFa && !data?.whatDoesItSayEn && !data?.whatIsThis) {
        throw new BilingualError({
          fa: 'نتوانستیم بفهمیم این نامه چه می‌گوید. لطفاً از کل صفحه در نور خوب عکس واضح‌تری بگیرید.',
          en: 'We could not make out what this letter says. Try a clearer photo of the whole page, in good light.',
        });
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err instanceof BilingualError
          ? err.bilingual
          : {
              fa: 'هنگام خواندن سند مشکلی پیش آمد.',
              en: 'Something went wrong while reading the document.',
            }
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

  // Urgency never rides on colour alone: high also carries the words "فوری است"
  // and every item carries its number.
  const urgencyStyle = (urgency?: string) =>
    urgency === 'high'
      ? 'bg-fault-bg border-fault'
      : urgency === 'medium'
      ? 'bg-attention-bg border-attention'
      : 'bg-surface border-edge';

  const isIdle = !isAnalyzing && (!!selectedImage || !!typedText.trim());

  return (
    <div className="fixed inset-0 z-50 bg-emphasis/70 backdrop-blur-sm flex items-stretch sm:items-center justify-center sm:p-4">
      <div className="bg-page w-full sm:max-w-2xl sm:rounded-2xl shadow-hamyar border-edge sm:border overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
        {/* The one emphasis block on this screen, and Persian leads it. The
            header used to read "Understand a Letter" with the Persian under
            it in smaller type, on a screen built for people who read Persian
            and little English. */}
        <div className="px-4 py-3.5 bg-emphasis text-on-emphasis flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-surface/15 border border-white/20 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 dir="rtl" className="font-farsi font-bold text-xl leading-tight">
              فهمیدن یک نامه
            </h2>
            <p dir="ltr" className="font-latin text-sm text-on-emphasis-muted leading-tight">
              Understand a letter
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن / Close"
            className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl
                       text-on-emphasis hover:bg-surface/15 transition"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!result && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-edge-control rounded-2xl p-5 bg-surface text-center transition">
                {/* Photos and PDFs both, and a camera that is offered rather
                    than forced - `capture` on the only input used to stop
                    people choosing a file they already have. */}
                <input type="file" accept={ACCEPTED} ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

                {isPreparing ? (
                  <div className="py-8 space-y-2 text-ink">
                    <Loader2 className="w-7 h-7 mx-auto animate-spin text-primary" aria-hidden="true" />
                    <p dir="rtl" className="font-farsi text-lg leading-relaxed">در حال باز کردن فایل شما…</p>
                    <p dir="ltr" className="font-latin text-sm text-ink-muted">Opening your file</p>
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt={isPdf ? 'First page of the PDF you chose' : 'The photo of the letter you chose'}
                      className="max-h-56 mx-auto rounded-xl border border-edge shadow-hamyar object-contain bg-surface"
                    />

                    <div className="flex items-center justify-center gap-2 text-sm text-ink-muted">
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      ) : (
                        <Camera className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                      )}
                      <bdi dir="ltr" className="font-latin truncate max-w-[220px]">{fileName}</bdi>
                      {isPdf && pdfPageCount > 0 && (
                        <span dir="ltr" className="font-latin font-bold tabular-nums">
                          {pdfPageCount} {pdfPageCount === 1 ? 'page' : 'pages'}
                        </span>
                      )}
                    </div>

                    {isPdf && pdfPageCount > 1 && (
                      <p dir="rtl" className="font-farsi text-base text-ink-muted leading-relaxed">
                        همه {pdfPageCount} صفحه خوانده می‌شود. اینجا فقط صفحه اول را می‌بینید.
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="min-h-[44px] px-4 bg-surface border border-edge-control rounded-xl
                                   text-ink hover:bg-page transition cursor-pointer"
                      >
                        <span className="font-farsi font-bold text-base block leading-tight">تغییر فایل</span>
                        <span dir="ltr" className="font-latin text-sm text-ink-muted block leading-tight">
                          Change file
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="min-h-[44px] px-4 bg-fault-bg border border-fault rounded-xl
                                   text-fault hover:opacity-90 transition cursor-pointer"
                      >
                        <span className="font-farsi font-bold text-base block leading-tight">حذف</span>
                        <span dir="ltr" className="font-latin text-sm block leading-tight">Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-2">
                    <div dir="rtl" className="space-y-1.5">
                      <p className="font-farsi font-bold text-ink text-lg leading-snug">
                        نامه خود را اضافه کنید
                      </p>
                      <p className="font-farsi text-base text-ink-muted leading-relaxed">
                        از نامه عکس بگیرید، یا فایل عکس یا PDF آن را انتخاب کنید.
                      </p>
                    </div>
                    <div dir="ltr" className="font-latin space-y-0.5 border-t border-edge pt-3">
                      <p className="font-bold text-ink text-base">Add your letter</p>
                      <p className="text-sm text-ink-muted">Take a photo, or choose an image or PDF file.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 min-h-[52px] px-4 rounded-xl bg-primary hover:bg-primary-press
                                   text-on-primary flex flex-col items-center justify-center
                                   shadow-hamyar transition cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span className="font-farsi font-bold text-base leading-tight">عکس گرفتن</span>
                        </span>
                        <span dir="ltr" className="font-latin text-sm opacity-80 leading-tight">
                          Take a photo
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 min-h-[52px] px-4 rounded-xl bg-surface border border-edge-control
                                   text-ink hover:bg-page flex flex-col items-center justify-center
                                   transition cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span className="font-farsi font-bold text-base leading-tight">انتخاب فایل</span>
                        </span>
                        <span dir="ltr" className="font-latin text-sm text-ink-muted leading-tight">
                          Choose a file
                        </span>
                      </button>
                    </div>

                    {/* bdi keeps the Latin "PDF" from jumping to the wrong
                        end of the Persian phrase */}
                    <p dir="rtl" className="font-farsi text-sm text-ink-muted">
                      <bdi>عکس یا فایل PDF</bdi>
                    </p>
                  </div>
                )}
              </div>

              {/* Or type the letter out */}
              <div className="space-y-1.5">
                <label htmlFor="letter-text" className="block space-y-0.5">
                  <span dir="rtl" className="block font-farsi font-bold text-base text-ink">
                    یا متن نامه را اینجا بنویسید
                  </span>
                  <span dir="ltr" className="block font-latin text-sm text-ink-muted">
                    Or type the text from your letter
                  </span>
                </label>
                <textarea
                  id="letter-text"
                  dir="rtl"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="متن نامه را اینجا بنویسید…"
                  rows={3}
                  className="w-full p-3 bg-surface border border-edge-control rounded-xl font-farsi
                             text-base text-ink placeholder:text-ink-muted
                             focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {error && (
                <div
                  className="p-3.5 bg-fault-bg border-s-4 border-fault rounded-xl space-y-1.5"
                  role="alert"
                >
                  <div dir="rtl" className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-fault mt-0.5" aria-hidden="true" />
                    <p className="font-farsi text-base text-ink leading-relaxed flex-1">{error.fa}</p>
                  </div>
                  <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">
                    {error.en}
                  </p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!isIdle}
                className={`w-full min-h-[56px] rounded-xl flex flex-col items-center justify-center
                            transition ${
                              isIdle
                                ? 'bg-primary hover:bg-primary-press text-on-primary shadow-hamyar cursor-pointer'
                                : 'bg-page border border-edge text-ink-muted cursor-not-allowed'
                            }`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span className="font-farsi font-bold text-base leading-tight">
                        در حال خواندن نامه شما…
                      </span>
                    </span>
                    <span dir="ltr" className="font-latin text-sm opacity-80 leading-tight">
                      Reading your letter
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="w-5 h-5" aria-hidden="true" />
                      <span className="font-farsi font-bold text-base leading-tight">
                        توضیح و ترجمه نامه
                      </span>
                    </span>
                    <span dir="ltr" className="font-latin text-sm opacity-80 leading-tight">
                      Explain this letter
                    </span>
                  </>
                )}
              </button>

              {isAnalyzing && (
                <p dir="rtl" className="font-farsi text-base text-center text-ink-muted leading-relaxed">
                  خواندن یک نامه چند صفحه‌ای ممکن است تا یک دقیقه طول بکشد. لطفاً صفحه را نبندید.
                </p>
              )}
            </div>
          )}

          {/* What the letter says */}
          {result && (
            <div className="space-y-3.5 animate-fade-in">
              {/* Right to left, so the letter's own name starts where a
                  Persian reader's eye starts and "new letter" sits out of the
                  way on the far side. */}
              <div dir="rtl" className="flex items-start justify-between gap-3 pb-1">
                <div className="min-w-0 space-y-1">
                  {/* Persian carries the label; the English category sits
                      under it, because the reader may know very little. */}
                  <span
                    dir="rtl"
                    className="inline-block px-3 py-1 rounded-full bg-primary text-on-primary
                               font-farsi font-bold text-base"
                  >
                    {result.letterTypeFa || result.letterType || 'نامه رسمی'}
                  </span>
                  {result.letterTypeFa && result.letterType && (
                    <p dir="ltr" className="font-latin text-sm text-ink-muted">{result.letterType}</p>
                  )}
                  {/* The sender's name is English inside a right-to-left
                      line, so it gets its own row: truncating a mixed line
                      cuts the wrong end and hides the start of the name. */}
                  {result.sender && (
                    <div className="pt-0.5">
                      <p dir="rtl" className="font-farsi text-base font-bold text-ink-muted">فرستنده</p>
                      <p dir="ltr" className="font-latin text-base font-bold text-ink leading-snug break-words">
                        <bdi>{result.sender}</bdi>
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={startAgain}
                  className="shrink-0 min-h-[44px] px-3 inline-flex flex-col items-center justify-center
                             text-primary hover:bg-page rounded-xl transition cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span className="font-farsi font-bold text-base leading-tight">نامه جدید</span>
                  </span>
                  <span dir="ltr" className="font-latin text-sm leading-tight">New letter</span>
                </button>
              </div>

              {/* 1. What is this letter */}
              {(result.whatIsThisFa || result.whatIsThis) && (
                <div className="p-4 bg-surface border border-edge rounded-2xl space-y-2">
                  <p dir="rtl" className="font-farsi text-base font-bold text-ink-muted">
                    این نامه چیست؟
                  </p>
                  {result.whatIsThisFa && (
                    <p dir="rtl" className="font-farsi text-lg text-ink leading-[1.9]">
                      {result.whatIsThisFa}
                    </p>
                  )}
                  {result.whatIsThis && (
                    <div dir="ltr" className="font-latin border-t border-edge pt-2.5 space-y-0.5">
                      <p className="text-sm font-bold text-ink-muted">What is this?</p>
                      <p className="text-base text-ink-muted leading-relaxed">{result.whatIsThis}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. What it says - Persian first, because that is who is reading */}
              {result.whatDoesItSayFa && (
                <div className="p-4 bg-surface border-s-4 border-primary rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between gap-2" dir="rtl">
                    <p className="font-farsi font-bold text-ink text-lg">این نامه چه می‌گوید</p>
                    <button
                      onClick={() => playSpokenAudio(spokenSummary, 'fa-IR')}
                      aria-label="شنیدن / Listen"
                      className="shrink-0 min-h-[44px] px-3 bg-surface border border-edge-control rounded-xl
                                 text-primary inline-flex items-center gap-1.5 hover:bg-page
                                 transition cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span className="font-farsi font-bold text-base">شنیدن</span>
                    </button>
                  </div>
                  <p dir="rtl" className="font-farsi text-lg text-ink leading-[1.9]">
                    {result.whatDoesItSayFa}
                  </p>
                </div>
              )}

              {result.whatDoesItSayEn && (
                <div dir="ltr" className="font-latin p-4 bg-surface border border-edge rounded-2xl space-y-1">
                  <p className="text-sm font-bold text-ink-muted">In simple English</p>
                  <p className="text-base text-ink leading-relaxed">{result.whatDoesItSayEn}</p>
                </div>
              )}

              {/* 3. What you must do - the part that has consequences */}
              {result.whatDoINeedToDo?.length > 0 && (
                <div className="space-y-2">
                  <p dir="rtl" className="font-farsi font-bold text-lg text-ink">
                    کاری که باید انجام دهید
                  </p>
                  {result.whatDoINeedToDo.map((item, i) => (
                    <div key={i} className={`p-3.5 border rounded-2xl space-y-1.5 ${urgencyStyle(item.urgency)}`}>
                      <div className="flex items-start gap-2.5" dir="rtl">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-surface border border-edge-control
                                         text-sm font-bold text-ink inline-flex items-center justify-center
                                         tabular-nums mt-0.5">
                          {i + 1}
                        </span>
                        <p className="font-farsi text-lg text-ink leading-[1.9] flex-1">{item.fa}</p>
                      </div>
                      <p dir="ltr" className="font-latin text-base text-ink-muted leading-relaxed ps-8">
                        {item.en}
                      </p>
                      {item.urgency === 'high' && (
                        <p dir="rtl" className="font-farsi text-base font-bold text-fault ps-8">
                          فوری است
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Dates */}
              {result.importantDates?.length > 0 && (
                <div className="p-4 bg-attention-bg border-s-4 border-attention rounded-2xl space-y-2.5">
                  <div dir="rtl" className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-attention shrink-0" aria-hidden="true" />
                      <p className="font-farsi font-bold text-attention text-lg">تاریخ‌های مهم</p>
                    </div>
                    <p dir="ltr" className="font-latin text-sm text-ink-muted ps-7">Dates that matter</p>
                  </div>
                  {result.importantDates.map((d, i) => (
                    <div key={i} className="bg-surface p-3 rounded-xl border border-edge space-y-1">
                      <span dir="ltr" className="inline-block font-latin font-bold text-base text-ink
                                                 bg-page border border-edge px-2.5 py-0.5 rounded tabular-nums">
                        <bdi>{d.date}</bdi>
                      </span>
                      {d.faAction && (
                        <p dir="rtl" className="font-farsi text-lg text-ink leading-[1.9]">{d.faAction}</p>
                      )}
                      {d.action && (
                        <p dir="ltr" className="font-latin text-base text-ink-muted leading-relaxed">{d.action}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 5. Everything else, folded away until wanted */}
              {result.importantNamesContact?.length > 0 && (
                <Section icon={<Phone className="w-5 h-5" />} titleFa="شماره‌ها و افراد مهم" titleEn="Who to contact" count={result.importantNamesContact.length}>
                  {result.importantNamesContact.map((c, i) => (
                    <div key={i} className="p-3 bg-surface border border-edge rounded-xl space-y-0.5">
                      <p dir="ltr" className="font-latin font-bold text-base text-ink">
                        <bdi>{c.nameOrOrg}</bdi>
                      </p>
                      {c.roleOrDetail && (
                        <p dir="ltr" className="font-latin text-sm text-ink-muted">{c.roleOrDetail}</p>
                      )}
                      {c.contactInfo && (
                        <p dir="ltr" className="font-latin text-base text-ink select-all">
                          <bdi>{c.contactInfo}</bdi>
                        </p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {result.ukContextTerms?.length > 0 && (
                <Section icon={<BookOpen className="w-5 h-5" />} titleFa="معنی کلمه‌های انگلیسی این نامه" titleEn="Words in this letter, explained" count={result.ukContextTerms.length}>
                  {result.ukContextTerms.map((t, i) => (
                    <div key={i} className="p-3 bg-surface border border-edge rounded-xl space-y-1">
                      <p dir="ltr" className="font-latin font-bold text-base text-ink">
                        <bdi>{t.term}</bdi>
                      </p>
                      {t.faExplanation && (
                        <p dir="rtl" className="font-farsi text-lg text-ink leading-[1.9]">{t.faExplanation}</p>
                      )}
                      {t.simpleEn && (
                        <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">{t.simpleEn}</p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {result.questionsToAsk?.length > 0 && (
                <Section icon={<HelpCircle className="w-5 h-5" />} titleFa="سوال‌هایی که می‌توانید بپرسید" titleEn="Questions to ask your caseworker or solicitor" count={result.questionsToAsk.length}>
                  {result.questionsToAsk.map((q, i) => (
                    <div key={i} className="p-3 bg-surface border border-edge rounded-xl space-y-1">
                      <p dir="rtl" className="font-farsi text-lg text-ink leading-[1.9]">{q.questionFa}</p>
                      <p dir="ltr" className="font-latin text-base text-ink-muted select-all leading-relaxed">
                        {q.questionEn}
                      </p>
                    </div>
                  ))}
                </Section>
              )}

              {result.timelineSteps?.length > 0 && (
                <Section icon={<ClipboardList className="w-5 h-5" />} titleFa="مرحله‌های بعدی" titleEn="What happens next" count={result.timelineSteps.length}>
                  {result.timelineSteps.map((s, i) => (
                    <div key={i} className="p-3 bg-surface border border-edge rounded-xl space-y-1" dir="rtl">
                      <p className="font-farsi font-bold text-base text-ink leading-snug">
                        {s.step ?? i + 1}. {s.titleFa}
                      </p>
                      {s.descriptionFa && (
                        <p className="font-farsi text-lg text-ink-muted leading-[1.9]">{s.descriptionFa}</p>
                      )}
                      {s.titleEn && (
                        <p dir="ltr" className="font-latin text-sm text-ink-muted">{s.titleEn}</p>
                      )}
                    </div>
                  ))}
                </Section>
              )}

              {/* 6. A reply they can send */}
              {result.suggestedResponseEn && (
                <Section icon={<Copy className="w-5 h-5" />} titleFa="پیش‌نویس پاسخ به انگلیسی" titleEn="A reply you can send">
                  <p dir="ltr" className="font-latin p-3 bg-surface border border-edge rounded-xl
                                          text-base text-ink leading-relaxed select-all">
                    {result.suggestedResponseEn}
                  </p>
                  <button
                    onClick={handleCopyReply}
                    className="w-full min-h-[48px] inline-flex flex-col items-center justify-center px-3
                               bg-primary hover:bg-primary-press text-on-primary rounded-xl
                               transition cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {copiedResponse ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span className="font-farsi font-bold text-base leading-tight">
                        {copiedResponse ? 'کپی شد' : 'کپی کردن'}
                      </span>
                    </span>
                    <span dir="ltr" className="font-latin text-sm opacity-80 leading-tight">
                      {copiedResponse ? 'Copied' : 'Copy this reply'}
                    </span>
                  </button>
                  {result.suggestedResponseFa && (
                    <p dir="rtl" className="font-farsi text-base text-ink-muted leading-relaxed">
                      ترجمه: {result.suggestedResponseFa}
                    </p>
                  )}
                </Section>
              )}

              <div className="pt-1 space-y-1.5">
                <p dir="rtl" className="font-farsi text-base text-ink-muted leading-relaxed">
                  این توضیح ترجمه و راهنمای عمومی است و جایگزین مشاوره حقوقی نیست. متن اصلی نامه همیشه
                  مرجع است.
                </p>
                <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">
                  {result.legalNotice ||
                    'This application provides translation and general guidance. It is not a solicitor and does not replace professional legal advice.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
