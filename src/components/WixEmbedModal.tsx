import React, { useState } from 'react';
import { X, Copy, Check, Code2, ExternalLink, Laptop, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

interface WixEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WixEmbedModal: React.FC<WixEmbedModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [embedMode, setEmbedMode] = useState<'responsive_card' | 'compact_widget' | 'full_page'>('responsive_card');
  const [autoSpeakDefault, setAutoSpeakDefault] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  const getEmbedCode = () => {
    let height = '680px';
    let width = '100%';
    let maxW = '800px';

    if (embedMode === 'compact_widget') {
      height = '560px';
      width = '100%';
      maxW = '420px';
    } else if (embedMode === 'full_page') {
      height = '850px';
      width = '100%';
      maxW = '100%';
    }

    return `<!-- Farsi & Dari to British English Interpreter Widget for Wix Studio -->
<div style="width: 100%; max-width: ${maxW}; margin: 0 auto; min-height: ${height};">
  <iframe
    src="${currentOrigin}?embed=true&autospeak=${autoSpeakDefault ? '1' : '0'}"
    width="100%"
    height="${height}"
    style="border: none; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); overflow: hidden;"
    allow="microphone; camera; clipboard-write;"
    loading="lazy"
    title="Farsi & Dari to British English Refugee Voice Interpreter"
  ></iframe>
</div>`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Embed Inside Wix Studio</h2>
              <p className="text-xs text-slate-500">Add this voice interpreter widget to your refugee support website</p>
            </div>
          </div>

          <button
            id="btn-close-wix-modal"
            onClick={onClose}
            title="Close Embed Modal / بستن پنجره کد جایگذاری"
            aria-label="Close Embed Modal / بستن پنجره کد جایگذاری"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Options */}
          <div className="space-y-3">
            <label className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
              Choose Layout Style for Wix:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'responsive_card', label: 'Standard Card', desc: 'Fits main content blocks (max 800px)' },
                { id: 'compact_widget', label: 'Compact Box', desc: 'Sidebar or mobile pop-up (max 420px)' },
                { id: 'full_page', label: 'Full Section', desc: 'Dedicated full-width interpreter page' },
              ].map((style) => (
                <button
                  key={style.id}
                  id={`btn-embed-style-${style.id}`}
                  onClick={() => setEmbedMode(style.id as any)}
                  title={`Layout style: ${style.label} / سبک طرح‌بندی: ${style.label}`}
                  aria-label={`Layout style: ${style.label} / سبک طرح‌بندی: ${style.label}`}
                  className={`p-3 rounded-xl text-left border transition ${
                    embedMode === style.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-600 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{style.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="check-autospeak-wix"
                checked={autoSpeakDefault}
                onChange={(e) => setAutoSpeakDefault(e.target.checked)}
                title="Auto-play British voice / پخش صوتی خودکار"
                aria-label="Auto-play British voice / پخش صوتی خودکار"
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="check-autospeak-wix" className="text-xs text-slate-700 cursor-pointer font-medium">
                Auto-play British voice interpretation when result is ready
              </label>
            </div>
          </div>

          {/* Generated Code Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                HTML Embed Code Snippet:
              </span>
              <button
                id="btn-copy-wix-code"
                onClick={handleCopy}
                title="Copy HTML Embed Code / کپی کد HTML جایگذاری"
                aria-label="Copy HTML Embed Code / کپی کد HTML جایگذاری"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-slate-100 font-mono text-[11px] sm:text-xs rounded-xl overflow-x-auto border border-slate-800 leading-relaxed select-all">
              {getEmbedCode()}
            </pre>
          </div>

          {/* Step-by-Step Wix Studio Instructions */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              How to add this to your Wix Studio site:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <li>
                Open your site in <strong className="text-slate-800">Wix Studio Editor</strong>.
              </li>
              <li>
                Click the <strong className="text-slate-800">+ (Add Elements)</strong> panel on the left sidebar.
              </li>
              <li>
                Select <strong className="text-slate-800">Embed & Social</strong> ➔ click <strong className="text-slate-800">Embed Code / HTML iframe</strong>.
              </li>
              <li>
                In the HTML Settings box, choose <strong className="text-slate-800">Code</strong> and paste the copied code above.
              </li>
              <li>
                Click <strong className="text-slate-800">Update & Publish</strong>. The voice interpreter widget is now live for your refugee visitors!
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            id="btn-done-wix-modal"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
