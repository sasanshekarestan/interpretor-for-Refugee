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
    { id: 'health', label: 'GP & NHS Healthcare (پزشک و درمان)' },
    { id: 'housing', label: 'Housing & Accommodation (مسکن و اقامتگاه)' },
    { id: 'support', label: 'Money & Benefits (مالی و کمک‌هزینه)' },
    { id: 'home_office', label: 'Appointments & Home Office (قرار ملاقات و هوم آفیس)' },
    { id: 'emergency', label: 'Everyday & Emergency (روزمره و اضطراری)' },
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-emphasis/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-surface h-full shadow-hamyar flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-edge flex items-center justify-between bg-page">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-attention" />
              <h2 className="font-bold text-ink text-base">جملات و عبارات ضروری پناهجویی</h2>
            </div>
            <p className="text-xs text-ink-muted">
              Essential Refugee Phrases with Spoken British Voice
            </p>
          </div>
          <button
            id="btn-close-quick-phrases"
            onClick={onClose}
            title="Close phrases drawer / بستن پنجره جملات"
            aria-label="Close phrases drawer / بستن پنجره جملات"
            className="p-2 rounded-xl text-ink-muted hover:text-ink-muted hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-edge space-y-2 bg-surface">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              id="input-search-quick-phrases"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search quick phrases in Farsi, Dari, English / جستجو در جملات کاربردی"
              placeholder="جستجو در جملات (فارسی، دری، English)..."
              className="w-full pl-9 pr-4 py-2 bg-page border border-edge rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary focus:bg-surface transition"
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
                    ? 'bg-primary text-white shadow-hamyar'
                    : 'bg-page hover:bg-page text-ink-muted'
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
              className="group cursor-pointer p-4 bg-page hover:bg-page border border-edge hover:border-edge rounded-xl transition shadow-hamyar"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Text Content */}
                <div className="space-y-1.5 flex-1">
                  <p dir="rtl" className="font-farsi font-bold text-ink text-sm sm:text-base leading-relaxed">
                    {item.farsiText}
                  </p>
                  {item.dariNote && (
                    <p dir="rtl" className="font-farsi text-xs text-primary font-medium bg-page p-1.5 rounded">
                      {item.dariNote}
                    </p>
                  )}
                  <p className="font-semibold text-primary text-xs sm:text-sm pt-1">
                    {item.englishText}
                  </p>
                  <p className="text-xs text-ink-muted font-mono italic">
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
                        ? 'bg-primary text-white animate-pulse'
                        : 'bg-surface group-hover:bg-primary group-hover:text-white text-ink-muted border border-edge group-hover:border-primary'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-ink-muted text-xs">
              موردی مطابق با جستجوی شما پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
