import React, { useState } from 'react';
import { QUICK_PHRASES } from '../data/quickPhrases';
import { QuickPhrase } from '../types';
import { 
  X, 
  Volume2, 
  Sparkles, 
  Search, 
  ShieldAlert, 
  Home, 
  HeartPulse, 
  Scale, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { playSpokenAudio } from '../utils/audioHelper';

interface QuickPhrasesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhrase: (phrase: QuickPhrase) => void;
}

export const QuickPhrasesDrawer: React.FC<QuickPhrasesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPhrase,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'همه (All)' },
    { id: 'health', label: '🏥 GP & NHS Healthcare (پزشک و درمان)' },
    { id: 'housing', label: '🏠 Housing & Accommodation (مسکن و اقامتگاه)' },
    { id: 'support', label: '💳 Money & Benefits (مالی و کمک‌هزینه)' },
    { id: 'home_office', label: '🏛️ Appointments & Home Office (قرار ملاقات و هوم آفیس)' },
    { id: 'emergency', label: '🚨 Everyday & Emergency (روزمره و اضطراری)' },
  ];

  const filtered = QUICK_PHRASES.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.farsiText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.englishText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.dariNote && item.dariNote.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSpeak = async (e: React.MouseEvent, phrase: QuickPhrase) => {
    e.stopPropagation();
    setPlayingId(phrase.id);
    await playSpokenAudio(phrase.englishText, 'en-GB', {
      rate: 0.9,
      onStart: () => setPlayingId(phrase.id),
      onEnd: () => setPlayingId(null),
    });
    setPlayingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-base">جملات و عبارات ضروری پناهجویی</h2>
            </div>
            <p className="text-xs text-slate-500">
              Essential Refugee Phrases with Spoken British Voice
            </p>
          </div>
          <button
            id="btn-close-quick-phrases"
            onClick={onClose}
            title="Close phrases drawer / بستن پنجره جملات"
            aria-label="Close phrases drawer / بستن پنجره جملات"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 space-y-2 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              id="input-search-quick-phrases"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search quick phrases in Farsi, Dari, English / جستجو در جملات کاربردی"
              placeholder="جستجو در جملات (فارسی، دری، English)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                id={`btn-cat-${c.id}`}
                onClick={() => setSelectedCategory(c.id)}
                title={`Filter by category: ${c.label} / فیلتر بر اساس دسته: ${c.label}`}
                aria-label={`Filter by category: ${c.label} / فیلتر بر اساس دسته: ${c.label}`}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                  selectedCategory === c.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Phrase List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectPhrase(item);
                onClose();
              }}
              className="group cursor-pointer p-4 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-xl transition shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Text Content */}
                <div className="space-y-1.5 flex-1">
                  <p dir="rtl" className="font-farsi font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                    {item.farsiText}
                  </p>
                  {item.dariNote && (
                    <p dir="rtl" className="font-farsi text-xs text-teal-800 font-medium bg-teal-100/40 p-1.5 rounded">
                      {item.dariNote}
                    </p>
                  )}
                  <p className="font-semibold text-teal-950 text-xs sm:text-sm pt-1">
                    {item.englishText}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono italic">
                    {item.phonetic}
                  </p>
                </div>

                {/* Speak Action Button */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    id={`btn-speak-phrase-${item.id}`}
                    onClick={(e) => handleSpeak(e, item)}
                    title="Speak phrase in British English / پخش صوتی انگلیسی"
                    aria-label="Speak phrase in British English / پخش صوتی انگلیسی"
                    className={`p-2 rounded-lg transition ${
                      playingId === item.id
                        ? 'bg-teal-700 text-white animate-pulse'
                        : 'bg-white group-hover:bg-teal-700 group-hover:text-white text-slate-600 border border-slate-200 group-hover:border-teal-700'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              موردی مطابق با جستجوی شما پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
