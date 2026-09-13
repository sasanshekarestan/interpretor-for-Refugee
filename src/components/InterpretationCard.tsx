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
  ThumbsDown,
} from 'lucide-react';
import { playSpokenAudio, stopAllSpeech } from '../utils/audioHelper';

/**
 * One exchange, as both people see it.
 *
 * Brought onto the design system in September 2026. Before that this file held
 * 67 off-system colours, a gradient, a typed arrow standing in for an icon,
 * and a row of controls at 24px tall that a cold hand on a bus cannot hit.
 * Almost every label was English only, on the screen where a Persian speaker
 * is trying to be understood at a desk.
 *
 * The two panels are deliberately unalike: what you said sits on the page
 * ground and reads as a record, what it became sits on a surface with a
 * primary rule and reads as the thing to show someone. That distinction used
 * to be carried by a gradient, which design.md bans, and is now carried by
 * position and a rule.
 */

interface InterpretationCardProps {
  result: InterpretationResult;
  settings: EmbedSettings;
  onPlaySpeech?: (text: string) => void;
  onNotWhatIMeant?: (id: string, direction: TranslationDirection) => void;
  onSavePhrase?: (phrase: { farsiText: string; englishText: string; label: string }) => void;
  onRateResult?: (id: string, rating: 'up' | 'down') => void;
}

/**
 * The type scale, as steps, so Persian can sit one above Latin.
 *
 * design.md: "Persian sits one step larger with more leading throughout. This
 * is not generosity, it is legibility: Arabic script hangs its meaning on
 * marks that disappear first when type gets small or tight." The old helper
 * gave both scripts the same size and bottomed out at 12px.
 */
const STEPS = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'] as const;

