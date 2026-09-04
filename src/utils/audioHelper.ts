/**
 * Audio helpers for Web Speech British voice synthesis, Gemini PCM audio decoding,
 * and audio recording conversion for Farsi/Dari interpretation.
 */

// Play base64 raw PCM (e.g. from Gemini TTS 24kHz)
export async function playPcmAudio(base64Audio: string, sampleRate = 24000): Promise<void> {
  try {
    const binary = atob(base64Audio);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate,
    });

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start(0);

    return new Promise((resolve) => {
      source.onended = () => {
        audioCtx.close();
        resolve();
      };
    });
  } catch (err) {
    console.warn('Failed to play PCM audio, falling back to Web Speech API', err);
    throw err;
  }
}

let currentAudioElement: HTMLAudioElement | null = null;
let sharedAudioElement: HTMLAudioElement | null = null;
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Primes and unlocks browser HTMLAudioElement autoplay during a user gesture (click/touch/submit).
 * Modern browsers block audio.play() after async fetch unless primed during an active user gesture.
 */
export function primeAudioPlayback(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioElement) {
    sharedAudioElement = new Audio();
  }
  try {
    // Play a silent data URI to register user activation token on this element
    sharedAudioElement.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    const playPromise = sharedAudioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch (e) {
    console.warn('Audio priming note:', e);
  }
  return sharedAudioElement;
}

