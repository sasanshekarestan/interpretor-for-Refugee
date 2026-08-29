import React, { useState } from 'react';
import { Pin, Copy, Check, X } from 'lucide-react';

interface PinnedDetailsBarProps {
  details: string[];
  onClearDetails: () => void;
  onRemoveDetail: (detail: string) => void;
}

export const PinnedDetailsBar: React.FC<PinnedDetailsBarProps> = ({
  details,
  onClearDetails,
  onRemoveDetail,
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!details || details.length === 0) return null;

  const handleCopy = (item: string) => {
    navigator.clipboard.writeText(item);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 1500);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-700 shadow-xl px-3 sm:px-4 py-2 animate-slide-up w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="p-1 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-200">
            Pinned <span className="font-farsi font-normal text-slate-400 hidden sm:inline">| اطلاعات سنجاق‌شده:</span>
          </span>
        </div>

        {/* Horizontal Scrolling Chips */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none min-w-0">
          {details.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-400/60 rounded-full text-xs font-mono font-semibold text-amber-300 transition shrink-0"
            >
              <button
                onClick={() => handleCopy(item)}
                title="Tap to copy / برای کپی کلیک کنید"
                className="flex items-center gap-1.5"
              >
                <span>{item}</span>
                {copiedItem === item ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
                )}
              </button>

              <button
                onClick={() => onRemoveDetail(item)}
                title="Remove detail"
                className="text-slate-500 hover:text-rose-400 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onClearDetails}
          title="Clear all pinned details"
          className="text-xs text-slate-400 hover:text-white underline shrink-0 font-farsi"
        >
          پاک کردن همه
        </button>
      </div>
    </div>
  );
};
