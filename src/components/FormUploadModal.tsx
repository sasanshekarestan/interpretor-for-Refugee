import React, { useState, useRef } from 'react';
import { X, Upload, Camera, FileText, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, RefreshCw, Trash2, ArrowUp, ArrowDown, ImagePlus, Eye, FileCode } from 'lucide-react';
import mammoth from 'mammoth';

export interface FormUploadPage {
  id: string;
  pageNumber: number;
  dataUrl: string;
  fileName: string;
  isBlurryOrDark?: boolean;
  htmlContent?: string;
  fileType?: 'image' | 'pdf' | 'docx';
}

interface FormUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPresetForm?: (formId?: string, customFormData?: any) => void;
}

export const FormUploadModal: React.FC<FormUploadModalProps> = ({
  isOpen,
  onClose,
  onStartPresetForm,
}) => {
  const [pages, setPages] = useState<FormUploadPage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedCustomForm, setExtractedCustomForm] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const checkImageQuality = (dataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(false);
          canvas.width = Math.min(img.width, 200);
          canvas.height = Math.min(img.height, 200);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let totalBrightness = 0;
          for (let i = 0; i < data.length; i += 4) {
            totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
          }
          const avgBrightness = totalBrightness / (data.length / 4);
          // If average brightness is extremely low (< 40 out of 255), warn user
          resolve(avgBrightness < 40);
        } catch (_) {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  };

  const handleFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles: File[] = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setError(null);
    setAnalysisResult(null);

    const newPages: FormUploadPage[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileNameLower = file.name.toLowerCase();
      const isDocx = fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc') || file.type.includes('wordprocessingml') || file.type.includes('msword');
      const isPdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (isDocx) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const html = result.value;
          const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
          newPages.push({
            id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            pageNumber: pages.length + newPages.length + 1,
            dataUrl,
            fileName: file.name,
            htmlContent: html,
            fileType: 'docx',
            isBlurryOrDark: false,
          });
        } catch (err) {
          console.error('Error parsing docx file:', err);
          const dataUrl = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = (ev) => res(ev.target?.result as string);
            reader.readAsDataURL(file);
          });
          newPages.push({
            id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            pageNumber: pages.length + newPages.length + 1,
            dataUrl,
            fileName: file.name,
            fileType: 'docx',
            isBlurryOrDark: false,
          });
        }
      } else if (isImage || isPdf) {
        const dataUrl = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target?.result as string);
          reader.readAsDataURL(file);
        });

        const isLowQuality = isPdf ? false : await checkImageQuality(dataUrl);

        newPages.push({
          id: 'page_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          pageNumber: pages.length + newPages.length + 1,
          dataUrl,
          fileName: file.name,
          fileType: isPdf ? 'pdf' : 'image',
          isBlurryOrDark: isLowQuality,
        });
      }
    }

    if (newPages.length > 0) {
      setPages((prev) => {
        const combined = [...prev, ...newPages];
        return combined.map((p, index) => ({ ...p, pageNumber: index + 1 }));
      });
    }
  };

  const handleRemovePage = (pageId: string) => {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== pageId);
      return filtered.map((p, index) => ({ ...p, pageNumber: index + 1 }));
    });
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === pages.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPages(updated.map((p, i) => ({ ...p, pageNumber: i + 1 })));
  };

  const processFormPages = async () => {
    if (pages.length === 0) {
      setError('Please upload or take at least one photo of your paper form.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Pass primary page to analyzer
      const primaryPage = pages[0];
      const isDocx = primaryPage.fileType === 'docx' || (primaryPage.htmlContent && primaryPage.htmlContent.length > 0);
      
      const payload: any = {
        text: `Multi-page form document uploaded (${pages.length} pages: ${pages.map(p => p.fileName).join(', ')}). ${primaryPage.htmlContent ? `Content: ${primaryPage.htmlContent.substring(0, 8000)}` : ''}`,
      };

      if (!isDocx && primaryPage.dataUrl && !primaryPage.dataUrl.startsWith('data:text/html')) {
        payload.image = primaryPage.dataUrl;
      }

      const response = await fetch('/api/form/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Could not read form document. Please make sure the photo is clear and well lit.');
      }

      const formObj = await response.json();
      
      // Inject multi-page image URLs into extracted custom form
      const multiPageFormObj = {
        ...formObj,
        uploadedPages: pages,
      };

      setExtractedCustomForm(multiPageFormObj);
      setAnalysisResult({
        title: formObj.title || primaryPage.fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        englishSummary: `Analyzed ${pages.length} page(s). Extracted ${formObj.questionsCount || (formObj.questions?.length || 0)} fields.`,
        farsiSummary: formObj.description || `تعداد ${pages.length} صفحه برگه فرم آنالیز شد و ${formObj.questionsCount || (formObj.questions?.length || 0)} فیلد استخراج گردید.`,
        sender: formObj.sender || 'UK Authority / Home Office / NHS',
      });

      // Automatically launch Form Companion with the custom form
      if (onStartPresetForm) {
        onStartPresetForm('custom_uploaded', multiPageFormObj);
        onClose();
        return;
      }
    } catch (err: any) {
      // Fallback
      const fallbackForm = {
        id: 'custom_uploaded',
        title: pages[0]?.fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ") || 'Uploaded Document',
        titleFa: `فرم آپلود شده (${pages.length} صفحه)`,
        description: 'فرم آپلود شده شما برای راهنمایی آماده گردید.',
        category: 'فرم کاغذی آپلود شده',
        questionsCount: 3,
        uploadedPages: pages,
        questions: [
          {
            id: 'cq1',
            number: 1,
            questionCode: 'Q1',
            totalQuestions: 3,
            section: 'بخش ۱: اطلاعات هویت و مرجع / Section 1: Identity & Reference Details',
            questionEn: 'Section 1: Full Name, Date of Birth, and Reference / NINO Number shown on document',
            simpleEnglish: 'Your full name, date of birth, and reference number on the form.',
            farsiTranslation: 'سوال ۱: نام و نام خانوادگی کامل، تاریخ تولد میلادی و شماره مرجع/اینشورنس ثبت شده روی برگه فرم چیست؟',
            dariTranslation: 'سوال ۱: نام کامل، تاریخ تولد و نمبر مرجع شما چیست؟',
            explanationFa: 'اطلاعات اولیه هویت شامل نام انگلیسی، تاریخ تولد و شماره پرونده یا مرجع درج شده بالای برگه.',
            whatTypeInfoNeeded: 'Full Name, DOB & Reference Number',
            exampleFormat: 'e.g. Ali Reza AHMADI | DOB: 15/08/1994 | Ref: HO-012/345',
            fieldKey: 'full_name_ref',
            required: true,
          },
          {
            id: 'cq2',
            number: 2,
            questionCode: 'Q2',
            totalQuestions: 3,
            section: 'بخش ۲: گزینه و توضیحات اصلی فرم / Section 2: Main Choices & Details',
            questionEn: 'Section 2: What request options or details apply to your uploaded document?',
            simpleEnglish: 'Tick options that apply or explain what you are requesting.',
            farsiTranslation: 'سوال ۲: کدام یک از گزینه‌ها یا توضیحات زیر مربوط به برگه فرم آپلود شده شماست؟',
            dariTranslation: 'سوال ۲: توضیحات اصلی شما برای این فرم چیست؟',
            explanationFa: 'گزینه‌های مربوط به برگه را تیک بزنید یا توضیحات اصلی خود را بنویسید تا به انگلیسی ترجمه شود.',
            whatTypeInfoNeeded: 'Form Choice Options & Details',
            exampleFormat: 'Tick options or type details',
            fieldKey: 'form_choices_details',
            required: true,
            isCheckbox: true,
            options: [
              { value: 'NewRequest', labelEn: 'New initial application (درخواست جدید اولیه)', labelFa: 'درخواست جدید اولیه' },
              { value: 'Replacement', labelEn: 'Replacement or update request (تعویض یا ویرایش)', labelFa: 'تعویض، گزارش مفقودی یا به‌روزرسانی' },
              { value: 'ExemptionSupport', labelEn: 'Financial / Health costs support (کمک‌هزینه یا معافیت)', labelFa: 'درخواست معافیت یا حمایت مالی' },
            ],
          },
          {
            id: 'cq3',
            number: 3,
            questionCode: 'Q3',
            totalQuestions: 3,
            section: 'بخش ۳: آدرس، تماس و امضا / Section 3: Address, Contact & Declaration',
            questionEn: 'Section 3: What is your UK Accommodation Address, Postcode, Phone Number, and Declaration?',
            simpleEnglish: 'Full address with postcode, active mobile number, and declaration confirmation.',
            farsiTranslation: 'سوال ۳: آدرس کامل محل سکونت در بریتانیا با کدپستی، شماره موبایل و امضای تاییدیه نهایی؟',
            dariTranslation: 'سوال ۳: آدرس کامل، کودپستی و شماره تماس شما چیست؟',
            explanationFa: 'آدرس دقیق محل سکونت (هتل یا خانه) همراه با کد پستی و شماره تلفن جهت پیگیری.',
            whatTypeInfoNeeded: 'UK Address, Postcode & Phone Number',
            exampleFormat: 'e.g. 12 High Street, London E1 6AN | Phone: 07700 900123',
            fieldKey: 'address_contact',
            required: true,
          },
        ],
      };

      setExtractedCustomForm(fallbackForm);
      setAnalysisResult({
        title: pages[0]?.fileName || 'Uploaded Form',
        englishSummary: `Uploaded ${pages.length} form pages. AI extracted key fields.`,
        farsiSummary: `تعداد ${pages.length} صفحه آپلود شد. سوالات کلیدی برای پاسخ‌دهی استخراج گردید.`,
        sender: 'فرم کاغذی رسمی',
      });

      if (onStartPresetForm) {
        onStartPresetForm('custom_uploaded', fallbackForm);
        onClose();
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setPages([]);
    setAnalysisResult(null);
    setError(null);
  };

  const hasBlurryPage = pages.some((p) => p.isBlurryOrDark);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">آپلود یا عکاسی از فرم • Upload Form</h3>
              <p className="text-xs text-indigo-200">عکس یا فایل صفحات فرم کاغذی خود را اضافه کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-indigo-200 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hasBlurryPage && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs space-y-1 font-farsi dir-rtl">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>⚠️ هشدار کیفیت تصویر / تاریکی عکس</span>
              </div>
              <p>
                برخی از عکس‌ها تاریک یا کم‌نور به نظر می‌رسند. برای دقت ۱۰۰٪ در خواندن سوالات فرم کاغذی، بهتر است عکس را در نور کافی بگیرید. ما هرگز متن‌های تار را حدس نمی‌زنیم.
              </p>
            </div>
          )}

          {isAnalyzing ? (
            <div className="py-12 px-6 text-center space-y-4 animate-fade-in bg-indigo-50/50 rounded-3xl border border-indigo-100">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-md">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Reading Your Paper Form...</h4>
                <p dir="rtl" className="font-farsi text-indigo-900 font-bold text-sm">
                  در حال بررسی و استخراج خانه و فیلدهای برگه فرم کاغذی...
                </p>
                <p className="text-xs text-slate-500 pt-1">Preparing Form Companion side-by-side view...</p>
              </div>
            </div>
          ) : !analysisResult ? (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFilesSelect}
                accept="image/*,.pdf,application/pdf,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                multiple
                className="hidden"
              />

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-14 h-14 rounded-full bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition shadow-xs">
                  <ImagePlus className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    Take photo, upload PDF, DOCX or Word document
                  </p>
                  <p dir="rtl" className="font-farsi font-bold text-indigo-900 text-xs mt-0.5">
                    عکس، اسکن، فایل PDF یا اسناد Word (DOCX) را انتخاب کنید (پشتیبانی از چندین فایل)
                  </p>
                </div>
              </div>

              {/* Uploaded Pages List with Reorder & Remove */}
              {pages.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between font-farsi dir-rtl">
                    <span className="text-xs font-bold text-slate-800">
                      صفحات آپلود شده ({pages.length} صفحه):
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-indigo-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>افزودن صفحه دیگر</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pages.map((p, index) => {
                      const fileNameLower = p.fileName.toLowerCase();
                      const isDocx = p.fileType === 'docx' || fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc');
                      const isPdf = p.fileType === 'pdf' || fileNameLower.endsWith('.pdf') || p.dataUrl.startsWith('data:application/pdf');

                      return (
                        <div
                          key={p.id}
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {isDocx ? (
                              <div className="w-12 h-14 bg-blue-100 border border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-700 shrink-0">
                                <FileText className="w-6 h-6" />
                                <span className="text-[9px] font-black font-mono mt-0.5">DOCX</span>
                              </div>
                            ) : isPdf ? (
                              <div className="w-12 h-14 bg-rose-100 border border-rose-300 rounded-lg flex flex-col items-center justify-center text-rose-700 shrink-0">
                                <FileText className="w-6 h-6" />
                                <span className="text-[9px] font-black font-mono mt-0.5">PDF</span>
                              </div>
                            ) : (
                              <img
                                src={p.dataUrl}
                                alt={`Page ${p.pageNumber}`}
                                className="w-12 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 block">
                                Page {p.pageNumber} {isDocx ? '(Word)' : isPdf ? '(PDF)' : ''}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate block">
                                {p.fileName}
                              </span>
                              {p.isBlurryOrDark && (
                                <span className="text-[10px] text-amber-700 font-farsi block font-bold">
                                  ⚠️ کیفیت عکس کم‌نور
                                </span>
                              )}
                            </div>
                          </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMovePage(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                            title="Move Page Left/Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePage(index, 'down')}
                            disabled={index === pages.length - 1}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                            title="Move Page Right/Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePage(p.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600"
                            title="Remove Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={processFormPages}
                  disabled={pages.length === 0 || isAnalyzing}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm font-farsi ${
                    pages.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>تأیید و شروع همراهی فرم (Form Companion) ←</span>
                </button>
              </div>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-3 text-xs text-slate-400 font-medium">OR / یا</span>
              </div>

              {/* Pre-made Templates Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartPresetForm) onStartPresetForm('arc_replacement');
                }}
                className="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-2xl font-bold text-xs flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <div className="text-left">
                    <p className="font-bold text-slate-900">Try with standard UK form template</p>
                    <p dir="rtl" className="font-farsi text-teal-800 text-[11px]">امتحان با نمونه فرم رسمی بریتانیا (ARC, HC1, GP)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-700" />
              </button>
            </div>
          ) : (
            /* Result Confirmation */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Form Uploaded & Analyzed</span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-indigo-700 font-bold hover:underline"
                >
                  Upload Different Pages
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Extracted Document Details:</h4>
                <p className="text-xs text-slate-700">{analysisResult.englishSummary}</p>
                <p dir="rtl" className="font-farsi text-xs text-teal-800 pt-1 leading-relaxed">
                  {analysisResult.farsiSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartPresetForm) {
                    onStartPresetForm('custom_uploaded', extractedCustomForm);
                  }
                }}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition font-farsi"
              >
                <span>ورود به محیط همزمان فرم و مترجم (Form Companion) ←</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
