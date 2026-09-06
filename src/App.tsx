import React, { useState, useEffect, useRef } from 'react';
import { TranslationDirection, InterpretationResult, EmbedSettings, QuickPhrase, SavedPhrase, AppTab, UserLanguage } from './types';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { BackBar } from './components/BackBar';
import { PrivacyBanner } from './components/PrivacyBanner';
import { FormCompanion } from './formCompanion/FormCompanion';
import { MessageWriterView } from './components/MessageWriterView';
import { SayItForMeModal } from './components/SayItForMeModal';
import { UkTerminologyView } from './components/UkTerminologyView';
import { DocumentOrganiserView } from './components/DocumentOrganiserView';
import { AudioVoiceInput } from './components/AudioVoiceInput';
import { TextInputSection } from './components/TextInputSection';
import { InterpretationCard } from './components/InterpretationCard';
import { ConversationHistory } from './components/ConversationHistory';
import { QuickPhrasesDrawer } from './components/QuickPhrasesDrawer';
import { RefugeeLexiconModal } from './components/RefugeeLexiconModal';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SavedPhrasesModal } from './components/SavedPhrasesModal';
import { ConversationSummaryModal } from './components/ConversationSummaryModal';
import { PinnedDetailsBar } from './components/PinnedDetailsBar';
import { LetterScannerModal } from './components/LetterScannerModal';
import { FormUploadModal } from './components/FormUploadModal';
import { playSpokenAudio, ensureVoicesLoaded, primeAudioPlayback, preCacheCommonPhrases } from './utils/audioHelper';
import { extractKeyDetails } from './utils/detailExtractor';
import { QUICK_PHRASES } from './data/quickPhrases';
import { 
  Mic, 
  Keyboard, 
  Sparkles, 
  ShieldCheck, 
  Lock,
  Camera,
  Edit3,
  Scale,
  Home,
  HeartPulse,
  Wallet,
  Briefcase,
  GraduationCap,
  Siren,
  FileText,
  Volume2,
  AlertTriangle,
  Heart,
  Info,
  Star,
  ArrowRight,
  CheckSquare,
  BookOpen,
  FolderLock
} from 'lucide-react';

/** A failure the person needs to see, in both languages. */
interface AppError {
  fa: string;
  en: string;
  /** Technical cause, shown small, for whoever is running the site. */
  detail?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  /**
   * The screens behind this one. Every move forward pushes an entry here and a
   * matching entry into the browser's history, so the phone's back gesture, the
   * browser's back button and the app's own back button are the same action.
   * Before this, none of the three worked: the app was tab state and nothing
   * else, so pressing back left the site.
   */
  const [tabTrail, setTabTrail] = useState<AppTab[]>([]);
  const [direction, setDirection] = useState<TranslationDirection>('farsi_to_english');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [dialectHint, setDialectHint] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<InterpretationResult | null>(null);
  const [history, setHistory] = useState<InterpretationResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<AppError | null>(null);
  /** Set when the translation arrived but could not be read aloud. */
  const [speechNotice, setSpeechNotice] = useState<'farsi_voice' | null>(null);

