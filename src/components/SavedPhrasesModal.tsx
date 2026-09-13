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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emphasis/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-lg w-full shadow-hamyar border border-edge overflow-hidden flex flex-col animate-fade-in max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-edge bg-page flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-attention fill-attention" />
            <h2 className="font-bold text-ink text-base">
              Saved Phrases <span className="font-farsi font-normal text-ink-muted">| عبارات ذخیره‌شده</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-muted hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              Personal reference details, ARC number, address & saved sentences.
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary text-white text-xs font-bold transition shadow-hamyar"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Phrase</span>
            </button>
          </div>

          {/* Form to Add New Phrase */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 bg-page border border-edge rounded-xl space-y-3">
              <h3 className="font-bold text-xs text-primary uppercase tracking-wide">Add New Saved Details / عبارت جدید</h3>
              
              <div>
                <label className="text-xs font-semibold text-ink-muted">Label (Title):</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. My ARC Card Number or Home Address"
                  className="w-full mt-1 p-2 bg-surface border border-edge-control rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted font-farsi">متن فارسی یا دری (Farsi/Dari Text):</label>
                <input
                  type="text"
                  dir="rtl"
                  value={newFarsi}
                  onChange={(e) => setNewFarsi(e.target.value)}
                  placeholder="مثلاً: شماره کارت ای‌آرسی من ۱۲۳۴۵ است"
                  className="w-full mt-1 p-2 bg-surface border border-edge-control rounded-lg text-xs font-farsi"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-muted">English Text:</label>
                <input
                  type="text"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                  placeholder="e.g. My ARC card reference is 12345"
                  className="w-full mt-1 p-2 bg-surface border border-edge-control rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-edge-control text-xs text-ink-muted hover:bg-page"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary"
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
                className="p-4 bg-page hover:bg-page border border-edge hover:border-edge rounded-xl transition space-y-2"
              >
                <div className="flex items-center justify-between border-b border-edge pb-2">
                  <span className="font-bold text-ink text-xs sm:text-sm">{phrase.label}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(phrase)}
                      title="Copy phrase"
                      className="p-1 rounded text-ink-muted hover:text-ink-muted hover:bg-page"
                    >
                      {copiedId === phrase.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onDeletePhrase(phrase.id)}
                      title="Delete saved phrase"
                      className="p-1 rounded text-ink-muted hover:text-fault hover:bg-fault-bg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {phrase.farsiText && (
                  <p dir="rtl" className="font-farsi font-medium text-ink text-sm">
                    {phrase.farsiText}
                  </p>
                )}
                {phrase.englishText && (
                  <p className="font-medium text-primary text-xs sm:text-sm">
                    {phrase.englishText}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  {phrase.englishText && (
                    <button
                      onClick={() => handleSpeak(phrase, 'en-GB')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        playingId === phrase.id + '_en-GB'
                          ? 'bg-primary text-white animate-pulse'
                          : 'bg-surface border border-edge text-primary hover:bg-page'
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
                          ? 'bg-primary text-white animate-pulse'
                          : 'bg-surface border border-edge text-primary hover:bg-page font-farsi'
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
              <div className="text-center py-10 text-ink-muted text-xs">
                No saved phrases yet. Click "Save" on any translation card or add custom phrases above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
