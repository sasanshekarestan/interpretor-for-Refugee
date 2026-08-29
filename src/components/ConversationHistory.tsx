import React, { useState } from 'react';
import { InterpretationResult, EmbedSettings } from '../types';
import { 
  Volume2, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Sparkles, 
  History, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { speakBritishEnglish, speakFarsi } from '../utils/audioHelper';

interface ConversationHistoryProps {
  history: InterpretationResult[];
  settings: EmbedSettings;
  onClearHistory: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  history,
  settings,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (history.length === 0) return null;

  const handleCopy = (item: InterpretationResult) => {
    const content = `[Original]: ${item.sourceText}\n[Translation]: ${item.translatedText}`;
    navigator.clipboard.writeText(content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = async (item: InterpretationResult) => {
    if (playingId === item.id) return;
    setPlayingId(item.id);

    try {
      if (item.direction === 'farsi_to_english') {
        await speakBritishEnglish(item.britishPhrasing || item.translatedText, {
          rate: settings.voiceSpeed || 0.95,
          onEnd: () => setPlayingId(null),
        });
      } else {
        await speakFarsi(item.translatedText, {
          rate: settings.voiceSpeed || 0.9,
          onEnd: () => setPlayingId(null),
        });
      }
    } finally {
      setPlayingId(null);
    }
  };

  const handleExportText = () => {
    const lines = history.map((item, index) => {
      const time = new Date(item.timestamp).toLocaleTimeString();
      return `--- Entry #${history.length - index} (${time}) [${item.direction}] ---\n` +
             `Detected: ${item.detectedDialect || 'Farsi/Dari'}\n` +
             `Source: ${item.sourceText}\n` +
             `English: ${item.britishPhrasing || item.translatedText}\n` +
             (item.formalPhrasing ? `Formal: ${item.formalPhrasing}\n` : '') +
             `\n`;
    }).join('');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Refugee_Interpretation_Session_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-700" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Conversation & Interpretation Log ({history.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-history"
            onClick={handleExportText}
            title="Download conversation transcripts / دانلود فایل متن گفتگو"
            aria-label="Download conversation transcripts / دانلود فایل متن گفتگو"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Transcript</span>
          </button>

          <button
            id="btn-clear-history-list"
            onClick={onClearHistory}
            title="Clear Log / پاک کردن تاریخچه"
            aria-label="Clear Log / پاک کردن تاریخچه"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* History Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {history.map((item, idx) => {
          const isFarsi = item.direction === 'farsi_to_english';
          return (
            <div
              key={item.id || idx}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-800 bg-teal-100/60 px-2 py-0.5 rounded text-[11px]">
                    {item.detectedDialect || (isFarsi ? 'Farsi/Dari' : 'English')}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`btn-replay-history-${item.id}`}
                    onClick={() => handleSpeak(item)}
                    title="Replay spoken audio / پخش مجدد صوتی"
                    aria-label="Replay spoken audio / پخش مجدد صوتی"
                    className={`p-1.5 rounded-lg transition ${
                      playingId === item.id
                        ? 'bg-teal-700 text-white animate-pulse'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-copy-history-${item.id}`}
                    onClick={() => handleCopy(item)}
                    title="Copy entry text / کپی متن"
                    aria-label="Copy entry text / کپی متن"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg transition"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Text preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/50">
                <div dir={isFarsi ? 'rtl' : 'ltr'}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Original:</span>
                  <p className={`text-slate-800 ${isFarsi ? 'font-farsi font-medium' : 'font-sans'}`}>
                    {item.sourceText}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-teal-800 uppercase font-bold block mb-0.5">British Translation:</span>
                  <p className="text-slate-900 font-semibold">
                    {item.britishPhrasing || item.translatedText}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