  // New features state
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);
  const [pinnedDetails, setPinnedDetails] = useState<string[]>([]);
  const [isSayItForMeOpen, setIsSayItForMeOpen] = useState<boolean>(false);

  // Modals state
  const [isQuickPhrasesOpen, setIsQuickPhrasesOpen] = useState<boolean>(false);
  const [isLexiconOpen, setIsLexiconOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSavedPhrasesOpen, setIsSavedPhrasesOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isLetterScannerOpen, setIsLetterScannerOpen] = useState<boolean>(false);
  const [isFormUploadOpen, setIsFormUploadOpen] = useState<boolean>(false);
  const [selectedFormForCompanion, setSelectedFormForCompanion] = useState<string | null>(null);
  const [customUploadedForm, setCustomUploadedForm] = useState<any | null>(null);
  // True while a form is open: the document owns the screen, so the app header,
  // tab strip and footer stand down rather than pushing it below the fold.
  const [isFormImmersive, setIsFormImmersive] = useState<boolean>(false);

  // App / Embed settings
  const [settings, setSettings] = useState<EmbedSettings>({
    theme: 'teal',
    compactMode: false,
    autoSpeak: true,
    voiceSpeed: 0.95,
    defaultDialect: 'all',
    targetAudience: 'refugee_first',
    fontSize: 'normal',
    userLanguage: 'farsi',
  });

  const [isEmbedParam, setIsEmbedParam] = useState<boolean>(false);
  const mainInputRef = useRef<HTMLDivElement>(null);

  /**
   * Move to a screen. Records where we came from, in our own state and in the
   * browser's, so that back means the same thing whichever back you press.
   */
  const goToTab = (tab: AppTab) => {
    if (tab === activeTab) return;
    const trail = [...tabTrail, activeTab];
    setTabTrail(trail);
    setActiveTab(tab);
    try {
      window.history.pushState({ hamyarTab: tab, hamyarTrail: trail }, '');
    } catch {
      // Some embedded webviews refuse pushState. The app still navigates; only
      // the hardware back button loses its way, and the button on screen does not.
    }
  };

  /**
   * Home, without stacking another entry when home is already one step behind.
   * Otherwise "back to home" would leave a back button pointing forwards.
   */
  const goHome = () => {
    if (tabTrail[tabTrail.length - 1] === 'home') {
      goBack();
      return;
    }
    goToTab('home');
  };

  /** One step back, to the screen named on the button. */
  const goBack = () => {
    const previous = tabTrail[tabTrail.length - 1];
    if (!previous) return;
    const state = window.history.state as { hamyarTab?: AppTab } | null;
    if (state && state.hamyarTab) {
      // Let the browser drive, so its back button and ours cannot disagree.
      window.history.back();
      return;
    }
    setTabTrail((trail) => trail.slice(0, -1));
    setActiveTab(previous);
  };

  // The browser's back button, and on Android the hardware one, land here.
  useEffect(() => {
    try {
      window.history.replaceState({ hamyarTab: 'home', hamyarTrail: [] }, '');
    } catch {
      /* see goToTab */
    }

    const onPopState = (event: PopStateEvent) => {
      const state = (event.state || {}) as { hamyarTab?: AppTab; hamyarTrail?: AppTab[] };
      setActiveTab(state.hamyarTab || 'home');
      setTabTrail(state.hamyarTrail || []);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    ensureVoicesLoaded().catch((e) => console.warn('Voice pre-load note:', e));
    preCacheCommonPhrases(QUICK_PHRASES);

    try {
      const params = new URLSearchParams(window.location.search);
      const isEmbed = params.get('embed') === 'true' || window.self !== window.top;
      setIsEmbedParam(isEmbed);

      const savedHistory = localStorage.getItem('refugee_interpreter_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedList = localStorage.getItem('refugee_saved_phrases');
      if (savedList) {
        setSavedPhrases(JSON.parse(savedList));
      }

      const savedPins = localStorage.getItem('refugee_pinned_details');
      if (savedPins) {
        setPinnedDetails(JSON.parse(savedPins));
      }
    } catch (e) {
      console.warn('LocalStorage access note:', e);
    }
  }, []);

  const saveToHistory = (newResult: InterpretationResult) => {
    setHistory((prev) => {
      const updated = [newResult, ...prev.slice(0, 29)];
      try {
        localStorage.setItem('refugee_interpreter_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const extracted = extractKeyDetails(newResult.sourceText).concat(
      extractKeyDetails(newResult.translatedText)
    );
    if (extracted.length > 0) {
      setPinnedDetails((prev) => {
        const next = Array.from(new Set([...prev, ...extracted]));
        try {
          localStorage.setItem('refugee_pinned_details', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('refugee_interpreter_history');
    } catch (e) {}
  };

  const handleAddSavedPhrase = (phrase: { farsiText: string; englishText: string; label: string }) => {
    const newItem: SavedPhrase = {
      id: `sp_${Date.now()}`,
      createdAt: Date.now(),
      ...phrase,
    };
    setSavedPhrases((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('refugee_saved_phrases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteSavedPhrase = (id: string) => {
    setSavedPhrases((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('refugee_saved_phrases', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleNotWhatIMeant = (id: string, dir: TranslationDirection) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
    setDirection(dir);
    setInputMode('voice');
  };

  const handleRateResult = (id: string, rating: 'up' | 'down') => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rating } : item))
    );
    if (currentResult?.id === id) {
      setCurrentResult((prev) => (prev ? { ...prev, rating } : null));
    }
  };

  const handleRemovePinnedDetail = (detail: string) => {
    setPinnedDetails((prev) => {
      const next = prev.filter((d) => d !== detail);
      try {
        localStorage.setItem('refugee_pinned_details', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleClearPinnedDetails = () => {
    setPinnedDetails([]);
    try {
      localStorage.removeItem('refugee_pinned_details');
    } catch (e) {}
  };

  const triggerAutoSpeech = async (result: InterpretationResult) => {
    if (!settings.autoSpeak) return;
    try {
      if (result.direction === 'farsi_to_english') {
        await playSpokenAudio(result.britishPhrasing || result.translatedText, 'en-GB', {
          rate: settings.voiceSpeed,
        });
      } else {
        await playSpokenAudio(result.translatedText, 'fa-IR', {
          rate: settings.voiceSpeed,
          // Most devices carry no Persian voice, so when the server audio
          // cannot be reached there is nothing left to speak with. Saying so
          // is better than a button that appears to do nothing.
          onUnavailable: () => setSpeechNotice('farsi_voice'),
        });
      }
    } catch (err) {
      console.warn('Auto speech error:', err);
    }
  };

  /**
   * Turn a failure into something a person can act on, in both languages.
   *
   * Two rules here. The raw text of a failure never reaches the screen: the
   * provider's errors are JSON full of billing links and project ids, and a
   * person holding a Home Office letter should not be reading that. And when
   * the fault is ours rather than theirs, the message says so - otherwise
   * someone with shaky English assumes they pressed the wrong thing and stops
   * trying.
   */
  const describeError = (rawError: any): AppError => {
    const msg =
      typeof rawError === 'string' ? rawError : rawError?.message || String(rawError || '');
    const kind: string =
      rawError?.kind ||
      (rawError?.name === 'TimeoutError' || rawError?.name === 'AbortError' ? 'timeout' : '');

    // The service is up, but the account behind it has run dry. Nothing the
    // person can do will change that, so do not tell them to try again.
    if (kind === 'quota' || kind === 'no_key') {
      return {
        fa: 'در حال حاضر نمی‌توانیم به سرویس ترجمه وصل شویم. این ایراد از برنامه است، نه از شما یا گوشی‌تان. لطفاً بعداً دوباره سر بزنید.',
        en: 'We cannot reach the translation service at the moment. This is a problem with the app, not with you or your phone. Please try again later.',
        detail:
          kind === 'quota'
            ? "The app's translation service has run out of credit and needs topping up."
            : 'The translation service has no valid API key configured.',
      };
    }

    if (kind === 'rate_limit') {
      return {
        fa: 'سرویس ترجمه الان شلوغ است. یک دقیقه صبر کنید و دوباره تلاش کنید.',
        en: 'The translation service is busy right now. Wait a minute and try again.',
      };
    }

    if (kind === 'timeout' || /timeout|aborted/i.test(msg)) {
      return {
        fa: 'پاسخ خیلی طول کشید. اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.',
        en: 'That took too long. Check your connection and try again.',
      };
    }

    if (!navigator.onLine) {
      return {
        fa: 'به اینترنت وصل نیستید. اتصال خود را بررسی کنید و دوباره تلاش کنید.',
        en: 'You are not connected to the internet. Check your connection and try again.',
      };
    }

    return {
      fa: 'ترجمه انجام نشد. دوباره تلاش کنید یا به جای صدا، متن خود را تایپ کنید.',
      en: 'The translation did not go through. Try again, or type your message instead.',
    };
  };

  const handleAudioReady = async (base64Audio: string, mimeType: string, overrideDirection?: TranslationDirection) => {
    primeAudioPlayback();
    setIsProcessing(true);
    setErrorMessage(null);
    setSpeechNotice(null);
    const activeDir = overrideDirection || direction;
    if (activeDir !== direction) {
      setDirection(activeDir);
    }

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          audio: base64Audio,
          mimeType,
          direction: activeDir,
          dialectHint: dialectHint !== 'all' ? dialectHint : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw Object.assign(new Error(errData.error || 'Server error while interpreting audio'), {
          kind: errData.kind,
        });
      }

      const data: InterpretationResult = await res.json();
      setCurrentResult(data);
      saveToHistory(data);
      triggerAutoSpeech(data);
    } catch (err: any) {
      console.warn('Audio interpretation issue:', err?.message || err);
      setErrorMessage(describeError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async (text: string, overrideDirection?: TranslationDirection) => {
    primeAudioPlayback();
    setIsProcessing(true);
    setErrorMessage(null);
    setSpeechNotice(null);
    const activeDir = overrideDirection || direction;
    if (activeDir !== direction) {
      setDirection(activeDir);
    }

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          text,
          direction: activeDir,
          dialectHint: dialectHint !== 'all' ? dialectHint : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw Object.assign(new Error(errData.error || 'Server error while interpreting text'), {
          kind: errData.kind,
        });
      }

      const data: InterpretationResult = await res.json();
      setCurrentResult(data);
      saveToHistory(data);
      triggerAutoSpeech(data);
    } catch (err: any) {
      console.warn('Text interpretation issue:', err?.message || err);
      const matched = QUICK_PHRASES.find(
        (p) =>
          p.farsiText.trim() === text.trim() ||
          p.englishText.toLowerCase() === text.trim().toLowerCase()
      );

      if (matched) {
        const fallbackResult: InterpretationResult = {
          id: `res_local_${Date.now()}`,
          timestamp: Date.now(),
          direction: activeDir,
          sourceText: text,
          translatedText: activeDir === 'farsi_to_english' ? matched.englishText : matched.farsiText,
          britishPhrasing: activeDir === 'farsi_to_english' ? matched.englishText : undefined,
          phoneticSpelling: matched.phonetic,
        };
        setCurrentResult(fallbackResult);
        saveToHistory(fallbackResult);
        triggerAutoSpeech(fallbackResult);
      } else {
        setErrorMessage(describeError(err));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectQuickPhrase = (phrase: QuickPhrase) => {
    primeAudioPlayback();
    handleTextSubmit(phrase.farsiText);
  };

  const scrollToInput = (mode: 'voice' | 'text') => {
    goToTab('interpreter');
    setInputMode(mode);
    if (mainInputRef.current) {
      mainInputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSpeakQuickPhrase = async (englishText: string, farsiText: string) => {
    primeAudioPlayback();
    playSpokenAudio(farsiText, 'fa-IR');
    handleTextSubmit(farsiText);
  };

  const userLang = settings.userLanguage || 'farsi';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-600 selection:text-white print:bg-white print:p-0 print:pb-0 print:text-black w-full max-w-full overflow-x-hidden ${isFormImmersive ? '' : 'pb-16'}`}>
      {/* Header */}
      {!isFormImmersive && (
      <Header
        direction={direction}
        onToggleDirection={() =>
          setDirection((d) => (d === 'farsi_to_english' ? 'english_to_farsi' : 'farsi_to_english'))
        }
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onOpenQuickPhrases={() => setIsQuickPhrasesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSayItForMe={() => setIsSayItForMeOpen(true)}
        selectedDialectHint={dialectHint}
        onSelectDialectHint={setDialectHint}
      />
      )}

      {/* Navigation. A row here on wide screens, a bar at the foot of the
          screen on phones. Rendered once; which one shows is a matter of
          width. */}
      {!isFormImmersive && <NavigationTabs activeTab={activeTab} onTabChange={goToTab} />}

      {/* Back. Directly under the navigation, on every screen that has
          somewhere to go back to, which is every screen except home. */}
      {!isFormImmersive && tabTrail.length > 0 && (
        <BackBar destination={tabTrail[tabTrail.length - 1]} onBack={goBack} />
      )}

      {/* Main Container */}
      <main
        className={
          isFormImmersive
            ? 'flex-1 w-full min-w-0'
            : 'flex-1 max-w-6xl w-full mx-auto p-3.5 sm:p-6 space-y-6 sm:space-y-7 min-w-0 pb-24 md:pb-6'
        }
      >
        {/* A failed interpretation used to leave the screen silent: the error
            was recorded in state and never rendered anywhere, so a recording
            that did not come back simply vanished. It is shown here, above
            whichever tab is open, because both the home and the interpreter
            inputs set it. */}
        {errorMessage && !isFormImmersive && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-farsi text-sm font-bold text-rose-900 leading-relaxed" dir="rtl">
                {errorMessage.fa}
              </p>
              <p className="text-xs text-rose-800 leading-relaxed">{errorMessage.en}</p>
              {/* The cause is for whoever runs the site, not for the person
                  trying to speak to a nurse, so it is folded away rather than
                  printed under their message. */}
              {errorMessage.detail && (
                <details className="pt-0.5">
                  <summary className="text-xs text-rose-500 cursor-pointer select-none">
                    جزئیات فنی · Technical details
                  </summary>
                  <p className="text-xs text-rose-500 break-words pt-1">{errorMessage.detail}</p>
                </details>
              )}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="shrink-0 text-xs font-bold text-rose-700 hover:text-rose-900 underline underline-offset-2 cursor-pointer font-farsi"
            >
              بستن
            </button>
          </div>
        )}

        {/* The translation arrived but nothing could say it. Silence reads as
            a broken app, so it is named - and this is amber, not red, because
            the translation itself is on screen and still usable. */}
        {speechNotice === 'farsi_voice' && !isFormImmersive && (
          <div
            role="status"
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
          >
            <Volume2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-farsi text-sm font-bold text-amber-900 leading-relaxed" dir="rtl">
                ترجمه آماده است، ولی صدای فارسی در این لحظه در دسترس نیست. متن را می‌توانید
                بخوانید یا به طرف مقابل نشان بدهید.
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                The translation is ready, but Farsi audio is not available right now. You can
                still read it or show it to someone.
              </p>
            </div>
            <button
              onClick={() => setSpeechNotice(null)}
              className="shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 cursor-pointer font-farsi"
            >
              بستن
            </button>
          </div>
        )}

        {/* TAB 1: HOME HUB */}
        {activeTab === 'home' && (
          <div className="space-y-6 sm:space-y-7 w-full min-w-0">
            {/* What this is, before anything else. Someone arriving here has
                usually been sent by a support worker and does not yet know
                what the app does. Persian block, then English block. */}
            <section className="grid md:grid-cols-[1fr_auto] items-center gap-6 md:gap-8">
              <div className="space-y-4 order-2 md:order-1">
                <div dir="rtl" className="space-y-2">
                  <h2 className="font-farsi text-2xl sm:text-3xl font-bold text-ink leading-tight">
                    تازه به بریتانیا آمده‌اید؟
                  </h2>
                  <p className="font-farsi text-lg text-ink-muted leading-relaxed">
                    همیار به شما کمک می‌کند حرفتان را بزنید، نامه‌های رسمی را بفهمید و
                    فرم‌های NHS و اداره مهاجرت را پر کنید. به فارسی و دری.
                  </p>
                </div>
                <div className="space-y-1 border-t border-edge pt-4">
                  <h3 className="text-xl font-bold text-ink">Just arrived in the UK?</h3>
                  <p className="text-base text-ink-muted leading-relaxed">
                    Hamyar helps you be understood, read the letters you are sent, and fill in NHS
                    and Home Office forms, in Farsi and Dari.
                  </p>
                </div>
              </div>
              <img
                src="/brand/just-arrived-in-the-uk.png"
                alt=""
                width={1187}
                height={959}
                className="order-1 md:order-2 w-full max-w-[260px] sm:max-w-[300px] h-auto mx-auto"
              />
            </section>

            {/* Privacy & Trust Banner */}
            <PrivacyBanner />

            {/* HEADING SECTION */}
            <div className="text-center space-y-1.5 pt-1 w-full min-w-0 px-2">
              <p dir="rtl" className="font-farsi font-bold text-ink text-xl break-words">
                امروز چه کمکی از ما ساخته است؟
              </p>
              <h2 className="text-lg font-bold text-ink-muted tracking-tight break-words">
                How can we help you today?
              </h2>
            </div>

            {/* 4 PRIMARY ACTION CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0">
              {/* Card 1: Talk to someone */}
              <div
                onClick={() => goToTab('interpreter')}
                className="group bg-gradient-to-b from-teal-50/70 to-teal-50/40 border-2 border-teal-200/90 hover:border-teal-500 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 sm:space-y-5 w-full min-w-0"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 break-words">Talk to someone</h3>
                    <p className="text-xs text-slate-500 font-medium break-words">Live audio interpretation</p>
                    <h4 dir="rtl" className="font-farsi font-bold text-teal-800 text-base mt-2 break-words">با کسی صحبت کنید</h4>
                    <p dir="rtl" className="font-farsi text-xs text-slate-500 break-words">ترجمه زنده و همزمان</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-200/60 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span>Start live interpreter →</span>
                  <span className="font-farsi">شروع گفتگو</span>
                </div>
              </div>

              {/* Card 2: Understand a letter */}
              <div
                onClick={() => setIsLetterScannerOpen(true)}
                className="group bg-gradient-to-b from-teal-50/70 to-slate-50/40 border-2 border-teal-200/90 hover:border-teal-500 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 sm:space-y-5 w-full min-w-0"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:scale-105 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 break-words">Understand a letter</h3>
                    <p className="text-xs text-slate-500 font-medium break-words">Photo analysis & deadlines</p>
                    <h4 dir="rtl" className="font-farsi font-bold text-teal-900 text-base mt-2 break-words">یک نامه را بفهمید</h4>
                    <p dir="rtl" className="font-farsi text-xs text-slate-500 break-words">عکس نامه و خلاصه فارسی</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-200/60 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span>Scan letter now →</span>
                  <span className="font-farsi">اسکن نامه</span>
                </div>
              </div>

              {/* Card 3: Fill in a form */}
              <div
                onClick={() => {
                  setSelectedFormForCompanion(null);
                  setCustomUploadedForm(null);
                  goToTab('form_companion');
                }}
                className="group bg-gradient-to-b from-teal-50/70 to-slate-50/40 border-2 border-teal-300 hover:border-teal-600 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 sm:space-y-5 w-full min-w-0"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 break-words">Fill in a form</h3>
                    <p className="text-xs text-slate-500 font-medium break-words">Guided question-by-question</p>
                    <h4 dir="rtl" className="font-farsi font-bold text-teal-950 text-base mt-2 break-words">یک فرم را تکمیل کنید</h4>
                    <p dir="rtl" className="font-farsi text-xs text-slate-500 break-words">پاسخ صوتی و بررسی پاسخ‌ها</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-300/60 flex items-center justify-between text-xs font-bold text-teal-900">
                  <span>Start form guide →</span>
                  <span className="font-farsi">تکمیل فرم</span>
                </div>
              </div>

              {/* Card 4: Write a message */}
              <div
                onClick={() => goToTab('message_writer')}
                className="group bg-teal-50/40 border-2 border-teal-200 hover:border-teal-600 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 sm:space-y-5 w-full min-w-0"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary group-hover:scale-105 transition">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 break-words">Write a message</h3>
                    <p className="text-xs text-slate-500 font-medium break-words">Polite UK English messages</p>
                    <h4 dir="rtl" className="font-farsi font-bold text-teal-900 text-base mt-2 break-words">یک پیام را بنویسید</h4>
                    <p dir="rtl" className="font-farsi text-xs text-slate-500 break-words">ارسال پیام به مسئول پرونده</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-300/60 flex items-center justify-between text-xs font-bold text-teal-900">
                  <span>Write message →</span>
                  <span className="font-farsi">نوشتن پیام</span>
                </div>
              </div>
            </div>

            {/* LINK TO OFFICIAL FORMS & COMPANION */}
            <div 
              onClick={() => {
                setSelectedFormForCompanion(null);
                setCustomUploadedForm(null);
                goToTab('form_companion');
              }}
              className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-sm hover:border-slate-700 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-farsi dir-rtl group w-full min-w-0"
            >
              <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-950/80 border border-teal-700/60 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-white group-hover:text-amber-200 transition break-words">
                      همراه تکمیل فرم‌های رسمی (NHS, Home Office, Council)
                    </h3>
                    <span className="text-xs font-bold text-teal-300 bg-teal-950/90 px-2 py-0.5 rounded-md border border-teal-800/80 shrink-0">
                      آرشیو رسمی و آپلود
                    </span>
                  </div>
                  <p className="text-xs sm:text-xs text-slate-300 leading-relaxed break-words">
                    راهنمای خانه‌به‌خانه، ترجمه پرسش‌ها به فارسی و دری، و بررسی خط‌به‌خط مدارک کاغذی.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFormForCompanion(null);
                    setCustomUploadedForm(null);
                    goToTab('form_companion');
                  }}
                  className="min-h-[48px] w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>مشاهده آرشیو فرم‌ها</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>

            {/* QUICK INTERPRETER INLINE PREVIEW */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-4 w-full min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Mic className="w-5 h-5 text-teal-600 shrink-0" />
                    <span>Quick Speech / Text Interpreter</span>
                  </h3>
                  <p className="text-xs text-slate-500">Fast translation for immediate conversations</p>
                </div>
                <button
                  onClick={() => setIsSayItForMeOpen(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>SAY IT FOR ME </span>
                </button>
              </div>

              {/* Input section */}
              <TextInputSection
                direction={direction}
                dialectHint={dialectHint}
                isProcessing={isProcessing}
                onTextSubmit={handleTextSubmit}
                onChangeDirection={(dir) => setDirection(dir)}
                onSwitchToVoice={() => goToTab('interpreter')}
              />

              {currentResult && (
                <InterpretationCard
                  result={currentResult}
                  settings={settings}
                  onNotWhatIMeant={handleNotWhatIMeant}
                  onSavePhrase={handleAddSavedPhrase}
                  onRateResult={handleRateResult}
                />
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE INTERPRETER */}
        {activeTab === 'interpreter' && (
          <div className="space-y-6">
            {/* Persian block, then English block. This heading used to read
                "Talk to someone / گفتگو با کسی" on one line, where the two
                reading directions met in the middle and neither language had a
                clean place to start. */}
            <div className="bg-teal-900 text-white p-6 rounded-2xl border border-teal-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-100 text-sm font-semibold mb-3">
                <Mic className="w-4 h-4" />
                <span>Live voice interpreter</span>
              </div>
              <h2 className="font-farsi text-2xl font-bold leading-tight" dir="rtl">
                گفتگو با کسی
              </h2>
              <p className="font-farsi text-base text-teal-100 mt-1" dir="rtl">
                به فارسی یا دری صحبت کنید. حرف شما را بلند به انگلیسی می‌گوییم.
              </p>
              <p className="text-base text-teal-100/90 mt-3">
                <span className="block font-bold text-white">Talk to someone</span>
                Speak in Farsi or Dari. We translate your words aloud into natural British English.
              </p>
            </div>

            {/* A genuine "read this before you continue", so it wears the
                attention colour, which nothing decorative may now use. */}
            <div className="p-4 bg-attention-bg border-l-4 border-attention rounded-lg space-y-2">
              <p className="font-farsi text-base font-bold text-attention" dir="rtl">
                مترجم NHS رایگان است
              </p>
              <p className="font-farsi text-base text-ink" dir="rtl">
                برای قرارهای پزشکی یا مصاحبهٔ اداره مهاجرت، همیشه مترجم رسمی بخواهید.
              </p>
              <p className="text-sm text-ink-muted pt-1">
                NHS interpreters are free. Always request an official interpreter for medical or Home
                Office interviews.
              </p>
            </div>

            {inputMode === 'voice' ? (
              <AudioVoiceInput
                direction={direction}
                dialectHint={dialectHint}
                isProcessing={isProcessing}
                onAudioReady={handleAudioReady}
                onChangeDirection={(dir) => setDirection(dir)}
                onSwitchToText={() => setInputMode('text')}
              />
            ) : (
              <TextInputSection
                direction={direction}
                dialectHint={dialectHint}
                isProcessing={isProcessing}
                onTextSubmit={handleTextSubmit}
                onChangeDirection={(dir) => setDirection(dir)}
                onSwitchToVoice={() => setInputMode('voice')}
              />
            )}

            {currentResult && (
              <InterpretationCard
                result={currentResult}
                settings={settings}
                onNotWhatIMeant={handleNotWhatIMeant}
                onSavePhrase={handleAddSavedPhrase}
                onRateResult={handleRateResult}
              />
            )}

            <ConversationHistory
              history={history}
              settings={settings}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}

        {/* TAB 3: LETTER SCANNER */}
        {activeTab === 'letter_scanner' && (
          <div className="space-y-6">
            <div className="bg-teal-900 text-white p-6 rounded-3xl border border-teal-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Understand a letter</h2>
                <p className="text-lg font-bold font-farsi" dir="rtl">فهمیدن یک نامه</p>
                <p className="text-xs text-teal-200 font-farsi leading-relaxed" dir="rtl">
                  از نامه عکس بگیرید یا فایل PDF آن را اضافه کنید تا به زبان ساده برایتان توضیح دهیم.
                </p>
                <p className="text-xs text-teal-200/90">
                  Take a photo or add a PDF, and get it explained in plain English and Farsi.
                </p>
              </div>
              <button
                onClick={() => setIsLetterScannerOpen(true)}
                className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-2"
              >
                <span>Start</span>
                <span className="font-farsi">| شروع</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-4">
              <Camera className="w-12 h-12 text-teal-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Add an official letter</h3>
                <p className="font-bold text-slate-900 text-base font-farsi" dir="rtl">نامه رسمی خود را اضافه کنید</p>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto font-farsi leading-relaxed" dir="rtl">
                نامه‌های هوم آفیس، NHS، شورای شهر، مسکن و مطب دکتر را می‌خوانیم و می‌گوییم این نامه چیست، چه نوشته،
                چه کاری باید انجام دهید و تاریخ‌های مهم آن کدام است.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We read official UK letters (Home Office, NHS, Housing, GP, Council) and explain what it is, what it
                says, what you must do, and the dates that matter.
              </p>
              <button
                onClick={() => setIsLetterScannerOpen(true)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-xs inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Take a photo or add a PDF</span>
                <span className="font-farsi">| عکس بگیرید یا PDF اضافه کنید</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: FORM COMPANION */}
        {activeTab === 'form_companion' && (
          <FormCompanion
            userLanguage={userLang}
            onGoBackToHome={goHome}
            onPlayAudio={(txt, lang) => playSpokenAudio(txt, lang)}
            onOpenUploadModal={() => setIsFormUploadOpen(true)}
            onClearCustomForm={() => {
              setCustomUploadedForm(null);
              setSelectedFormForCompanion(null);
            }}
            initialFormId={selectedFormForCompanion}
            customUploadedForm={customUploadedForm}
            onImmersiveChange={setIsFormImmersive}
          />
        )}

        {/* TAB 5: MESSAGE WRITER */}
        {activeTab === 'message_writer' && (
          <MessageWriterView
            userLanguage={userLang}
            onPlayAudio={(txt, lang) => playSpokenAudio(txt, lang)}
          />
        )}

        {/* TAB 6: UK TERMS & PHRASES */}
        {activeTab === 'phrases' && (
          <UkTerminologyView
            userLanguage={userLang}
            onPlayAudio={(txt, lang) => playSpokenAudio(txt, lang)}
          />
        )}

        {/* TAB 7: MY DOCUMENTS */}
        {activeTab === 'documents' && (
          <DocumentOrganiserView userLanguage={userLang} />
        )}

        {/* TAB 8: MORE */}
        {activeTab === 'more' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* The three destinations that came out of the navigation bar when
                it went from eight to five. They are not buried: this is the
                first thing on the screen that replaced them. */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-lg font-farsi" dir="rtl">
                بخش‌های دیگر
              </h3>
              <p className="text-ink-muted text-sm -mt-1">Other sections</p>
              <div className="space-y-2">
                {[
                  { tab: 'message_writer' as AppTab, fa: 'نوشتن پیام', en: 'Message writer' },
                  { tab: 'phrases' as AppTab, fa: 'اصطلاحات بریتانیا', en: 'UK terms and phrases' },
                  { tab: 'documents' as AppTab, fa: 'مدارک من', en: 'My documents' },
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => goToTab(item.tab)}
                    className="w-full min-h-[44px] p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition"
                  >
                    <span className="text-left">
                      <span className="block font-farsi font-bold text-base text-slate-900" dir="rtl">
                        {item.fa}
                      </span>
                      <span className="block text-sm text-ink-muted">{item.en}</span>
                    </span>
                    <ArrowRight className="w-5 h-5 text-ink-muted shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-base">More Settings & Resources</h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>App Settings & Voice Preferences</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setIsSavedPhrasesOpen(true)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>Saved Phrases ({savedPhrases.length})</span>
                  <span>→</span>
                </button>
                <button
                  onClick={() => setIsLexiconOpen(true)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-left font-bold text-slate-800 flex items-center justify-between"
                >
                  <span>Refugee Lexicon Modal</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* SAY IT FOR ME FLOATING ACTION BUTTON (Moved/hidden appropriately when on form companion to never block bottom next buttons) */}
      {/* Pinned Details Bar at Bottom */}
      {!isFormImmersive && (
        <PinnedDetailsBar
          details={pinnedDetails}
          onClearDetails={handleClearPinnedDetails}
          onRemoveDetail={handleRemovePinnedDetail}
        />
      )}

      {/* Footer. The phone navigation is fixed over the bottom of the page,
          so the footer needs to clear it or it never fully appears. */}
      <footer
        className={`mt-auto border-t border-edge bg-surface py-6 px-4 print:hidden w-full max-w-full pb-28 md:pb-6 ${
          isFormImmersive ? 'hidden' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto space-y-4 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8">
            <p dir="rtl" className="font-farsi text-sm text-ink-muted leading-relaxed flex-1 min-w-0">
              این برنامه فقط ترجمه و اطلاعات عمومی ارائه می‌دهد و جایگزین مشاورهٔ حقوقی نیست.
            </p>
            <p className="text-sm text-ink-muted leading-relaxed flex-1 min-w-0">
              This app provides translation and general information only. It is not a solicitor and
              does not replace legal advice.
            </p>
          </div>

          <div className="border-t border-edge pt-4 text-center">
            <p className="text-sm text-ink-muted">
              Powered by{' '}
              <a
                href="https://mehrhealth.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary underline underline-offset-2 hover:no-underline"
              >
                Mehr Health CIC
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SayItForMeModal
        isOpen={isSayItForMeOpen}
        onClose={() => setIsSayItForMeOpen(false)}
        onPlayAudio={(txt, lang) => playSpokenAudio(txt, lang)}
      />

      <QuickPhrasesDrawer
        isOpen={isQuickPhrasesOpen}
        onClose={() => setIsQuickPhrasesOpen(false)}
        onSelectPhrase={handleSelectQuickPhrase}
        onSpeakPhrase={(en, fa) => handleSpeakQuickPhrase(en, fa)}
      />

      <RefugeeLexiconModal
        isOpen={isLexiconOpen}
        onClose={() => setIsLexiconOpen(false)}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        onClearHistory={handleClearHistory}
        historyCount={history.length}
        onOpenLexicon={() => setIsLexiconOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      <SavedPhrasesModal
        isOpen={isSavedPhrasesOpen}
        onClose={() => setIsSavedPhrasesOpen(false)}
        savedPhrases={savedPhrases}
        onAddPhrase={handleAddSavedPhrase}
        onDeletePhrase={handleDeleteSavedPhrase}
        onSelectPhrase={(farsi, english) => handleTextSubmit(farsi)}
      />

      <ConversationSummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        results={history}
      />

      <LetterScannerModal
        isOpen={isLetterScannerOpen}
        onClose={() => setIsLetterScannerOpen(false)}
      />

      <FormUploadModal
        isOpen={isFormUploadOpen}
        onClose={() => setIsFormUploadOpen(false)}
        onStartPresetForm={(formId, customFormData) => {
          setIsFormUploadOpen(false);
          setCustomUploadedForm(customFormData || null);
          setSelectedFormForCompanion(formId || null);
          goToTab('form_companion');
        }}
      />
    </div>
  );
}
