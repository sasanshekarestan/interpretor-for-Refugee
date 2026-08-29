import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle, Sparkles, User, Users, Globe, Languages, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { blobToBase64, primeAudioPlayback } from '../utils/audioHelper';
import { TranslationDirection } from '../types';

interface AudioVoiceInputProps {
  direction: TranslationDirection;
  dialectHint: string;
  isProcessing: boolean;
  onAudioReady: (base64Audio: string, mimeType: string, overrideDirection?: TranslationDirection) => Promise<void>;
  onChangeDirection?: (dir: TranslationDirection) => void;
  onSwitchToText: () => void;
}

export const AudioVoiceInput: React.FC<AudioVoiceInputProps> = ({
  direction,
  isProcessing,
  onAudioReady,
  onChangeDirection,
  onSwitchToText,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeRecordingDirection, setActiveRecordingDirection] = useState<TranslationDirection>(direction);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setActiveRecordingDirection(direction);
  }, [direction]);

  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async (targetDirection: TranslationDirection) => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setActiveRecordingDirection(targetDirection);
    if (onChangeDirection) {
      onChangeDirection(targetDirection);
    }
    primeAudioPlayback();

    // Vibration cue on recording start
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(80);
      }
    } catch (_) {}

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage(
        'مرورگر شما از ضبط مستقیم صدا پشتیبانی نمی‌کند یا دسترسی در این محیط محدود شده است. لطفاً از گزینه تایپ متن استفاده فرمایید. / Microphone API is unavailable. Please use text typing.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Audio analysis for live visualizer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      // Setup MediaRecorder
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stopRecordingCleanup();
        setIsRecording(false);

        if (audioBlob.size < 1000) {
          setErrorMessage('صدا خیلی کوتاه بود. لطفاً دوباره دکمه را فشار داده و صحبت کنید. / Audio recording was too short.');
          return;
        }

        try {
          const base64 = await blobToBase64(audioBlob);
          await onAudioReady(base64, mimeType, targetDirection);
        } catch (err: any) {
          console.warn('Audio conversion issue:', err?.message || err);
          setErrorMessage('خطا در پردازش فایل صوتی. / Audio processing error.');
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or access issue:', err?.message || err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError' || (err?.message && err.message.toLowerCase().includes('denied'));
      setErrorMessage(
        isDenied
          ? 'دسترسی به میکروفون غیرفعال است یا تایید نشد. می‌توانید مجوز را در مرورگر فعال کنید یا از بخش پایین مستقیماً متن را تایپ نمایید. / Microphone access was not granted. You can allow permissions or use text typing below.'
          : 'امکان دسترسی به میکروفون میسر نشد. لطفاً از گزینه تایپ متن استفاده فرمایید. / Unable to access microphone. Please type your message.'
      );
      stopRecordingCleanup();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    primeAudioPlayback();
    // Vibration cue on recording stop
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 40]);
      }
    } catch (_) {}
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-sm transition-all">
      {/* 2-Person Conversation Header & Dual Language Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-teal-50 via-sky-50 to-indigo-50 border border-teal-200/80 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-teal-200 shadow-2xs text-teal-700">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 font-farsi">
                حالت گفتگو ۲ نفره (پناهجو ↔ کارشناس)
              </span>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full">
                Two-Party Live Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-farsi mt-0.5">
              پشتیبانی همزمان از زبان انگلیسی و فارسی / دری با تشخیص هوشمند لهجه‌ها
            </p>
          </div>
        </div>

        {/* Dual Support Pill Tag */}
        <div className="flex items-center gap-1.5 bg-white/90 border border-teal-200/80 px-3 py-1.5 rounded-xl shadow-2xs shrink-0">
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-bold text-slate-800">English</span>
          <ArrowLeftRight className="w-3 h-3 text-slate-400" />
          <span className="text-xs font-bold text-teal-800 font-farsi">فارسی / دری</span>
        </div>
      </div>

      {/* Main Recording Area */}
      {isRecording ? (
        /* ACTIVE RECORDING VIEW */
        <div className="flex flex-col items-center justify-center p-6 bg-rose-50/50 border-2 border-rose-200 rounded-2xl animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-3 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>
              {activeRecordingDirection === 'farsi_to_english'
                ? 'در حال ضبط صدای فارسی و دری...'
                : 'Recording English Voice...'}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-800 mb-4 font-mono">
            ⏱ {formatDuration(recordDuration)}
          </div>

          {/* Sound Wave Meter */}
          <div className="w-64 h-3 bg-slate-200 rounded-full overflow-hidden mb-6 flex items-center">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-amber-500 to-rose-600 transition-all duration-75"
              style={{ width: `${Math.max(8, audioLevel)}%` }}
            />
          </div>

          {/* Dual Language Detection Note */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-5 bg-white/80 px-3 py-1.5 rounded-lg border border-rose-200/70">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-farsi">تشخیص خودکار گفتار و لهجه</span>
          </div>

          {/* Large Stop & Interpret Button */}
          <button
            id="btn-stop-recording"
            onClick={stopRecording}
            title="Stop recording and translate speech / پایان ضبط و ترجمه گفتار"
            aria-label="Stop recording and translate speech / پایان ضبط و ترجمه گفتار"
            className="w-full max-w-md py-4 px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-3 transition active:scale-98"
          >
            <Square className="w-5 h-5 fill-current" />
            <div className="flex flex-col items-start text-left leading-tight">
              <span className="text-base font-farsi font-bold">پایان صحبت و ترجمه</span>
              <span className="text-xs opacity-90 font-sans font-semibold">Finish & Translate Speech</span>
            </div>
          </button>
        </div>
      ) : (
        /* DUAL CARDS FOR REFUGEE & CASEWORKER */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PERSON 1: REFUGEE SIDE (Persian Only in Panel) */}
          <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-teal-500/10 via-teal-50/30 to-white border-2 border-teal-200 hover:border-teal-400 rounded-2xl transition shadow-xs group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold font-farsi">
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>بخش پناهجو</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-white border border-teal-200 px-2 py-0.5 rounded-md font-farsi">
                  فارسی / دری
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 font-farsi">
                فارسی یا دری صحبت کنید
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 font-farsi leading-relaxed">
                گفتار شما به لهجه‌های مختلف (کابلی، هراتی، هزارگی، تهرانی) به انگلیسی روان ترجمه می‌شود.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-teal-700 font-semibold font-farsi">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>تشخیص هوشمند لهجه فعال است</span>
              </div>
            </div>

            <button
              id="btn-record-farsi-speaker"
              onClick={() => startRecording('farsi_to_english')}
              disabled={isProcessing}
              title="Record Farsi & Dari Speech / ضبط صدای فارسی و دری"
              aria-label="Record Farsi & Dari Speech / ضبط صدای فارسی و دری"
              className={`mt-5 w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition shadow-md ${
                isProcessing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20 active:scale-98 group-hover:shadow-lg'
              }`}
            >
              <Mic className="w-5 h-5 text-teal-200" />
              <div className="flex flex-col items-center leading-tight">
                <span className="font-farsi text-base font-bold">🎤 فارسی صحبت کنید</span>
                <span className="text-[10px] opacity-80 uppercase tracking-wide font-sans">Press to speak Farsi / Dari</span>
              </div>
            </button>
          </div>

          {/* PERSON 2: CASEWORKER SIDE (English Only in Panel) */}
          <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-indigo-500/10 via-indigo-50/30 to-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl transition shadow-xs group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold">
                  <User className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Caseworker Section</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                  English
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Speak English
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Speak clearly in English. Your speech is translated into clear spoken Farsi and Dari.
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Automatic voice playback active</span>
              </div>
            </div>

            <button
              id="btn-record-english-speaker"
              onClick={() => startRecording('english_to_farsi')}
              disabled={isProcessing}
              title="Record English Speech / ضبط صدای انگلیسی"
              aria-label="Record English Speech / ضبط صدای انگلیسی"
              className={`mt-5 w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition shadow-md ${
                isProcessing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-indigo-700/20 active:scale-98 group-hover:shadow-lg'
              }`}
            >
              <Mic className="w-5 h-5 text-indigo-200" />
              <div className="flex flex-col items-center leading-tight">
                <span className="text-base font-bold">🎤 Speak English</span>
                <span className="text-[10px] font-farsi opacity-90">صحبت کنید (ترجمه به فارسی)</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Processing Status Message */}
      {isProcessing && (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-teal-900 bg-teal-100/80 p-3 rounded-xl animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-teal-700 shrink-0" />
          <span className="font-farsi">
            در حال ترجمه هوشمند و تولید گفتار صوتی... (Gracefully interpreting English & Farsi speech...)
          </span>
        </div>
      )}

      {/* Error / Permission Guidance Message */}
      {errorMessage && (
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3.5 rounded-xl animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed font-farsi">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={onSwitchToText}
              className="min-h-[44px] px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-farsi font-bold rounded-lg text-xs transition cursor-pointer"
            >
              تایپ متن (Switch to Text) ➔
            </button>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="min-h-[44px] px-2.5 py-1.5 text-rose-700 hover:text-rose-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Secondary Switch to Type */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 w-full flex items-center justify-between text-xs text-slate-500">
        <span className="font-farsi">ترجیح می‌دهید تایپ کنید؟ (Prefer typing?)</span>
        <button
          id="btn-switch-to-type"
          onClick={onSwitchToText}
          title="Switch to Text Typing Mode / تغییر به حالت تایپ متن"
          aria-label="Switch to Text Typing Mode / تغییر به حالت تایپ متن"
          className="font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2 transition"
        >
          Type Text (تایپ متن) ➔
        </button>
      </div>
    </div>
  );
};

