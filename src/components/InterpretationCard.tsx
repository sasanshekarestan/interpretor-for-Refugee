import React, { useState } from 'react';
import { InterpretationResult, EmbedSettings, TranslationDirection } from '../types';
import { 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  BookOpen, 
  Flame,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  X,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { playSpokenAudio, stopAllSpeech } from '../utils/audioHelper';

interface InterpretationCardProps {
  result: InterpretationResult;
  settings: EmbedSettings;
  onPlaySpeech?: (text: string) => void;
  onNotWhatIMeant?: (id: string, direction: TranslationDirection) => void;
  onSavePhrase?: (phrase: { farsiText: string; englishText: string; label: string }) => void;
  onRateResult?: (id: string, rating: 'up' | 'down') => void;
}

export const InterpretationCard: React.FC<InterpretationCardProps> = ({
  result,
  settings,
  onNotWhatIMeant,
  onSavePhrase,
  onRateResult,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'standard' | 'formal' | 'phonetic'>('standard');
  const [showHandOverModal, setShowHandOverModal] = useState<boolean>(false);
  const [handOverLang, setHandOverLang] = useState<'target' | 'source'>('target');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | undefined>(result.rating);

  const isFarsiToEnglish = result.direction === 'farsi_to_english';

  // Determine font size class based on settings.fontSize
  const getFontSizeClass = (baseSize: 'sm' | 'base' | 'lg' | 'xl') => {
    const scale = settings.fontSize || 'normal';
    if (scale === 'xlarge') {
      if (baseSize === 'sm') return 'text-base';
      if (baseSize === 'base') return 'text-lg';
      if (baseSize === 'lg') return 'text-xl';
      return 'text-2xl';
    }
    if (scale === 'large') {
      if (baseSize === 'sm') return 'text-sm';
      if (baseSize === 'base') return 'text-base';
      if (baseSize === 'lg') return 'text-lg';
      return 'text-xl';
    }
    // Normal
    if (baseSize === 'sm') return 'text-xs';
    if (baseSize === 'base') return 'text-sm';
    if (baseSize === 'lg') return 'text-base';
    return 'text-lg';
  };

  const handleCopy = () => {
    const textToCopy = isFarsiToEnglish
      ? `${result.translatedText}\n\n[Original ${result.detectedDialect || 'Farsi/Dari'}]: ${result.sourceText}`
      : `${result.translatedText}\n\n[Original]: ${result.sourceText}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (isPlaying) {
      stopAllSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      if (isFarsiToEnglish) {
        const textToRead = viewMode === 'formal' && result.formalPhrasing 
          ? result.formalPhrasing 
          : (result.britishPhrasing || result.translatedText);

        await playSpokenAudio(textToRead, 'en-GB', {
          rate: settings.voiceSpeed || 0.95,
          onStart: () => setIsPlaying(true),
          onEnd: () => setIsPlaying(false),
        });
      } else {
        await playSpokenAudio(result.translatedText, 'fa', {
          rate: settings.voiceSpeed || 0.9,
          onStart: () => setIsPlaying(true),
          onEnd: () => setIsPlaying(false),
        });
      }
    } catch (err) {
      console.warn('Speech playback ended with error:', err);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (onSavePhrase) {
      const farsi = isFarsiToEnglish ? result.sourceText : result.translatedText;
      const english = isFarsiToEnglish ? result.translatedText : result.sourceText;
      onSavePhrase({
        farsiText: farsi,
        englishText: english,
        label: english.slice(0, 35) + (english.length > 35 ? '...' : ''),
      });
      setIsSaved(true);
    }
  };

  const handleRate = (rating: 'up' | 'down') => {
    const newRating = userRating === rating ? undefined : rating;
    setUserRating(newRating);
    if (onRateResult && newRating) {
      onRateResult(result.id, newRating);
    }
  };

  const isLowConfidence = result.lowConfidence || (result.dialectConfidence !== undefined && result.dialectConfidence < 0.6);

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
      {/* Low Confidence / Audio Unclear Warning Signal */}
      {isLowConfidence && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm font-medium">
            <div className="flex items-center justify-between font-bold">
              <span className="font-farsi text-amber-950">صدا واضح نبود. لطفاً دوباره آرام‌تر صحبت کنید.</span>
              <span className="text-amber-900 font-sans">Could not hear clearly. Please speak again slowly.</span>
            </div>
            {result.confidenceMessage && (
              <p className="mt-1 text-xs text-amber-800">{result.confidenceMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center flex-wrap gap-2">
          {/* Dialect Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{result.detectedDialect || 'Farsi / Dari'}</span>
          </div>

          {/* Urgency / Tone */}
          {result.toneOrEmotion && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
              <Flame className="w-3 h-3 text-amber-600" />
              <span>{result.toneOrEmotion}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Hand-it-over Fullscreen Button */}
          <button
            id={`btn-handover-${result.id}`}
            onClick={() => setShowHandOverModal(true)}
            title="Hand-it-over Mode (Display large text) / نمایش بزرگ روی صفحه"
            aria-label="Hand-it-over Mode (Display large text) / نمایش بزرگ روی صفحه"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>Hand-it-Over</span>
            <span className="font-farsi hidden sm:inline">| نمایش بزرگ</span>
          </button>

          {/* Save Phrase Button */}
          <button
            id={`btn-save-phrase-${result.id}`}
            onClick={handleSave}
            title={isSaved ? 'Saved / ذخیره شد' : 'Save phrase / ذخیره عبارت'}
            aria-label={isSaved ? 'Saved / ذخیره شد' : 'Save phrase / ذخیره عبارت'}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              isSaved
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Copy Button */}
          <button
            id={`btn-copy-result-${result.id}`}
            onClick={handleCopy}
            title="Copy translation result / کپی متن ترجمه"
            aria-label="Copy translation result / کپی متن ترجمه"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Accuracy Rating */}
          <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5">
            <button
              id={`btn-rate-up-${result.id}`}
              onClick={() => handleRate('up')}
              title="Accurate translation / ترجمه دقیق بود"
              aria-label="Accurate translation / ترجمه دقیق بود"
              className={`p-1 rounded hover:bg-slate-100 transition ${userRating === 'up' ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              id={`btn-rate-down-${result.id}`}
              onClick={() => handleRate('down')}
              title="Inaccurate translation / ترجمه نادرست بود"
              aria-label="Inaccurate translation / ترجمه نادرست بود"
              className={`p-1 rounded hover:bg-slate-100 transition ${userRating === 'down' ? 'text-rose-600 font-bold' : 'text-slate-400'}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Language Display */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Source Text (Spoken Transcript FIRST) */}
        <div className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span className={isFarsiToEnglish ? 'font-farsi text-sm text-teal-800' : 'font-sans text-xs uppercase tracking-wide text-indigo-800'}>
                {isFarsiToEnglish ? 'شما گفتید (Farsi / Dari Transcript):' : 'You Said (English Transcript):'}
              </span>
              <span className="text-[11px] text-slate-400">Verbatim</span>
            </div>
            <p
              dir={isFarsiToEnglish ? 'rtl' : 'ltr'}
              className={`text-slate-900 leading-relaxed ${
                isFarsiToEnglish ? 'font-farsi font-medium' : 'font-sans font-normal'
              } ${getFontSizeClass('lg')}`}
            >
              {result.sourceText}
            </p>
          </div>

          {/* "Not What I Meant" Button */}
          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
            {onNotWhatIMeant && (
              <button
                id={`btn-not-what-i-meant-${result.id}`}
                onClick={() => onNotWhatIMeant(result.id, result.direction)}
                title="Discard result and re-record speech / این را نگفتم - ضبط مجدد"
                aria-label="Discard result and re-record speech / این را نگفتم - ضبط مجدد"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>{isFarsiToEnglish ? 'این را نگفتم (Not what I meant)' : 'Not what I meant'}</span>
              </button>
            )}

            {result.dialectNotes && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Info className="w-3 h-3 text-teal-600" />
                <span>{result.dialectNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Translation Output Card */}
        <div className="flex flex-col justify-between p-4 bg-gradient-to-br from-teal-50/40 via-white to-sky-50/30 border border-teal-200 rounded-xl shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-teal-900 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>{isFarsiToEnglish ? 'British English Translation' : 'ترجمه به فارسی و دری'}</span>
              </div>

              {/* View style toggle */}
              {isFarsiToEnglish && (
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    id="btn-tab-standard"
                    onClick={() => setViewMode('standard')}
                    className={`px-2 py-0.5 rounded ${
                      viewMode === 'standard' ? 'bg-teal-700 text-white font-bold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Natural
                  </button>
                  {result.formalPhrasing && (
                    <button
                      id="btn-tab-formal"
                      onClick={() => setViewMode('formal')}
                      className={`px-2 py-0.5 rounded ${
                        viewMode === 'formal' ? 'bg-teal-700 text-white font-bold' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Formal
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Translation Output Text */}
            <div className="my-2">
              {viewMode === 'standard' && (
                <p
                  dir={isFarsiToEnglish ? 'ltr' : 'rtl'}
                  className={`text-slate-900 font-semibold leading-relaxed ${
                    isFarsiToEnglish ? 'font-sans' : 'font-farsi font-medium'
                  } ${getFontSizeClass('xl')}`}
                >
                  {isFarsiToEnglish ? (result.britishPhrasing || result.translatedText) : result.translatedText}
                </p>
              )}
              {viewMode === 'formal' && (
                <div>
                  <p
                    dir={isFarsiToEnglish ? 'ltr' : 'rtl'}
                    className={`text-slate-900 font-semibold leading-relaxed ${
                      isFarsiToEnglish ? 'font-sans' : 'font-farsi font-medium'
                    } ${getFontSizeClass('xl')}`}
                  >
                    {isFarsiToEnglish ? (result.formalPhrasing || result.translatedText) : result.translatedText}
                  </p>
                  <p className="text-[11px] text-teal-800 font-medium mt-1">
                    * Official phrasing for NHS, Home Office, or Legal Solicitors.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Voice Speak Out Button */}
          <div className="mt-4 pt-3 border-t border-teal-100 flex items-center justify-between gap-3">
            <button
              id={`btn-play-british-voice-${result.id}`}
              onClick={handleSpeak}
              title="Play spoken audio translation / پخش صوتی ترجمه"
              aria-label="Play spoken audio translation / پخش صوتی ترجمه"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20 active:scale-95'
              }`}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{isFarsiToEnglish ? 'Stop Voice' : 'توقف پخش صوتی'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {isFarsiToEnglish ? 'Play English Speech' : 'پخش صوتی فارسی و دری'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* UK Terms Identified Chips */}
      {result.keyTerms && result.keyTerms.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>UK Terminology Explanations:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {result.keyTerms.map((term, idx) => (
              <div
                key={idx}
                className="flex flex-col p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2 font-bold text-teal-900">
                  <span>{term.english}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="font-farsi text-slate-800">{term.farsi}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  {term.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HAND-IT-OVER FULLSCREEN OVERLAY */}
      {showHandOverModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10 animate-fade-in text-white">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                Hand-it-Over Mode
              </span>
              <span className="text-xs text-slate-400 font-farsi">نمایش بزرگ متن جهت ارائه به طرف مقابل</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setHandOverLang(handOverLang === 'target' ? 'source' : 'target')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
              >
                {handOverLang === 'target' ? 'Show Source Text' : 'Show Translation'}
              </button>
              <button
                id="btn-close-handover"
                onClick={() => setShowHandOverModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* GIANT DISPLAY TEXT */}
          <div className="flex-1 flex flex-col justify-center items-center text-center my-8 px-4">
            {handOverLang === 'target' ? (
              <p
                dir={isFarsiToEnglish ? 'ltr' : 'rtl'}
                className={`text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-amber-300 tracking-wide ${
                  isFarsiToEnglish ? 'font-sans' : 'font-farsi'
                }`}
              >
                {isFarsiToEnglish ? (result.britishPhrasing || result.translatedText) : result.translatedText}
              </p>
            ) : (
              <p
                dir={isFarsiToEnglish ? 'rtl' : 'ltr'}
                className={`text-3xl sm:text-4xl md:text-5xl font-semibold leading-relaxed text-slate-200 ${
                  isFarsiToEnglish ? 'font-farsi' : 'font-sans'
                }`}
              >
                {result.sourceText}
              </p>
            )}
          </div>

          {/* Footer controls */}
          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Hold phone out toward caseworker or refugee to read directly.
            </p>
            <button
              onClick={handleSpeak}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition"
            >
              <Volume2 className="w-5 h-5" />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
