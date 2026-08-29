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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">راهنمای واژگان پناهندگی در بریتانیا</h2>
              <p className="text-xs text-slate-500">UK Asylum & NHS Terminology Glossary</p>
            </div>
          </div>

          <button
            id="btn-close-lexicon-modal"
            onClick={onClose}
            title="Close UK Terminology Guide / بستن راهنمای اصطلاحات"
            aria-label="Close UK Terminology Guide / بستن راهنمای اصطلاحات"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="input-search-lexicon"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search UK Asylum & NHS terminology / جستجو در اصطلاحات پناهندگی و پزشکی"
              placeholder="Search UK terminology (ARC, ASPEN, GP, Section 95, هوم آفیس)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 focus:bg-white"
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
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
              className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 hover:border-teal-300 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-teal-950 text-sm sm:text-base">
                      {item.english}
                    </h3>
                    <span className="text-[10px] font-semibold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                    <span className="font-farsi font-semibold text-slate-900">
                      🇮🇷 فارسی: {item.farsi}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-farsi font-semibold text-teal-800">
                      🇦🇫 دری: {item.dari}
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
                      ? 'bg-teal-700 text-white animate-pulse'
                      : 'bg-white hover:bg-teal-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/50">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
