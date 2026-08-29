import React, { useState } from 'react';
import { KeyTermExplanation, UserLanguage } from '../types';
import { BookOpen, Search, Volume2, Info, ArrowRight } from 'lucide-react';

interface UkTerminologyViewProps {
  userLanguage: UserLanguage;
  onPlayAudio?: (text: string, lang: string) => void;
}

const UK_TERMS_DATABASE: KeyTermExplanation[] = [
  {
    english: 'Proof of Address',
    simpleEnglish: 'A document that shows where you live.',
    farsi: 'مدرک اثبات آدرس سکونت',
    dari: 'سند تایید آدرس سکونت',
    explanation: 'سندی رسمی (مانند نامه پناهندگی، قبض برق، یا برگه ثبت نام پزشک) که آدرس دقیق منزل شما را ثابت می‌کند.',
    category: 'housing',
    whereHeard: 'Bank, GP Surgery, Jobcentre, School',
    exampleSentence: 'Please bring two original proofs of address to your appointment.',
    relatedTerms: ['Tenancy Agreement', 'Council Tax Bill', 'ARC Card'],
  },
  {
    english: 'ARC Card (Application Registration Card)',
    simpleEnglish: 'Your official photo identity card while your asylum application is being decided.',
    farsi: 'کارت هویت پناهجویی (کارت ARC)',
    dari: 'کارت هویت رسمی پناهجویی',
    explanation: 'کارت پلاستیکی عکس‌دار اداره مهاجرت بریتانیا که هویت و حق دسترسی شما به خدمات اولیه پناهندگی را نشان می‌دهد.',
    category: 'asylum',
    whereHeard: 'Home Office, Reporting Centre, ASPEN, Hospital',
    exampleSentence: 'You must show your ARC card when attending Home Office reporting.',
    relatedTerms: ['Home Office Reference', 'Section 95', 'Bail Certificate'],
  },
  {
    english: 'Section 95 Support',
    simpleEnglish: 'Financial support and accommodation provided to eligible asylum seekers by the UK government.',
    farsi: 'حقوق و مسکن حمایتی ماده ۹۵ پناهجویان',
    dari: 'کمک مالی و مسکن دولتی پناهجویان',
    explanation: 'حمایت مالی هفتگی (کارت ASPEN) و مسکن که توسط دولت بریتانیا به پناهجویان فاقد تمکن مالی ارائه می‌شود.',
    category: 'asylum',
    whereHeard: 'Migrant Help, Home Office, Housing Caseworker',
    exampleSentence: 'Section 95 support includes housing and weekly allowance.',
    relatedTerms: ['ASPEN Card', 'Section 4', 'Migrant Help'],
  },
  {
    english: 'ASPEN Card',
    simpleEnglish: 'The debit card used by the Home Office to pay weekly asylum money.',
    farsi: 'کارت اعتباری دریافت پول هفتگی پناهندگی (ASPEN)',
    dari: 'کارت پول هفتگی پناهجویی',
    explanation: 'کارت سبزرنگی که پول هفتگی پناهندگی در آن واریز می‌شود و می‌توانید در فروشگاه‌ها خرید کنید یا پول نقد بگیرید.',
    category: 'benefits',
    whereHeard: 'Supermarket, Migrant Help, Cash Point',
    exampleSentence: 'My ASPEN card allowance is loaded every Monday.',
    relatedTerms: ['Section 95', 'PFS', 'Cash Machine'],
  },
  {
    english: 'GP (General Practitioner)',
    simpleEnglish: 'Your local family doctor in the UK NHS health system.',
    farsi: 'پزشک عمومی محل (GP)',
    dari: 'داکتر عمومی محل (GP)',
    explanation: 'اولین پزشکی که در صورت هرگونه بیماری باید به او مراجعه کنید. ثبت‌نام در GP مجانی است و ربطی به وضعیت پناهندگی ندارد.',
    category: 'healthcare',
    whereHeard: 'NHS Surgery, Pharmacy, Hospital',
    exampleSentence: 'You need to register with a local GP to get medical treatment.',
    relatedTerms: ['NHS Number', 'Prescription', 'HC1 Form'],
  },
  {
    english: 'Reporting Centre',
    simpleEnglish: 'The Home Office building where you must check in regularly.',
    farsi: 'مرکز گزارش‌دهی دوره‌ای اداره مهاجرت',
    dari: 'مرکز حضور و امضا اداره مهاجرت',
    explanation: 'مرکزی که پناهجویان طبق تاریخ‌های تعیین شده باید حضوری مراجعه کرده و امضا بزنند.',
    category: 'asylum',
    whereHeard: 'Home Office Bail Letter, Immigration Police',
    exampleSentence: 'My next reporting date at Becket House is next Tuesday.',
    relatedTerms: ['Bail Conditions', 'ARC Card', 'Caseworker'],
  },
  {
    english: 'NASS (National Asylum Support Service)',
    simpleEnglish: 'The department responsible for housing and support for asylum seekers.',
    farsi: 'سازمان ملی حمایت از پناهجویان (NASS)',
    dari: 'اداره حمایت مسکن پناهجویان',
    explanation: 'بخش مربوط به اسکان و کمک مالی پناهجویان در بریتانیا که به آن NASS گفته می‌شود.',
    category: 'asylum',
    whereHeard: 'Housing Provider, Migrant Help',
    exampleSentence: 'Quoting your NASS reference number helps track your housing application.',
    relatedTerms: ['NASS Ref', 'Section 95', 'Migrant Help'],
  },
  {
    english: 'Legal Aid',
    simpleEnglish: 'Free government funding for your legal representation and solicitor.',
    farsi: 'کمک‌هزینه حقوقی دولت برای وکیل رایگان',
    dari: 'کمک حقوقی رایگان برای گرفتن وکیل',
    explanation: 'بودجه دولتی که هزینه وکیل پناهندگی را برای افرادی که درآمد ندارند کاملاً پرداخت می‌کند.',
    category: 'legal',
    whereHeard: 'Solicitor, Law Centre, Court',
    exampleSentence: 'Most asylum claim cases are covered by UK Legal Aid.',
    relatedTerms: ['Solicitor', 'Appeal', 'Substantive Interview'],
  },
  {
    english: 'Substantive Interview',
    simpleEnglish: 'The main detailed interview about your asylum story and reasons for seeking protection.',
    farsi: 'مصاحبه اصلی و تفصیلی پناهندگی',
    dari: 'مصاحبه مفصل و اصلی پناهندگی',
    explanation: 'مصاحبه اصلی چند ساعته با اداره مهاجرت که در آن جزئیات علت ترک کشور خود را توضیح می‌دهید.',
    category: 'asylum',
    whereHeard: 'Home Office, Solicitor, Interviewer',
    exampleSentence: 'Make sure your solicitor prepares you for your substantive interview.',
    relatedTerms: ['SEF Form', 'Evidence', 'Interpreter'],
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Terms / همه اصطلاحات' },
  { id: 'asylum', label: '⚖️ Asylum & Home Office' },
  { id: 'housing', label: '🏠 Housing & Address' },
  { id: 'healthcare', label: '🩺 NHS & GP' },
  { id: 'benefits', label: '💷 Benefits & ASPEN' },
  { id: 'legal', label: '📜 Legal & Solicitors' },
];

export const UkTerminologyView: React.FC<UkTerminologyViewProps> = ({ userLanguage, onPlayAudio }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTerms = UK_TERMS_DATABASE.filter((term) => {
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesSearch =
      term.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.simpleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.farsi.includes(searchQuery) ||
      term.explanation.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-sm border border-teal-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 text-teal-200 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>UK Terminology & Culture Library</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
            <span>🇬🇧 What does this mean in the UK?</span>
            <span className="text-teal-300 font-farsi font-normal">| واژه‌نامه اصطلاحات بریتانیا</span>
          </h2>
          <p className="text-xs text-teal-100 max-w-xl">
            Clear, simple explanations of UK asylum, Home Office, NHS, and housing terms in plain English, Farsi, and Dari.
          </p>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UK terms (e.g. Proof of address, ARC card, GP, Legal Aid)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Cards */}
      <div className="space-y-4">
        {filteredTerms.map((t, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs hover:shadow-xs transition space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-100">
                  {t.category?.toUpperCase()}
                </span>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 mt-1">
                  <span>{t.english}</span>
                </h3>
              </div>

              {onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(t.english, 'en-GB')}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-semibold flex items-center gap-1 shrink-0"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  <span className="hidden sm:inline">Pronounce</span>
                </button>
              )}
            </div>

            {/* Simple English Definition */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <p className="font-semibold text-slate-900 mb-0.5">Simple English:</p>
              <p>{t.simpleEnglish}</p>
            </div>

            {/* Farsi & Dari Translations */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dir-rtl">
              <div className="flex items-center gap-2">
                <span className="font-farsi font-bold text-teal-800 text-sm">
                  {t.farsi}
                </span>
                {t.dari && (
                  <span className="font-farsi text-xs text-slate-500 font-normal">
                    (دری: {t.dari})
                  </span>
                )}
              </div>
              <p className="font-farsi text-xs text-slate-700 leading-relaxed">
                {t.explanation}
              </p>
            </div>

            {/* Context details: Where heard + example sentence */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-100">
              {t.whereHeard && (
                <div>
                  <span className="font-semibold text-slate-700">Where you hear it: </span>
                  <span>{t.whereHeard}</span>
                </div>
              )}
              {t.exampleSentence && (
                <div className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-800">
                  "{t.exampleSentence}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
