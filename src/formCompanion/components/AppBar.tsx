import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, MoreVertical, Printer, ExternalLink, RotateCcw, FileCheck2, Upload } from 'lucide-react';
import { IconButton } from './Primitives';
import { t, APP_BAR_HEIGHT } from '../tokens';

interface AppBarProps {
  code: string;
  titleFa: string;
  onBack: () => void;
  onOpenAnswerSheet: () => void;
  onStartAgain: () => void;
  onUploadOwnForm?: () => void;
  pdfUrl?: string;
  officialSourceUrl?: string;
}

/**
 * The only chrome above the document: 56px, one row.
 * It replaces the app header, the tab strip and the form title bar that used
 * to stack to 217px before the form even started.
 */
export const AppBar: React.FC<AppBarProps> = ({
  code,
  titleFa,
  onBack,
  onOpenAnswerSheet,
  onStartAgain,
  onUploadOwnForm,
  pdfUrl,
  officialSourceUrl,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const item =
    'w-full text-right px-4 py-3 text-[13px] font-farsi flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition';

  return (
    <header
      className={`${t.bar} border-b flex items-center gap-1 px-1.5 shrink-0 relative z-30`}
      style={{ height: APP_BAR_HEIGHT }}
      dir="rtl"
    >
      <IconButton label="بازگشت به فهرست فرم‌ها" onClick={onBack}>
        <ArrowRight className="w-5 h-5" />
      </IconButton>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
          {code}
        </span>
        <h1 className="font-farsi font-bold text-[13.5px] text-slate-900 truncate leading-tight">
          {titleFa}
        </h1>
      </div>

      <div ref={menuRef} className="relative shrink-0">
        <IconButton label="کارهای بیشتر" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
          <MoreVertical className="w-5 h-5" />
        </IconButton>

        {menuOpen && (
          <div className="absolute left-0 top-[52px] w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1">
            <button type="button" className={item} onClick={() => { setMenuOpen(false); onOpenAnswerSheet(); }}>
              <FileCheck2 className={`w-4 h-4 ${t.faint}`} />
              <span>برگه پاسخ‌های من</span>
            </button>

            {pdfUrl && (
              <a className={item} href={pdfUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                <Printer className={`w-4 h-4 ${t.faint}`} />
                <span>چاپ و ذخیره فرم اصلی</span>
              </a>
            )}

            {officialSourceUrl && (
              <a className={item} href={officialSourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                <ExternalLink className={`w-4 h-4 ${t.faint}`} />
                <span>وب‌سایت رسمی این فرم</span>
              </a>
            )}

            {onUploadOwnForm && (
              <button type="button" className={item} onClick={() => { setMenuOpen(false); onUploadOwnForm(); }}>
                <Upload className={`w-4 h-4 ${t.faint}`} />
                <span>بارگذاری فرم خودم</span>
              </button>
            )}

            <div className="h-px bg-slate-200 my-1" />

            <button
              type="button"
              className={`${item} ${t.faultText}`}
              onClick={() => { setMenuOpen(false); onStartAgain(); }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>شروع دوباره (پاک کردن پاسخ‌ها)</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
