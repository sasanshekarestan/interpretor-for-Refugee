import React, { useState } from 'react';
import { InterpretationResult } from '../types';
import { X, FileText, Copy, Check, Sparkles, Download } from 'lucide-react';

interface ConversationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: InterpretationResult[];
}

export const ConversationSummaryModal: React.FC<ConversationSummaryModalProps> = ({
  isOpen,
  onClose,
  results,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build summary items from session results
  const farsiStatements = results.filter(r => r.direction === 'farsi_to_english');
  const englishStatements = results.filter(r => r.direction === 'english_to_farsi');

  // Collect key terms and notes
  const allTerms = Array.from(new Set(results.flatMap(r => (r.keyTerms || []).map(t => `${t.english} (${t.farsi})`))));

  const generateFullSummaryText = () => {
    let summary = `=== خلاصه گفتگو / CONVERSATION SUMMARY ===\n`;
    summary += `تاریخ: ${new Date().toLocaleDateString('fa-IR')} / Date: ${new Date().toLocaleDateString('en-GB')}\n\n`;

    summary += `--- نکات کلیدی به فارسی (Key Points in Farsi) ---\n`;
    farsiStatements.forEach((r, idx) => {
      summary += `${idx + 1}. ${r.sourceText}\n   [ترجمه]: ${r.translatedText}\n`;
    });

    summary += `\n--- Caseworker Statements & Guidance ---\n`;
    englishStatements.forEach((r, idx) => {
      summary += `${idx + 1}. ${r.sourceText}\n   [فارسی]: ${r.translatedText}\n`;
    });

    if (allTerms.length > 0) {
      summary += `\n--- UK Terminology Reference ---\n`;
      allTerms.forEach(t => summary += `• ${t}\n`);
    }

    return summary;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateFullSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emphasis/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-2xl w-full shadow-hamyar border border-edge overflow-hidden flex flex-col animate-fade-in max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-edge bg-page flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-bold text-ink text-base">
                Conversation Summary <span className="font-farsi font-normal text-ink-muted">| خلاصه گفتگو</span>
              </h2>
              <p className="text-xs text-ink-muted">
                End-of-session record with Farsi summary & caseworker key points
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-muted hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Persian Summary Highlight Box */}
          <div className="p-4 bg-page border border-edge rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>خلاصه گفتگو به زبان فارسی (Farsi Executive Summary)</span>
            </div>
            <p dir="rtl" className="font-farsi text-sm text-ink leading-relaxed font-medium">
              در این جلسه {results.length} پیام تبادل شد. موارد مطرح‌شده شامل درخواست‌های پناهجو ({farsiStatements.length} مورد) و پاسخ‌ها/دستورالعمل‌های مشاور ({englishStatements.length} مورد) می‌باشد.
            </p>
          </div>

          {/* Refugee Statements List */}
          {farsiStatements.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-ink-muted border-b border-edge pb-1.5">
                درخواست‌ها و گفته‌های پناهجو (Refugee Statements):
              </h3>
              <div className="space-y-2">
                {farsiStatements.map((r, idx) => (
                  <div key={idx} className="p-3 bg-page rounded-lg text-xs space-y-1">
                    <p dir="rtl" className="font-farsi font-bold text-ink">{idx + 1}. {r.sourceText}</p>
                    <p className="text-primary font-medium">{r.translatedText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caseworker Statements List */}
          {englishStatements.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-ink-muted border-b border-edge pb-1.5">
                دستورالعمل‌های مشاور (Caseworker Key Guidance):
              </h3>
              <div className="space-y-2">
                {englishStatements.map((r, idx) => (
                  <div key={idx} className="p-3 bg-page rounded-lg text-xs space-y-1">
                    <p className="font-bold text-ink">{idx + 1}. {r.sourceText}</p>
                    <p dir="rtl" className="font-farsi font-medium text-primary">{r.translatedText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terminology list */}
          {allTerms.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-edge">
              <h3 className="font-bold text-xs text-ink-muted">UK Terms Reference in this conversation:</h3>
              <div className="flex flex-wrap gap-1.5">
                {allTerms.map((term, i) => (
                  <span key={i} className="px-2.5 py-1 bg-page text-ink-muted text-xs rounded-md font-medium">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-edge bg-page flex items-center justify-between">
          <span className="text-xs text-ink-muted">{results.length} total messages summarized</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-press text-on-primary font-bold text-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-on-primary" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary text-white font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
