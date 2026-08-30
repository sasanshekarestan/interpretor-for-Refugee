import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { OfficialForm } from '../../data/officialForms';
import { OfficialPdfViewer, RenderedField } from '../../components/OfficialPdfViewer';
import { CustomFormObject } from '../types';
import { t } from '../tokens';

interface DocumentSurfaceProps {
  form: OfficialForm;
  customPages?: CustomFormObject['uploadedPages'];
  pageIndex: number;
  onSelectPage: (index: number) => void;
  /** Boxes on the current page, once the page has rendered. */
  fields?: RenderedField[];
  activeFieldId?: string | null;
  onSelectField?: (field: RenderedField) => void;
  onFieldsRendered?: (info: { pageIndex: number; fields: RenderedField[]; pageText: string }) => void;
  answeredFieldIds?: string[];
}

/**
 * The document, and only the document.
 *
 * One component owns every way a form can be shown — the official PDF, a
 * photographed page, an uploaded PDF, an uploaded Word file — so a form switch
 * cannot leave the previous document on screen: the branch is chosen from the
 * props on every render, never from state left over from the last form.
 */
export const DocumentSurface: React.FC<DocumentSurfaceProps> = ({
  form,
  customPages,
  pageIndex,
  onSelectPage,
  fields = [],
  activeFieldId,
  onSelectField,
  onFieldsRendered,
  answeredFieldIds = [],
}) => {
  const [zoom, setZoom] = useState(100);
  const [pdfPageCount, setPdfPageCount] = useState(form.pageCount);

  const hasCustom = !!customPages && customPages.length > 0;
  const totalPages = hasCustom ? customPages!.length : pdfPageCount;

  const page = hasCustom ? customPages![pageIndex] || customPages![0] : undefined;
  const dataUrl = page?.dataUrl || '';
  const fileName = (page?.fileName || '').toLowerCase();
  const isDocx =
    page?.fileType === 'docx' ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc') ||
    dataUrl.startsWith('data:text/html');
  const isPdf =
    page?.fileType === 'pdf' || dataUrl.startsWith('data:application/pdf') || fileName.endsWith('.pdf');

  let body: React.ReactNode;

  if (!hasCustom) {
    // A touch target over every box the form actually contains. It is drawn
    // on top of the page, never into it - the document underneath is the
    // untouched official PDF.
    const overlay =
      onSelectField && fields.length > 0 ? (
        <div className="absolute inset-0">
          {fields.map((f) => {
            const isActive = f.id === activeFieldId;
            const isAnswered = answeredFieldIds.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectField(f)}
                aria-label={f.name}
                aria-pressed={isActive}
                className={`absolute rounded-[3px] transition cursor-pointer
                  ${
                    isActive
                      ? 'bg-[#005EB8]/25 ring-2 ring-[#005EB8]'
                      : isAnswered
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30'
                      : 'bg-[#005EB8]/8 hover:bg-[#005EB8]/20'
                  }`}
                style={{
                  left: f.left,
                  top: f.top,
                  width: Math.max(f.width, 14),
                  height: Math.max(f.height, 14),
                }}
              />
            );
          })}
        </div>
      ) : undefined;

    body = (
      <OfficialPdfViewer
        overlay={overlay}
        onFieldsRendered={onFieldsRendered}
        pdfPath={form.pdfPath}
        titleEn={form.titleEn}
        titleFa={form.titleFa}
        officialSourceUrl={form.officialSourceUrl}
        pageCount={form.pageCount}
        currentPageIndex={pageIndex}
        onSelectPage={onSelectPage}
        onPageCountChange={setPdfPageCount}
        hideToolbar
        fill
        zoom={zoom}
        onZoomChange={setZoom}
      />
    );
  } else if (isDocx) {
    let html = page?.htmlContent || '';
    if (!html && dataUrl.startsWith('data:text/html')) {
      try {
        html = decodeURIComponent(dataUrl.replace(/^data:text\/html;charset=utf-8,/, ''));
      } catch (_) {}
    }
    body = (
      <div className="flex-1 min-h-0 overflow-auto bg-slate-950 p-3">
        <div className="bg-white text-slate-900 p-5 rounded-lg shadow-lg max-w-2xl mx-auto text-left dir-ltr">
          <div className="flex items-center gap-2 border-b pb-2 mb-3 text-xs font-mono text-slate-600">
            <FileText className="w-4 h-4" />
            <span>{page?.fileName || 'Document.docx'}</span>
          </div>
          {html ? (
            <div
              className="prose prose-slate max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="font-farsi text-sm text-slate-600" dir="rtl">
              محتوای سند بارگذاری شد.
            </p>
          )}
        </div>
      </div>
    );
  } else if (isPdf) {
    body = (
      <iframe
        src={dataUrl}
        className="flex-1 min-h-0 w-full bg-white"
        title={`صفحه ${pageIndex + 1} از فرم بارگذاری‌شده`}
      />
    );
  } else {
    body = (
      <div className="flex-1 min-h-0 overflow-auto bg-slate-950 p-3 flex items-start justify-center">
        <img
          src={dataUrl}
          alt="فرم کاغذی بارگذاری‌شده شما"
          className="max-w-full rounded-lg shadow-lg"
          style={{ width: `${zoom}%` }}
        />
      </div>
    );
  }

  const control =
    'w-9 h-9 inline-flex items-center justify-center rounded-lg text-white/90 hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition';

  return (
    <div className={`relative flex-1 min-h-0 flex flex-col ${t.mat}`}>
      {body}

      {/* Page and zoom float over the document rather than stacking above it. */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-1
          bg-slate-900/90 backdrop-blur-sm border border-white/15 rounded-full shadow-lg"
        dir="ltr"
      >
        <button
          type="button"
          className={control}
          aria-label="صفحه قبل"
          disabled={pageIndex === 0}
          onClick={() => onSelectPage(Math.max(0, pageIndex - 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 font-mono text-xs font-bold text-white tabular-nums whitespace-nowrap">
          {pageIndex + 1} / {totalPages}
        </span>

        <button
          type="button"
          className={control}
          aria-label="صفحه بعد"
          disabled={pageIndex >= totalPages - 1}
          onClick={() => onSelectPage(Math.min(totalPages - 1, pageIndex + 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-white/20 mx-0.5" />

        <button
          type="button"
          className={control}
          aria-label="کوچک‌تر"
          disabled={zoom <= 50}
          onClick={() => setZoom((z) => Math.max(50, z - 25))}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          className={control}
          aria-label="بزرگ‌تر"
          disabled={zoom >= 250}
          onClick={() => setZoom((z) => Math.min(250, z + 25))}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
