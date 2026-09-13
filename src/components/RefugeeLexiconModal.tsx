import React, { useState } from 'react';
import { UK_ASYLUM_LEXICON, UKAsylumTerm } from '../data/lexicon';
import { X, Search, BookOpen, Volume2, ShieldCheck, Check } from 'lucide-react';
import { speakBritishEnglish } from '../utils/audioHelper';

interface RefugeeLexiconModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefugeeLexiconModal: React.FC<RefugeeLexiconModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [playingTerm, setPlayingTerm] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['all', 'Home Office & Legal', 'Financial & Welfare', 'NHS Healthcare', 'Housing & Daily'];

  const filtered = UK_ASYLUM_LEXICON.filter((t) => {
    const matchesCat = category === 'all' || t.category === category;
    const matchesSearch =
      t.english.toLowerCase().includes(search.toLowerCase()) ||
      t.farsi.toLowerCase().includes(search.toLowerCase()) ||
      t.dari.toLowerCase().includes(search.toLowerCase()) ||
      t.explanation.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSpeak = async (englishText: string) => {
    setPlayingTerm(englishText);
    await speakBritishEnglish(englishText, {
      rate: 0.9,
      onEnd: () => setPlayingTerm(null),
    });
    setPlayingTerm(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emphasis/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-3xl w-full shadow-hamyar border border-edge overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-edge bg-page flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-page flex items-center justify-center text-primary">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base">راهنمای واژگان پناهندگی در بریتانیا</h2>
              <p className="text-xs text-ink-muted">UK Asylum & NHS Terminology Glossary</p>
            </div>
          </div>

          <button
            id="btn-close-lexicon-modal"
            onClick={onClose}
            title="Close UK Terminology Guide / بستن راهنمای اصطلاحات"
            aria-label="Close UK Terminology Guide / بستن راهنمای اصطلاحات"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-muted hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-edge bg-surface space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              id="input-search-lexicon"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search UK Asylum & NHS terminology / جستجو در اصطلاحات پناهندگی و پزشکی"
              placeholder="Search UK terminology (ARC, ASPEN, GP, Section 95, هوم آفیس)..."
              className="w-full pl-9 pr-4 py-2 bg-page border border-edge rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary focus:bg-surface"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {categories.map((c) => (
              <button
                key={c}
                id={`btn-lex-cat-${c}`}
                onClick={() => setCategory(c)}
                title={`Filter by category: ${c} / دسته‌بندی ${c}`}
                aria-label={`Filter by category: ${c} / دسته‌بندی ${c}`}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                  category === c
                    ? 'bg-primary text-white'
                    : 'bg-page hover:bg-page text-ink-muted'
                }`}
              >
                {c === 'all' ? 'All Categories' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-page border border-edge rounded-xl space-y-2 hover:border-edge transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-primary text-sm sm:text-base">
                      {item.english}
                    </h3>
                    <span className="text-xs font-semibold bg-page text-ink-muted px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                    <span className="font-farsi font-semibold text-ink">
                      فارسی: {item.farsi}
                    </span>
                    <span className="text-ink-muted" aria-hidden="true">·</span>
                    <span className="font-farsi font-semibold text-primary">
                      دری: {item.dari}
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-speak-term-${idx}`}
                  onClick={() => handleSpeak(item.english)}
                  title="Pronounce term in British English / تلفظ صوتی اصطلاح به انگلیسی"
                  aria-label="Pronounce term in British English / تلفظ صوتی اصطلاح به انگلیسی"
                  className={`p-2 rounded-lg transition ${
                    playingTerm === item.english
                      ? 'bg-primary text-white animate-pulse'
                      : 'bg-surface hover:bg-page text-ink-muted border border-edge'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed pt-1 border-t border-edge">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