// Helper to ensure Web Speech API voices are populated before attempting synthesis
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const currentVoices = window.speechSynthesis.getVoices();
  if (currentVoices && currentVoices.length > 0) {
    return Promise.resolve(currentVoices);
  }

  if (!voicesLoadedPromise) {
    voicesLoadedPromise = new Promise((resolve) => {
      let resolved = false;

      const finish = () => {
        if (!resolved) {
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', finish);
          resolve(window.speechSynthesis.getVoices() || []);
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', finish);

      // Fallback timeout in case voiceschanged event is not fired by browser
      setTimeout(finish, 1000);
    });
  }

  return voicesLoadedPromise;
}

export function cleanTextForSpeech(text: string, lang: 'fa' | 'en-GB'): string {
  if (!text) return '';
  let cleaned = text
    .replace(/\[.*?\]/g, '')
    .replace(/در دری:.*$/gm, '')
    .replace(/\(در دری:.*?\)/g, '')
    .replace(/[*_#`~]/g, '')
    .trim();

  if (lang === 'fa') {
    // Remove English words inside parentheses like (GP) or (NHS) that disrupt Farsi TTS
    cleaned = cleaned.replace(/\([A-Za-z0-9\s,-]+\)/g, '');
  }

  return cleaned.trim();
}

// Memory cache for TTS audio Object URLs to minimize latency during live conversation
const ttsAudioCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

function getCacheKey(text: string, lang: string): string {
  return `${lang}:${text.trim().toLowerCase()}`;
}

/**
 * Pre-cache audio for a specific text and language into memory.
 */
export async function preCacheAudio(text: string, lang: 'fa' | 'en-GB' | 'fa-IR'): Promise<void> {
  const normalizedLang: 'fa-IR' | 'en-GB' = (lang === 'fa' || lang === 'fa-IR') ? 'fa-IR' : 'en-GB';
  const textToCache = cleanTextForSpeech(text, normalizedLang === 'fa-IR' ? 'fa' : 'en-GB');
  if (!textToCache) return;

  const key = getCacheKey(textToCache, normalizedLang);
  if (ttsAudioCache.has(key)) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`/api/tts?text=${encodeURIComponent(textToCache)}&lang=${encodeURIComponent(normalizedLang)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 100) {
        const objectUrl = URL.createObjectURL(blob);
        if (ttsAudioCache.size >= MAX_CACHE_SIZE) {
          const firstKey = ttsAudioCache.keys().next().value;
          if (firstKey) {
            const oldUrl = ttsAudioCache.get(firstKey);
            if (oldUrl && oldUrl.startsWith('blob:')) {
              URL.revokeObjectURL(oldUrl);
            }
            ttsAudioCache.delete(firstKey);
          }
        }
        ttsAudioCache.set(key, objectUrl);
      }
    }
  } catch (e) {
    // Silent fail for background pre-cache; Web Speech API local synthesis remains active fallback
  }
}

/**
 * Pre-cache common asylum, emergency, NHS, and quick phrases on startup or idle
 */
export function preCacheCommonPhrases(phrases?: Array<{ englishText?: string; farsiText?: string }>): void {
  ensureVoicesLoaded().catch(() => {});

  if (typeof window === 'undefined') return;

  const runPreCache = async () => {
    // Limit pre-cache list to top 3 essential phrases to minimize background requests
    const defaultPhrases = [
      { text: 'فارسی صحبت کنید', lang: 'fa-IR' as const },
      { text: 'I need an official interpreter.', lang: 'en-GB' as const },
      { text: 'I need help', lang: 'en-GB' as const },
    ];

    // Process sequentially with gentle delays to preserve bandwidth
    for (const item of defaultPhrases) {
      await preCacheAudio(item.text, item.lang);
      await new Promise((r) => setTimeout(r, 400));
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => runPreCache());
  } else {
    setTimeout(runPreCache, 1200);
  }
}

// Primary Spoken Audio Player prioritizing cached audio or fast server TTS, with immediate Web Speech API fallback
export async function playSpokenAudio(
  text: string,
  lang: 'fa' | 'en-GB' | 'fa-IR',
  options?: {
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    /** Nothing could be spoken at all - the caller should say so rather than leave silence. */
    onUnavailable?: (reason: 'no_voice') => void;
  }
): Promise<void> {
  stopAllSpeech();

  const normalizedLang: 'fa-IR' | 'en-GB' = (lang === 'fa' || lang === 'fa-IR') ? 'fa-IR' : 'en-GB';
  const textToSpeak = cleanTextForSpeech(text, normalizedLang === 'fa-IR' ? 'fa' : 'en-GB');

  if (!textToSpeak) {
    options?.onEnd?.();
    return;
  }

  // Pre-trigger voice loading for Web Speech API fallback
  ensureVoicesLoaded().catch(() => {});

  const cacheKey = getCacheKey(textToSpeak, normalizedLang);
  const cachedAudioUrl = ttsAudioCache.get(cacheKey);

  return new Promise(async (resolve) => {
    let resolved = false;

    const finish = () => {
      if (!resolved) {
        resolved = true;
        currentAudioElement = null;
        options?.onEnd?.();
        resolve();
      }
    };

    const playWithLocalSynthesis = async () => {
      try {
        if (normalizedLang === 'fa-IR') {
          await speakFarsi(textToSpeak, options);
        } else {
          await speakBritishEnglish(textToSpeak, options);
        }
      } catch (err: any) {
        // The device has no Persian voice. Silence here reads as a broken
        // button, so tell the caller and let it say what happened.
        if (err?.name === 'NoFarsiVoiceError') {
          options?.onUnavailable?.('no_voice');
        } else {
          console.warn('Local speech synthesis fallback failed:', err);
        }
      }
      finish();
    };

    // 1. Instant Play if pre-cached in memory (0ms network latency during live conversation)
    if (cachedAudioUrl) {
      try {
        const audio = sharedAudioElement || new Audio();
        sharedAudioElement = audio;
        currentAudioElement = audio;

        audio.pause();
        audio.currentTime = 0;
        audio.src = cachedAudioUrl;

        if (options?.rate && options.rate !== 1) {
          audio.playbackRate = options.rate;
        }

        audio.onplay = () => {
          options?.onStart?.();
        };

        audio.onended = () => {
          finish();
        };

        audio.onerror = () => {
          playWithLocalSynthesis();
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => playWithLocalSynthesis());
        }
        return;
      } catch (e) {
        playWithLocalSynthesis();
        return;
      }
    }

    // 2. Fetch from external TTS API with fast 3.5s timeout.
    // If external API fails, returns non-200 status, or times out -> Immediately prioritize local synthetic speech!
    const serverUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}&lang=${encodeURIComponent(normalizedLang)}`;

    try {
      // The server splits long text into chunks and fetches each one, so the
      // wait grows with the sentence. A flat 3.5s cut off anything but a
      // short phrase and handed it to a fallback that, in Farsi, is silent.
      const budget = Math.min(12000, 4000 + textToSpeak.length * 25);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), budget);

      const res = await fetch(serverUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // External TTS API failed -> Immediately play via local Web Speech API
        await playWithLocalSynthesis();
        return;
      }

      const blob = await res.blob();
      if (blob.size < 100) {
        await playWithLocalSynthesis();
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      if (ttsAudioCache.size >= MAX_CACHE_SIZE) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) {
          const oldUrl = ttsAudioCache.get(firstKey);
          if (oldUrl && oldUrl.startsWith('blob:')) URL.revokeObjectURL(oldUrl);
          ttsAudioCache.delete(firstKey);
        }
      }
      ttsAudioCache.set(cacheKey, objectUrl);

      const audio = sharedAudioElement || new Audio();
      sharedAudioElement = audio;
      currentAudioElement = audio;

      audio.pause();
      audio.currentTime = 0;
      audio.src = objectUrl;

      if (options?.rate && options.rate !== 1) {
        audio.playbackRate = options.rate;
      }

      audio.onplay = () => {
        options?.onStart?.();
      };

      audio.onended = () => {
        finish();
      };

      audio.onerror = () => {
        playWithLocalSynthesis();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => playWithLocalSynthesis());
      }
    } catch (err) {
      // External API fetch failed, aborted, or offline -> Prioritize local synthetic speech
      await playWithLocalSynthesis();
    }
  });
}

