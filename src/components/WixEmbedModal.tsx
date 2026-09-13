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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emphasis/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-2xl w-full shadow-hamyar border border-edge overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-edge bg-page flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-page flex items-center justify-center text-primary">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base">Embed Inside Wix Studio</h2>
              <p className="text-xs text-ink-muted">Add this voice interpreter widget to your refugee support website</p>
            </div>
          </div>

          <button
            id="btn-close-wix-modal"
            onClick={onClose}
            title="Close Embed Modal / بستن پنجره کد جایگذاری"
            aria-label="Close Embed Modal / بستن پنجره کد جایگذاری"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-muted hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Options */}
          <div className="space-y-3">
            <label className="font-bold text-ink block text-xs uppercase tracking-wider">
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
                      ? 'border-primary bg-page text-primary ring-1 ring-primary font-semibold'
                      : 'border-edge bg-surface hover:bg-page text-ink-muted'
                  }`}
                >
                  <div className="font-bold text-xs">{style.label}</div>
                  <div className="text-xs text-ink-muted mt-0.5">{style.desc}</div>
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
                className="w-4 h-4 text-primary rounded border-edge-control focus:ring-primary"
              />
              <label htmlFor="check-autospeak-wix" className="text-xs text-ink-muted cursor-pointer font-medium">
                Auto-play British voice interpretation when result is ready
              </label>
            </div>
          </div>

          {/* Generated Code Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink text-xs uppercase tracking-wider">
                HTML Embed Code Snippet:
              </span>
              <button
                id="btn-copy-wix-code"
                onClick={handleCopy}
                title="Copy HTML Embed Code / کپی کد HTML جایگذاری"
                aria-label="Copy HTML Embed Code / کپی کد HTML جایگذاری"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary text-white font-semibold text-xs transition shadow-hamyar"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-3.5 bg-emphasis text-on-emphasis font-mono text-xs sm:text-xs rounded-xl overflow-x-auto border border-white/15 leading-relaxed select-all">
              {getEmbedCode()}
            </pre>
          </div>

          {/* Step-by-Step Wix Studio Instructions */}
          <div className="p-4 bg-page border border-edge rounded-xl space-y-2.5">
            <h4 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              How to add this to your Wix Studio site:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-ink-muted leading-relaxed">
              <li>
                Open your site in <strong className="text-ink">Wix Studio Editor</strong>.
              </li>
              <li>
                Click the <strong className="text-ink">+ (Add Elements)</strong> panel on the left sidebar.
              </li>
              <li>
                Select <strong className="text-ink">Embed & Social</strong>, then click <strong className="text-ink">Embed Code / HTML iframe</strong>.
              </li>
              <li>
                In the HTML Settings box, choose <strong className="text-ink">Code</strong> and paste the copied code above.
              </li>
              <li>
                Click <strong className="text-ink">Update & Publish</strong>. The voice interpreter widget is now live for your refugee visitors!
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-edge bg-page flex items-center justify-end">
          <button
            id="btn-done-wix-modal"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-page hover:bg-page text-ink font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
