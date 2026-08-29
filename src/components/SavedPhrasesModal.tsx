import React, { useState } from 'react';
import { SavedPhrase } from '../types';
import { X, Star, Volume2, Trash2, Plus, Copy, Check } from 'lucide-react';
import { playSpokenAudio } from '../utils/audioHelper';

interface SavedPhrasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPhrases: SavedPhrase[];
  onAddPhrase: (phrase: { farsiText: string; englishText: string; label: string }) => void;
  onDeletePhrase: (id: string) => void;
  onSelectPhrase?: (farsiText: string, englishText: string) => void;
}

export const SavedPhrasesModal: React.FC<SavedPhrasesModalProps> = ({
  isOpen,
  onClose,
  savedPhrases,
  onAddPhrase,
  onDeletePhrase,
  onSelectPhrase,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newFarsi, setNewFarsi] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarsi.trim() && !newEnglish.trim()) return;

    onAddPhrase({
      label: newLabel.trim() || newEnglish.trim() || newFarsi.trim(),
      farsiText: newFarsi.trim(),
      englishText: newEnglish.trim(),
    });

    setNewLabel('');
    setNewFarsi('');
    setNewEnglish('');
    setShowAddForm(false);
  };

  const handleSpeak = async (phrase: SavedPhrase, lang: 'en-GB' | 'fa-IR') => {
    setPlayingId(phrase.id + '_' + lang);
    const textToSpeak = lang === 'en-GB' ? phrase.englishText : phrase.farsiText;
    await playSpokenAudio(textToSpeak, lang, {
      onEnd: () => setPlayingId(null),
    });
    setPlayingId(null);
  };

  const handleCopy = (phrase: SavedPhrase) => {
    navigator.clipboard.writeText(`${phrase.farsiText}\n${phrase.englishText}`);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fade-in max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="font-bold text-slate-900 text-base">
              Saved Phrases <span className="font-farsi font-normal text-slate-500">| عبارات ذخیره‌شده</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Personal reference details, ARC number, address & saved sentences.
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Phrase</span>
            </button>
          </div>

          {/* Form to Add New Phrase */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-teal-200 rounded-xl space-y-3">
              <h3 className="font-bold text-xs text-teal-900 uppercase tracking-wide">Add New Saved Details / عبارت جدید</h3>
              
              <div>
                <label className="text-xs font-semibold text-slate-700">Label (Title):</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. My ARC Card Number or Home Address"
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 font-farsi">متن فارسی یا دری (Farsi/Dari Text):</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newFarsi}
                  onChange={(e) => setNewFarsi(e.target.value)}
                  placeholder="مثلاً: شماره کارت ای‌آرسی من ۱۲۳۴۵ است"
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-farsi"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">English Text:</label>
                <input
                  type="text"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="e.g. My ARC card reference is 12345"
                  className="w-full mt-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-700 text-white font-bold text-xs hover:bg-teal-800"
                >
                  Save Phrase
                </button>
              </div>
            </form>
          )}

          {/* List of Saved Phrases */}
          <div className="space-y-3">
            {savedPhrases.map((phrase) => (
              <div
                key={phrase.id}
                className="p-4 bg-slate-50 hover:bg-teal-50/30 border border-slate-200 hover:border-teal-300 rounded-xl transition space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{phrase.label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(phrase)}
                      title="Copy phrase"
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                    >
                      {copiedId === phrase.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeletePhrase(phrase.id)}
                      title="Delete saved phrase"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {phrase.farsiText && (
                  <p dir="rtl" className="font-farsi font-medium text-slate-800 text-sm">
                    {phrase.farsiText}
                  </p>
                )}
                {phrase.englishText && (
                  <p className="font-medium text-teal-950 text-xs sm:text-sm">
                    {phrase.englishText}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {phrase.englishText && (
                    <button
                      onClick={() => handleSpeak(phrase, 'en-GB')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        playingId === phrase.id + '_en-GB'
                          ? 'bg-teal-700 text-white animate-pulse'
                          : 'bg-white border border-slate-200 text-teal-800 hover:bg-teal-50'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak English</span>
                    </button>
                  )}

                  {phrase.farsiText && (
                    <button
                      onClick={() => handleSpeak(phrase, 'fa-IR')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        playingId === phrase.id + '_fa-IR'
                          ? 'bg-teal-700 text-white animate-pulse'
                          : 'bg-white border border-slate-200 text-teal-800 hover:bg-teal-50 font-farsi'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>پخش صوتی فارسی</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {savedPhrases.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No saved phrases yet. Click "Save" on any translation card or add custom phrases above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