// Speak text using British English Web Speech API Voice
export async function speakBritishEnglish(
  text: string,
  options?: { rate?: number; pitch?: number; onStart?: () => void; onEnd?: () => void; preferredVoiceGender?: 'female' | 'male' }
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    options?.onEnd?.();
    return;
  }

  const voices = await ensureVoicesLoaded();
  window.speechSynthesis.cancel(); // Stop ongoing speech

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 0.95; // Slightly measured pace for clear comprehension
    utterance.pitch = options?.pitch || 1.0;
    utterance.lang = 'en-GB';

    // Find best British English ('en-GB') voices
    const britishVoices = voices.filter(
      (v) => v.lang === 'en-GB' || v.lang === 'en_GB' || v.lang.toLowerCase() === 'en-gb' || v.name.includes('UK') || v.name.includes('British') || v.name.includes('Great Britain')
    );

    let chosenVoice: SpeechSynthesisVoice | null = null;
    if (britishVoices.length > 0) {
      if (options?.preferredVoiceGender === 'male') {
        chosenVoice = britishVoices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('George') || v.name.includes('Oliver') || v.name.includes('Daniel')) || britishVoices[0];
      } else {
        chosenVoice = britishVoices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Hazel') || v.name.includes('Susan') || v.name.includes('Serena') || v.name.includes('Martha')) || britishVoices[0];
      }
    }

    if (!chosenVoice && voices.length > 0) {
      // General english fallback
      chosenVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      options?.onEnd?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * A Farsi voice on this device, if there is one.
 *
 * Most phones and desktops ship no Persian voice at all. English always has
 * one, which is why speech into English has always worked and speech into
 * Farsi quietly did not: the browser accepted the utterance, had nothing to
 * say it with, and produced silence. Deliberately no Arabic voice: it reads
 * Persian letters with the wrong sounds and is worse than saying nothing.
 */
export function findFarsiVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find(
    (v) =>
      v.lang === 'fa-IR' ||
      v.lang.toLowerCase() === 'fa-ir' ||
      v.lang === 'fa-AF' ||
      v.lang.startsWith('fa') ||
      v.name.toLowerCase().includes('persian') ||
      v.name.toLowerCase().includes('farsi') ||
      v.name.toLowerCase().includes('dari')
  );
}

/** Thrown rather than mimed, so the app can say why nothing was heard. */
export class NoFarsiVoiceError extends Error {
  constructor() {
    super('This device has no Farsi voice installed.');
    this.name = 'NoFarsiVoiceError';
  }
}

// Speak text in Farsi / Persian (STRICTLY NO ARABIC VOICE FALLBACK)
export async function speakFarsi(
  text: string,
  options?: { rate?: number; onStart?: () => void; onEnd?: () => void }
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onEnd?.();
    throw new NoFarsiVoiceError();
  }

  const voices = await ensureVoicesLoaded();
  window.speechSynthesis.cancel();

  const farsiVoice = findFarsiVoice(voices);

  // Speaking Persian text with an English voice produces gibberish or, more
  // often, nothing. Either way the person is left waiting for a sound that
  // never comes, so say plainly that it is not available instead.
  if (!farsiVoice) {
    options?.onEnd?.();
    throw new NoFarsiVoiceError();
  }

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 0.9;
    utterance.lang = 'fa-IR';
    utterance.voice = farsiVoice;

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => {
      options?.onEnd?.();
      resolve();
    };
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis Farsi error:', e);
      options?.onEnd?.();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

// Stop any current voice playback (HTML5 Audio or Web Speech)
export function stopAllSpeech(): void {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (_) {}
    currentAudioElement = null;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Helper to play the standard "Please speak more slowly" phrase in clear British English
export async function playPleaseSpeakSlowly(options?: { rate?: number }): Promise<void> {
  const phrase = "Could you please speak more slowly and use simple words? I am using a translation app.";
  return playSpokenAudio(phrase, 'en-GB', {
    rate: options?.rate || 0.85, // Slower, clear pace
  });
}

// Convert Blob to Base64 String
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