export const InterpretationCard: React.FC<InterpretationCardProps> = ({
  result,
  settings,
  onNotWhatIMeant,
  onSavePhrase,
  onRateResult,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  /** True when this device simply has no Persian voice to read the text with. */
  const [noFarsiVoice, setNoFarsiVoice] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'standard' | 'formal' | 'phonetic'>('standard');
  const [showHandOverModal, setShowHandOverModal] = useState<boolean>(false);
  const [handOverLang, setHandOverLang] = useState<'target' | 'source'>('target');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | undefined>(result.rating);

  const isFarsiToEnglish = result.direction === 'farsi_to_english';

  /**
   * `base` is the reading size, `lead` the size of the line being handed over.
   * Persian takes one step more, and the person's own font-size setting takes
   * one or two on top of that.
   */
  const sizeFor = (role: 'base' | 'lead', persian: boolean) => {
    const scale = settings.fontSize || 'normal';
    const start = role === 'lead' ? 1 : 0;
    const bump = scale === 'xlarge' ? 2 : scale === 'large' ? 1 : 0;
    const index = Math.min(STEPS.length - 1, start + bump + (persian ? 1 : 0));
    return STEPS[index];
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
        setNoFarsiVoice(false);
        await playSpokenAudio(result.translatedText, 'fa', {
          rate: settings.voiceSpeed || 0.9,
          onStart: () => setIsPlaying(true),
          onEnd: () => setIsPlaying(false),
          // A play button that does nothing looks broken. Say why instead.
          onUnavailable: () => setNoFarsiVoice(true),
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

  /** Icon-only controls, 44px, labelled in both languages. */
  const iconButton =
    'w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl border transition cursor-pointer';

  return (
    <div className="w-full bg-surface border border-edge rounded-2xl p-4 sm:p-6 shadow-hamyar transition">
      {/* The microphone did not hear it properly. Attention, not fault: nothing
          has broken, the person just needs to say it again. */}
      {isLowConfidence && (
        <div className="mb-4 p-3.5 bg-attention-bg border-s-4 border-attention rounded-xl space-y-1.5 animate-fade-in">
          <div dir="rtl" className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-attention shrink-0 mt-0.5" aria-hidden="true" />
            <p className="font-farsi text-base text-ink leading-relaxed flex-1">
              صدا واضح نبود. لطفاً دوباره آرام‌تر صحبت کنید.
            </p>
          </div>
          <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">
            Could not hear clearly. Please speak again slowly.
          </p>
          {result.confidenceMessage && (
            <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">
              {result.confidenceMessage}
            </p>
          )}
        </div>
      )}

      {/* Meta and controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-edge">
        <div className="flex items-center flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-sm font-bold">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            <bdi dir="ltr" className="font-latin">{result.detectedDialect || 'Farsi / Dari'}</bdi>
          </div>

          {result.toneOrEmotion && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-attention-bg border border-attention text-attention text-sm font-bold">
              <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{result.toneOrEmotion}</span>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {/* The one labelled control here, because it is the one that matters
              at a desk: turning the phone round so the other person can read. */}
          <button
            id={`btn-handover-${result.id}`}
            onClick={() => setShowHandOverModal(true)}
            aria-label="نمایش بزرگ متن / Hand it over, large text"
            className="min-h-[44px] px-3 rounded-xl bg-page border border-edge-control
                       text-ink hover:bg-surface transition cursor-pointer
                       inline-flex items-center gap-2"
          >
            <Maximize2 className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-start leading-tight">
              <span dir="rtl" className="block font-farsi font-bold text-base">نمایش بزرگ</span>
              <span dir="ltr" className="block font-latin text-sm text-ink-muted">Hand it over</span>
            </span>
          </button>

          {/* Icon-only from here, each labelled in both languages, each 44px.
              These were 24px tall with English-only labels. */}
          <button
            id={`btn-save-phrase-${result.id}`}
            onClick={handleSave}
            aria-label={isSaved ? 'ذخیره شد / Saved' : 'ذخیره عبارت / Save phrase'}
            aria-pressed={isSaved}
            className={`${iconButton} ${
              isSaved
                ? 'bg-primary border-primary text-on-primary'
                : 'bg-page border-edge-control text-ink-muted hover:bg-surface'
            }`}
          >
            <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>

          <button
            id={`btn-copy-result-${result.id}`}
            onClick={handleCopy}
            aria-label={copied ? 'کپی شد / Copied' : 'کپی متن ترجمه / Copy translation'}
            className={`${iconButton} ${
              copied
                ? 'bg-primary border-primary text-on-primary'
                : 'bg-page border-edge-control text-ink-muted hover:bg-surface'
            }`}
          >
            {copied ? <Check className="w-5 h-5" aria-hidden="true" /> : <Copy className="w-5 h-5" aria-hidden="true" />}
          </button>

          <div className="flex items-center gap-1.5 ps-1.5 border-s border-edge">
            <button
              id={`btn-rate-up-${result.id}`}
              onClick={() => handleRate('up')}
              aria-label="ترجمه دقیق بود / Accurate translation"
              aria-pressed={userRating === 'up'}
              className={`${iconButton} ${
                userRating === 'up'
                  ? 'bg-primary border-primary text-on-primary'
                  : 'bg-page border-edge-control text-ink-muted hover:bg-surface'
              }`}
            >
              <ThumbsUp className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              id={`btn-rate-down-${result.id}`}
              onClick={() => handleRate('down')}
              aria-label="ترجمه نادرست بود / Inaccurate translation"
              aria-pressed={userRating === 'down'}
              className={`${iconButton} ${
                userRating === 'down'
                  ? 'bg-fault-bg border-fault text-fault'
                  : 'bg-page border-edge-control text-ink-muted hover:bg-surface'
              }`}
            >
              <ThumbsDown className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* What was said. A record, so it sits on the page ground. */}
        <div className="flex flex-col justify-between p-4 bg-page border border-edge rounded-xl">
          <div>
            <div className="mb-2 space-y-0.5">
              {isFarsiToEnglish ? (
                <>
                  <p dir="rtl" className="font-farsi font-bold text-base text-ink">شما گفتید</p>
                  <p dir="ltr" className="font-latin text-sm text-ink-muted">
                    What you said, word for word
                  </p>
                </>
              ) : (
                <>
                  <p dir="ltr" className="font-latin font-bold text-base text-ink">What you said</p>
                  <p dir="rtl" className="font-farsi text-sm text-ink-muted">آنچه گفته شد، کلمه به کلمه</p>
                </>
              )}
            </div>
            <p
              dir={isFarsiToEnglish ? 'rtl' : 'ltr'}
              className={`text-ink leading-[1.8] ${
                isFarsiToEnglish ? 'font-farsi' : 'font-latin'
              } ${sizeFor('base', isFarsiToEnglish)}`}
            >
              {result.sourceText}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-edge flex flex-wrap items-center justify-between gap-2">
            {onNotWhatIMeant && (
              <button
                id={`btn-not-what-i-meant-${result.id}`}
                onClick={() => onNotWhatIMeant(result.id, result.direction)}
                aria-label="این را نگفتم، ضبط مجدد / Not what I meant, record again"
                className="min-h-[44px] px-3 rounded-xl bg-fault-bg border border-fault
                           text-fault hover:opacity-90 transition cursor-pointer
                           inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="text-start leading-tight">
                  <span dir="rtl" className="block font-farsi font-bold text-base">این را نگفتم</span>
                  <span dir="ltr" className="block font-latin text-sm">Not what I meant</span>
                </span>
              </button>
            )}

            {result.dialectNotes && (
              <div className="flex items-center gap-1.5 text-sm text-ink-muted">
                <Info className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <span>{result.dialectNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* What it became. The thing to show someone, so it gets the rule.
            This used to be a three-stop gradient, which design.md bans:
            flat fills only. */}
        <div className="flex flex-col justify-between p-4 bg-surface border border-edge border-s-4 border-s-primary rounded-xl">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="space-y-0.5">
                {isFarsiToEnglish ? (
                  <>
                    <p dir="ltr" className="font-latin font-bold text-base text-ink">
                      British English
                    </p>
                    <p dir="rtl" className="font-farsi text-sm text-ink-muted">ترجمه به انگلیسی</p>
                  </>
                ) : (
                  <>
                    <p dir="rtl" className="font-farsi font-bold text-base text-ink">
                      ترجمه به فارسی و دری
                    </p>
                    <p dir="ltr" className="font-latin text-sm text-ink-muted">Farsi and Dari</p>
                  </>
                )}
              </div>

              {isFarsiToEnglish && result.formalPhrasing && (
                <div role="tablist" className="flex items-center gap-1">
                  <button
                    id="btn-tab-standard"
                    role="tab"
                    aria-selected={viewMode === 'standard'}
                    onClick={() => setViewMode('standard')}
                    className={`min-h-[44px] px-3 rounded-xl text-sm font-bold transition cursor-pointer ${
                      viewMode === 'standard'
                        ? 'bg-primary text-on-primary'
                        : 'bg-page border border-edge-control text-ink-muted hover:bg-surface'
                    }`}
                  >
                    Natural
                  </button>
                  <button
                    id="btn-tab-formal"
                    role="tab"
                    aria-selected={viewMode === 'formal'}
                    onClick={() => setViewMode('formal')}
                    className={`min-h-[44px] px-3 rounded-xl text-sm font-bold transition cursor-pointer ${
                      viewMode === 'formal'
                        ? 'bg-primary text-on-primary'
                        : 'bg-page border border-edge-control text-ink-muted hover:bg-surface'
                    }`}
                  >
                    Formal
                  </button>
                </div>
              )}
            </div>

            <div className="my-2">
              {viewMode === 'standard' && (
                <p
                  dir={isFarsiToEnglish ? 'ltr' : 'rtl'}
                  className={`text-ink font-bold leading-[1.8] ${
                    isFarsiToEnglish ? 'font-latin' : 'font-farsi'
                  } ${sizeFor('lead', !isFarsiToEnglish)}`}
                >
                  {isFarsiToEnglish ? (result.britishPhrasing || result.translatedText) : result.translatedText}
                </p>
              )}
              {viewMode === 'formal' && (
                <div className="space-y-1.5">
                  <p
                    dir={isFarsiToEnglish ? 'ltr' : 'rtl'}
                    className={`text-ink font-bold leading-[1.8] ${
                      isFarsiToEnglish ? 'font-latin' : 'font-farsi'
                    } ${sizeFor('lead', !isFarsiToEnglish)}`}
                  >
                    {isFarsiToEnglish ? (result.formalPhrasing || result.translatedText) : result.translatedText}
                  </p>
                  <p dir="ltr" className="font-latin text-sm text-ink-muted">
                    Official phrasing, for the NHS, the Home Office or a solicitor.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pressing play and hearing nothing looks like a broken button, so
              when the device has no Persian voice the reason is shown here. */}
          {noFarsiVoice && (
            <p
              className="mt-3 font-farsi text-base text-ink bg-attention-bg border-s-4 border-attention
                         rounded-xl px-3 py-2.5 leading-relaxed"
              dir="rtl"
              role="status"
            >
              صدای فارسی در این لحظه در دسترس نیست. می‌توانید متن را بخوانید یا نشان بدهید.
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-edge">
            <button
              id={`btn-play-british-voice-${result.id}`}
              onClick={handleSpeak}
              aria-label={isPlaying ? 'توقف پخش / Stop' : 'پخش صوتی ترجمه / Play the translation'}
              className={`min-h-[48px] px-4 rounded-xl font-bold transition cursor-pointer
                          inline-flex items-center gap-2 ${
                            isPlaying
                              ? 'bg-primary-press text-on-primary'
                              : 'bg-primary hover:bg-primary-press text-on-primary shadow-hamyar'
                          }`}
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-start leading-tight">
                    <span dir="rtl" className="block font-farsi text-base">توقف پخش</span>
                    <span dir="ltr" className="block font-latin text-sm opacity-80">Stop</span>
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-start leading-tight">
                    <span dir="rtl" className="block font-farsi text-base">
                      {isFarsiToEnglish ? 'شنیدن به انگلیسی' : 'شنیدن به فارسی'}
                    </span>
                    <span dir="ltr" className="block font-latin text-sm opacity-80">
                      {isFarsiToEnglish ? 'Play in English' : 'Play in Farsi'}
                    </span>
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* The English words in this exchange, explained */}
      {result.keyTerms && result.keyTerms.length > 0 && (
        <div className="mt-4 pt-3 border-t border-edge">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
            <div className="space-y-0.5">
              <p dir="rtl" className="font-farsi font-bold text-base text-ink">
                معنی کلمه‌های انگلیسی
              </p>
              <p dir="ltr" className="font-latin text-sm text-ink-muted">
                Words in this exchange, explained
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.keyTerms.map((term, idx) => (
              <div key={idx} className="p-3 bg-page border border-edge rounded-xl space-y-1">
                {/* Each language on its own line. These used to share one
                    line with a typed arrow between them, which is not an icon
                    and put two reading directions either side of it. */}
                <p dir="ltr" className="font-latin font-bold text-base text-ink">
                  <bdi>{term.english}</bdi>
                </p>
                <p dir="rtl" className="font-farsi text-lg text-ink leading-[1.8]">{term.farsi}</p>
                {term.explanation && (
                  <p dir="ltr" className="font-latin text-sm text-ink-muted leading-relaxed">
                    {term.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turning the phone round. The whole screen becomes one sentence. */}
      {showHandOverModal && (
        <div className="fixed inset-0 z-50 bg-emphasis text-on-emphasis flex flex-col justify-between p-6 sm:p-10 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="space-y-0.5 min-w-0">
              <p dir="rtl" className="font-farsi font-bold text-lg">نمایش بزرگ</p>
              <p dir="ltr" className="font-latin text-sm text-on-emphasis-muted">
                Hold the phone out so they can read it
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setHandOverLang(handOverLang === 'target' ? 'source' : 'target')}
                aria-label={
                  handOverLang === 'target'
                    ? 'نمایش متن اصلی / Show the original'
                    : 'نمایش ترجمه / Show the translation'
                }
                className="min-h-[44px] px-3.5 rounded-xl bg-surface/15 border border-white/25
                           text-on-emphasis hover:bg-surface/25 transition cursor-pointer
                           font-latin text-sm font-bold"
              >
                {handOverLang === 'target' ? 'Show the original' : 'Show the translation'}
              </button>
              <button
                id="btn-close-handover"
                onClick={() => setShowHandOverModal(false)}
                aria-label="بستن / Close"
                className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl
                           bg-surface/15 border border-white/25 text-on-emphasis
                           hover:bg-surface/25 transition cursor-pointer"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center my-8 px-2">
            {handOverLang === 'target' ? (
              <p
                dir={isFarsiToEnglish ? 'ltr' : 'rtl'}
                className={`text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.4] text-on-emphasis ${
                  isFarsiToEnglish ? 'font-latin' : 'font-farsi'
                }`}
              >
                {isFarsiToEnglish ? (result.britishPhrasing || result.translatedText) : result.translatedText}
              </p>
            ) : (
              <p
                dir={isFarsiToEnglish ? 'rtl' : 'ltr'}
                className={`text-2xl sm:text-4xl md:text-5xl font-bold leading-[1.5] text-on-emphasis-muted ${
                  isFarsiToEnglish ? 'font-farsi' : 'font-latin'
                }`}
              >
                {result.sourceText}
              </p>
            )}
          </div>

          <div className="border-t border-white/15 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p dir="rtl" className="font-farsi text-base text-on-emphasis-muted text-center sm:text-start">
              گوشی را به سمت طرف مقابل بگیرید تا خودش بخواند.
            </p>
            <button
              onClick={handleSpeak}
              aria-label="پخش صدا / Read aloud"
              className="min-h-[48px] px-5 rounded-xl bg-surface text-emphasis hover:bg-on-emphasis-muted
                         font-bold transition cursor-pointer inline-flex items-center gap-2 shrink-0"
            >
              <Volume2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-start leading-tight">
                <span dir="rtl" className="block font-farsi text-base">پخش صدا</span>
                <span dir="ltr" className="block font-latin text-sm opacity-70">Read aloud</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
