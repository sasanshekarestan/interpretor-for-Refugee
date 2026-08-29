import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Printer, ExternalLink, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, Download, RefreshCw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Explicitly configure pdf.js worker URL to match the exact installed pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface OfficialPdfViewerProps {
  pdfPath: string;
  titleEn: string;
  titleFa?: string;
  officialSourceUrl: string;
  pageCount: number;
  currentPageIndex: number;
  onSelectPage: (pageIndex: number) => void;
  /** Hide the built-in toolbar when the surrounding shell provides its own controls. */
  hideToolbar?: boolean;
  /** Controlled zoom, so page controls can live outside this component. */
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  /** Let the viewer fill its parent instead of reserving 600px. */
  fill?: boolean;
  onPageCountChange?: (count: number) => void;
}

export const OfficialPdfViewer: React.FC<OfficialPdfViewerProps> = ({
  pdfPath,
  titleEn,
  titleFa,
  officialSourceUrl,
  pageCount,
  currentPageIndex,
  onSelectPage,
  hideToolbar = false,
  zoom: zoomProp,
  onZoomChange,
  fill = false,
  onPageCountChange,
}) => {
  const [internalZoom, setInternalZoom] = useState<number>(100);
  const zoom = zoomProp ?? internalZoom;
  const setZoom = (next: number | ((prev: number) => number)) => {
    const value = typeof next === 'function' ? (next as (p: number) => number)(zoom) : next;
    if (onZoomChange) onZoomChange(value);
    else setInternalZoom(value);
  };
  const [docStatus, setDocStatus] = useState<'loading' | 'loaded' | 'missing' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pageRendering, setPageRendering] = useState<boolean>(false);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPdfPages, setTotalPdfPages] = useState<number>(pageCount);
  const [loadAttempt, setLoadAttempt] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Convert "public/forms/hc1.pdf" to web URL "/forms/hc1.pdf"
  const webUrl = pdfPath.startsWith('public/') ? pdfPath.replace(/^public/, '') : pdfPath;
  const displayPath = pdfPath.startsWith('/') ? `public${pdfPath}` : pdfPath.startsWith('public/') ? pdfPath : `public/${pdfPath}`;

  // 1. Load the PDF document
  useEffect(() => {
    let isCancelled = false;
    setDocStatus('loading');
    setErrorMessage('');
    setPdfDoc(null);

    const loadingTask = pdfjsLib.getDocument({
      url: webUrl,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
      cMapPacked: true,
      enableXfa: true,
    });

    loadingTask.promise
      .then((doc) => {
        if (isCancelled) return;
        setPdfDoc(doc);
        setTotalPdfPages(doc.numPages || pageCount);
        onPageCountChange?.(doc.numPages || pageCount);
        setDocStatus('loaded');
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn('PDF.js failed to load document:', err);
        // Check if 404 or missing file
        if (err?.name === 'MissingPDFException' || err?.status === 404 || err?.message?.includes('404') || err?.message?.includes('Unexpected server response (404)')) {
          setDocStatus('missing');
        } else {
          setDocStatus('error');
          setErrorMessage(err?.message || 'Failed to parse official PDF file.');
        }
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [webUrl, loadAttempt, pageCount]);

  // 2. Render the specific page onto the Canvas
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    // Cancel any ongoing render task before starting a new one
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setPageRendering(true);

    try {
      const pageNum = Math.min(Math.max(1, currentPageIndex + 1), pdfDoc.numPages);
      const page = await pdfDoc.getPage(pageNum);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      const containerWidth = containerRef.current.clientWidth || 800;
      // Get unscaled viewport to determine aspect ratio
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Base scale fits container width with some padding
      const padding = 24;
      const availableWidth = Math.max(300, containerWidth - padding);
      const baseScale = availableWidth / unscaledViewport.width;
      const finalScale = baseScale * (zoom / 100);

      const viewport = page.getViewport({ scale: finalScale });

      // Sharp canvas rendering using window.devicePixelRatio
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);

      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;
      setPageRendering(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Page render error:', err);
      }
      setPageRendering(false);
    }
  }, [pdfDoc, currentPageIndex, zoom]);

  useEffect(() => {
    if (docStatus === 'loaded') {
      renderPage();
    }
  }, [docStatus, renderPage]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current || docStatus !== 'loaded') return;

    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderPage();
      }, 150);
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
    };
  }, [docStatus, renderPage]);

  const handleZoomIn = () => setZoom((prev) => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoom((prev) => Math.max(50, prev - 25));
  const handleRetry = () => setLoadAttempt((c) => c + 1);

  const displayTotalPages = pdfDoc?.numPages || totalPdfPages || pageCount;

  return (
    <div className={fill ? 'font-sans h-full flex flex-col' : 'space-y-4 font-sans'}>
      {/* Viewer Toolbar */}
      <div className={`${hideToolbar ? 'hidden' : ''} bg-slate-900 text-white p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs`}>
        {/* Left: Document Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#005EB8] text-white rounded-xl shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm line-clamp-1">{titleEn}</span>
              {titleFa && <span className="text-xs text-amber-300 font-farsi dir-rtl font-semibold">({titleFa})</span>}
            </div>
            <p className="text-[11px] text-slate-400">
              Official PDF • {displayTotalPages} {displayTotalPages === 1 ? 'Page' : 'Pages'} total
            </p>
          </div>
        </div>

        {/* Right: Actions & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Page Navigation */}
          {displayTotalPages > 1 && (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onSelectPage(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 font-mono font-bold text-amber-300 text-xs whitespace-nowrap">
                Page {currentPageIndex + 1} / {displayTotalPages}
              </span>
              <button
                type="button"
                onClick={() => onSelectPage(Math.min(displayTotalPages - 1, currentPageIndex + 1))}
                disabled={currentPageIndex >= displayTotalPages - 1}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition cursor-pointer disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 font-semibold">{zoom}%</span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Official Source Link */}
          {officialSourceUrl && (
            <a
              href={officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition flex items-center gap-1.5 text-xs"
              title="Open official GOV.UK / NHS website source"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">GOV / NHS Source</span>
            </a>
          )}

          {/* Print / Save in New Tab (Persian & Dari labelled) */}
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-[#005EB8] hover:bg-blue-600 text-white font-bold rounded-xl transition flex items-center gap-2 text-xs shadow-xs cursor-pointer"
            title="باز کردن فایل PDF در برگه جدید مرورگر برای چاپ و ذخیره (چاپ و ثبت در برگه نو) / Open PDF in new browser tab to print or save"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span className="font-farsi font-bold">چاپ و ذخیره PDF</span>
            <span className="text-[10px] text-blue-200 hidden sm:inline font-farsi">(برگه جدید / تب نو)</span>
          </a>
        </div>
      </div>

      {/* Main Document Display Canvas Container */}
      <div
        ref={containerRef}
        className={`relative w-full bg-slate-950 overflow-auto flex flex-col items-center justify-start ${
          fill
            ? 'flex-1 min-h-0 p-2'
            : 'min-h-[600px] rounded-2xl border border-slate-800 shadow-inner p-2 sm:p-4'
        }`}
      >
        {/* Document Loading State */}
        {docStatus === 'loading' && (
          <div className="flex-1 w-full min-h-[500px] flex flex-col items-center justify-center p-8 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#005EB8]" />
            <p className="text-sm font-medium">Loading official PDF document...</p>
            <p className="text-xs text-slate-500 font-mono">{webUrl}</p>
          </div>
        )}

        {/* Missing PDF File Placeholder */}
        {docStatus === 'missing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-4 my-auto">
            <div className="p-4 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-farsi dir-rtl">
                سند رسمی PDF هنوز در سرور قرار داده نشده است
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-farsi dir-rtl">
                فایل اصلی این فرم هنوز در مسیر فایل‌های استاتیک برنامه موجود نیست.
              </p>
            </div>

            {/* Path Information Box */}
            <div className="w-full bg-slate-900 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-2 dir-ltr">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider font-sans font-bold">
                Required Static File Path:
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-700 font-bold text-amber-300 select-all break-all">
                {displayPath}
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-normal">
                To display the official government PDF, place the valid PDF file at the path above inside the project public directory.
              </p>
            </div>

            {/* Source Link & Retry Button */}
            <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {officialSourceUrl && (
                <a
                  href={officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF from official website</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>بررسی مجدد فایل (Retry)</span>
              </button>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs text-blue-300 font-farsi dir-rtl">
              💡 دستیار هوشمند و راهنمای فارسی سوالات فرم کاملاً فعال و قابل استفاده است.
            </div>
          </div>
        )}

        {/* Load Error State */}
        {docStatus === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-4 my-auto">
            <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-farsi dir-rtl">خطا در بارگذاری سند رسمی PDF</h3>
              <p className="text-xs text-slate-400 font-mono">{errorMessage || 'Unable to render PDF'}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>تلاش دوباره (Retry Loading)</span>
            </button>
          </div>
        )}

        {/* Document Rendering Canvas */}
        <div className={`relative flex flex-col items-center max-w-full ${docStatus === 'loaded' ? 'block' : 'hidden'}`}>
          {/* Subtle Page Rendering Indicator */}
          {pageRendering && (
            <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-full shadow-lg flex items-center gap-2 text-xs text-amber-300 backdrop-blur-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Rendering page {currentPageIndex + 1}...</span>
            </div>
          )}

          {/* Actual Canvas */}
          <div className="shadow-2xl rounded-lg overflow-hidden bg-white border border-slate-700">
            <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
