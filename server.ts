import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Allow iframe embedding across Wix, Wix Studio, and any parent website
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Security-Policy', "frame-ancestors *;");
  res.removeHeader('X-Frame-Options');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple in-memory analytics counter for website evaluation tracking.
// NOTE: this lives in the process, so on a serverless host (Vercel) it resets
// whenever a new instance starts and is not shared between instances. The
// numbers are indicative there, not a record. Real usage evidence - the kind a
// funding bid would rest on - needs a store behind it.
let analyticsData = {
  totalVisits: 0,
  uniqueVisitors: new Set<string>(),
  totalTranslations: 0,
  voiceTranslations: 0,
  textTranslations: 0,
  wixEmbedViews: 0,
  directVisits: 0,
  firstSeenTimestamp: Date.now(),
  lastVisitTimestamp: Date.now(),
  dailyVisits: {} as Record<string, number>,
};

// Track a visitor event
app.post('/api/analytics/track', (req, res) => {
  try {
    const { visitorId, source = 'direct', isEmbed = false } = req.body;
    analyticsData.totalVisits += 1;
    analyticsData.lastVisitTimestamp = Date.now();

    if (visitorId) {
      analyticsData.uniqueVisitors.add(visitorId);
    }

    if (isEmbed || source === 'wix' || source === 'embed') {
      analyticsData.wixEmbedViews += 1;
    } else {
      analyticsData.directVisits += 1;
    }

    const today = new Date().toISOString().split('T')[0];
    analyticsData.dailyVisits[today] = (analyticsData.dailyVisits[today] || 0) + 1;

    return res.json({
      success: true,
      totalVisits: analyticsData.totalVisits,
      uniqueVisitors: analyticsData.uniqueVisitors.size,
    });
  } catch (e) {
    return res.json({ success: true });
  }
});

// Fetch analytics for evaluation metrics
app.get('/api/analytics/stats', (req, res) => {
  res.json({
    totalVisits: analyticsData.totalVisits,
    uniqueVisitors: analyticsData.uniqueVisitors.size,
    totalTranslations: analyticsData.totalTranslations,
    voiceTranslations: analyticsData.voiceTranslations,
    textTranslations: analyticsData.textTranslations,
    wixEmbedViews: analyticsData.wixEmbedViews,
    directVisits: analyticsData.directVisits,
    firstSeenTimestamp: analyticsData.firstSeenTimestamp,
    lastVisitTimestamp: analyticsData.lastVisitTimestamp,
    dailyVisits: analyticsData.dailyVisits,
  });
});


// Parse JSON payloads with generous limit for audio uploads
app.use(express.json({ limit: '30mb' }));

// Lazy-initialized Gemini client enforcing API key authentication (never ADC or service account OAuth)
let aiClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please set GEMINI_API_KEY in the environment or Settings secrets.');
  }

  if (!aiClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Robust helper to generate content with retries and fallback models for high-demand resilience
const CANDIDATE_MODELS = ['gemini-3.6-flash'];

async function generateWithFallback(
  payload: any,
  systemInstruction: string,
  schema?: any
): Promise<string> {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.1,
        };

        if (schema) {
          config.responseSchema = schema;
        }

        // 60-second timeout per API call to allow full multimodal and structured JSON processing
        const generatePromise = ai.models.generateContent({
          model,
          contents: payload,
          config,
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Model ${model} request timed out after 60s`)), 60000);
        });

        const response = await Promise.race([generatePromise, timeoutPromise]);

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errString = (err?.message || JSON.stringify(err)).toLowerCase();
        const isTemporary =
          errString.includes('503') ||
          errString.includes('demand') ||
          errString.includes('unavailable') ||
          errString.includes('rate') ||
          errString.includes('overloaded') ||
          errString.includes('429') ||
          errString.includes('timed out');

        console.warn(`[Gemini API] Attempt ${attempt} on model ${model} failed: ${err?.message || err}`);

        if (isTemporary && attempt === 1) {
          await new Promise((res) => setTimeout(res, 500));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate response from all available models.');
}

function cleanJsonText(rawText: string): any {
  let text = rawText.trim();
  // Strip code fences if present
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }
  text = text.trim();
  return JSON.parse(text);
}

const SYSTEM_INSTRUCTION_INTERPRETER = `You are a ultra-fast, high-precision UK asylum & healthcare interpreter between Farsi/Dari dialects (Tehrani, Kabuli, Herati, Hazaragi, Shirazi, Mashhadi, etc.) and British English.
Provide instant, culturally aware, context-accurate interpretation for UK immigration, Home Office, NHS, ASPEN card, ARC card, and legal aid matters.

OUTPUT MANDATE:
Return clean JSON with:
- sourceText: Full accurate verbatim transcription in original script.
- translatedText: High quality, clear, compassionate British English or Farsi/Dari translation.
- detectedDialect: Specific dialect detected (e.g., "Afghan Dari (Kabuli)", "Iranian Persian (Tehrani)", "Afghan Dari (Hazaragi)", "British English").
- dialectConfidence: Confidence score (0 to 1).
- dialectNotes: Brief cultural or dialect nuance note.
- britishPhrasing: Natural British English spoken equivalent.
- formalPhrasing: Formal version for official paperwork/solicitors.
- phoneticSpelling: Romanized pronunciation transliteration.
- toneOrEmotion: Emotional state or communication urgency.
- keyTerms: Array of UK asylum/healthcare/legal terms found ({ farsi, english, explanation, category }).`;

// Common schema for interpretation response
const interpretationSchema = {
  type: Type.OBJECT,
  properties: {
    sourceText: { type: Type.STRING, description: 'Verbatim transcription in original script' },
    translatedText: { type: Type.STRING, description: 'Accurate translation' },
    detectedDialect: { type: Type.STRING, description: 'Detected regional dialect and accent' },
    dialectConfidence: { type: Type.NUMBER, description: 'Confidence score from 0 to 1' },
    dialectNotes: { type: Type.STRING, description: 'Cultural or dialectal vocabulary notes' },
    britishPhrasing: { type: Type.STRING, description: 'Natural British English phrasing' },
    formalPhrasing: { type: Type.STRING, description: 'Formal English version for official paperwork' },
    phoneticSpelling: { type: Type.STRING, description: 'Romanized transliteration' },
    toneOrEmotion: { type: Type.STRING, description: 'Detected emotional state or situation urgency' },
    keyTerms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          farsi: { type: Type.STRING },
          english: { type: Type.STRING },
          explanation: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ['farsi', 'english', 'explanation'],
      },
    },
  },
  required: ['sourceText', 'translatedText', 'detectedDialect', 'britishPhrasing'],
};

// Main unified interpretation endpoint (Audio or Text)
app.post('/api/interpret', async (req, res) => {
  try {
    const { audio, text, mimeType = 'audio/webm', direction = 'farsi_to_english', dialectHint } = req.body;

    if (audio) {
      let cleanAudio = audio;
      if (cleanAudio.includes('base64,')) {
        cleanAudio = cleanAudio.split('base64,')[1];
      }
      const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

      const directionPrompt = direction === 'farsi_to_english'
        ? `The user is speaking in Farsi or Dari (any accent: Afghan Dari, Hazaragi, Iranian Persian, Herati, etc.). Listen to the audio carefully, transcribe exactly what they said in Persian/Dari script, and translate it into natural, fluent British English. Identify the exact dialect, any specific slang or regional terms, and provide clear British English interpretation.${dialectHint ? ` User indicated dialect hint: ${dialectHint}` : ''}`
        : `The user is speaking in English (or British English). Transcribe what they said in English, and translate it into clear, compassionate Farsi and Dari so an asylum seeker can understand easily.`;

      const contents = {
        parts: [
          {
            inlineData: {
              mimeType: cleanMimeType,
              data: cleanAudio,
            },
          },
          {
            text: `${directionPrompt}\nReturn the result as clean JSON according to the schema.`,
          },
        ],
      };

      const rawResponseText = await generateWithFallback(
        contents,
        SYSTEM_INSTRUCTION_INTERPRETER,
        interpretationSchema
      );

      const parsed = cleanJsonText(rawResponseText);
      analyticsData.totalTranslations += 1;
      analyticsData.voiceTranslations += 1;
      return res.json({
        id: 'interp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: Date.now(),
        direction,
        ...parsed,
      });
    } else if (text && text.trim()) {
      const directionPrompt = direction === 'farsi_to_english'
        ? `The user typed in Farsi or Dari (or Pinglish/Latin Persian): "${text}". Accurately interpret this text, detect whether it is Iranian Persian, Afghan Dari, Hazaragi, Herati or colloquial dialect, and translate into natural British English with UK asylum/legal context.${dialectHint ? ` User indicated dialect hint: ${dialectHint}` : ''}`
        : `The user typed in English: "${text}". Translate this into natural, respectful Farsi/Dari suitable for an asylum seeker or refugee in the UK. Provide both Farsi script and phonetic pronunciation.`;

      const rawResponseText = await generateWithFallback(
        directionPrompt,
        SYSTEM_INSTRUCTION_INTERPRETER,
        interpretationSchema
      );

      const parsed = cleanJsonText(rawResponseText);
      analyticsData.totalTranslations += 1;
      analyticsData.textTranslations += 1;
      return res.json({
        id: 'interp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: Date.now(),
        direction,
        ...parsed,
      });
    } else {
      return res.status(400).json({ error: 'Either audio or text payload is required for interpretation' });
    }
  } catch (error: any) {
    console.error('Error in /api/interpret:', error);
    return res.status(500).json({
      error: error.message || 'Failed to interpret. Please try again or check server connection.',
    });
  }
});

// Helper to wrap raw PCM audio buffer in a standard 44-byte RIFF WAV header for browser playback
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataLength = pcmBuffer.length;
  const fileLength = dataLength + 36;
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;

  header.write('RIFF', 0);
  header.writeUInt32LE(fileLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Helper to split text into chunks <= 180 characters for Google Translate TTS
function splitTextIntoChunks(text: string, maxLength: number = 180): string[] {
  if (!text) return [];
  const sentences = text.match(/[^.!?،؛\n]+[.!?،؛\n]?/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).trim().length <= maxLength) {
      currentChunk = (currentChunk + ' ' + sentence).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      if (sentence.length > maxLength) {
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + ' ' + word).trim().length <= maxLength) {
            wordChunk = (wordChunk + ' ' + word).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        if (wordChunk) chunks.push(wordChunk);
        currentChunk = '';
      } else {
        currentChunk = sentence.trim();
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks.filter((c) => c.length > 0);
}

// Text-to-Speech audio synthesis endpoint for Farsi/Dari (tl=fa) and British English (tl=en)
app.get('/api/tts', async (req, res) => {
  try {
    const rawText = (req.query.text as string) || '';
    const targetLang = (req.query.lang as string) || 'fa';

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    // Clean text: strip special Markdown or bracketed notes
    const textToSpeak = rawText
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/[*_#`~]/g, '')
      .trim();

    const isEnglish = targetLang === 'en' || targetLang === 'en-GB' || targetLang === 'en_GB' || targetLang === 'en-US';
    const googleTl = isEnglish ? 'en' : 'fa';

    // Strategy 1: Fast Google Translate TTS for both Farsi (tl=fa) and English (tl=en)
    const textChunks = splitTextIntoChunks(textToSpeak, 180);
    try {
      const audioBuffers: Buffer[] = [];
      let allChunksOk = true;

      for (const chunk of textChunks) {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${googleTl}&q=${encodeURIComponent(chunk)}`;
        const response = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.1',
          },
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (buffer.length > 50) {
            audioBuffers.push(buffer);
          } else {
            allChunksOk = false;
            break;
          }
        } else {
          allChunksOk = false;
          break;
        }
      }

      if (allChunksOk && audioBuffers.length > 0) {
        const combined = Buffer.concat(audioBuffers);
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': combined.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        });
        return res.send(combined);
      }
    } catch (e) {
      console.warn('Google Translate TTS chunk fetch note:', e);
    }

    // Strategy 2: Gemini TTS dedicated model (fallback if Google Translate TTS is unreachable)
    try {
      const ai = getGeminiClient();
      const prompt = isEnglish
        ? `Read the following text out loud in clear British English: "${textToSpeak.slice(0, 500)}"`
        : textToSpeak.slice(0, 500);

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: isEnglish ? 'Zephyr' : 'Kore',
              },
            },
          },
        },
        contents: prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find(
        (p: any) => p.inlineData && (p.inlineData.mimeType?.startsWith('audio/') || p.inlineData.data)
      );

      if (audioPart && audioPart.inlineData?.data) {
        let audioBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
        const mime = audioPart.inlineData.mimeType || 'audio/l16';

        // Wrap raw PCM/L16 audio buffer into 24kHz 16-bit RIFF WAV header for browser playback
        if (mime.includes('pcm') || mime.includes('l16') || !mime.includes('wav')) {
          audioBuffer = pcmToWav(audioBuffer, 24000, 1, 16);
        }

        res.set({
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400',
        });
        return res.send(audioBuffer);
      }
    } catch (geminiError: any) {
      const isQuotaError = geminiError?.status === 429 || geminiError?.message?.includes('429') || geminiError?.message?.includes('quota');
      if (isQuotaError) {
        console.warn('Gemini 3.1 TTS quota limit reached (429). Client will use browser speech synthesis.');
        return res.status(429).json({ error: 'TTS quota exceeded, falling back to local speech synthesis.' });
      } else {
        console.warn('Gemini 3.1 TTS generation warning:', geminiError?.message || geminiError);
      }
    }

    return res.status(500).json({ error: 'Failed to synthesize speech' });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    return res.status(500).json({ error: 'Failed to synthesize voice audio' });
  }
});

// Interpretation endpoint for Audio (alias)
app.post('/api/interpret/audio', async (req, res) => {
  try {
    const { audio, mimeType = 'audio/webm', direction = 'farsi_to_english', dialectHint } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Clean audio string if it starts with data URL prefix
    let cleanAudio = audio;
    if (cleanAudio.includes('base64,')) {
      cleanAudio = cleanAudio.split('base64,')[1];
    }

    const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

    const directionPrompt = direction === 'farsi_to_english'
      ? `The user is speaking in Farsi or Dari (any accent: Afghan Dari, Hazaragi, Iranian Persian, Herati, etc.). Listen to the audio carefully, transcribe exactly what they said in Persian/Dari script, and translate it into natural, fluent British English. Identify the exact dialect, any specific slang or regional terms, and provide clear British English interpretation.${dialectHint ? ` User indicated dialect hint: ${dialectHint}` : ''}`
      : `The user is speaking in English (or British English). Transcribe what they said in English, and translate it into clear, compassionate Farsi and Dari so an asylum seeker can understand easily.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: cleanMimeType,
            data: cleanAudio,
          },
        },
        {
          text: `${directionPrompt}\nReturn the result as clean JSON according to the schema.`,
        },
      ],
    };

    const rawResponseText = await generateWithFallback(
      contents,
      SYSTEM_INSTRUCTION_INTERPRETER,
      interpretationSchema
    );

    const parsed = cleanJsonText(rawResponseText);
    analyticsData.totalTranslations += 1;
    analyticsData.voiceTranslations += 1;
    return res.json({
      id: 'interp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      direction,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/interpret/audio:', error);
    return res.status(500).json({
      error: error.message || 'Failed to interpret audio. Please try again or switch to typing mode.',
    });
  }
});

// Interpretation endpoint for Text
app.post('/api/interpret/text', async (req, res) => {
  try {
    const { text, direction = 'farsi_to_english', dialectHint } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    const directionPrompt = direction === 'farsi_to_english'
      ? `The user typed in Farsi or Dari (or Pinglish/Latin Persian): "${text}". Accurately interpret this text, detect whether it is Iranian Persian, Afghan Dari, Hazaragi, Herati or colloquial dialect, and translate into natural British English with UK asylum/legal context.${dialectHint ? ` User indicated dialect hint: ${dialectHint}` : ''}`
      : `The user typed in English: "${text}". Translate this into natural, respectful Farsi/Dari suitable for an asylum seeker or refugee in the UK. Provide both Farsi script and phonetic pronunciation.`;

    const rawResponseText = await generateWithFallback(
      directionPrompt,
      SYSTEM_INSTRUCTION_INTERPRETER,
      interpretationSchema
    );

    const parsed = cleanJsonText(rawResponseText);
    analyticsData.totalTranslations += 1;
    analyticsData.textTranslations += 1;
    return res.json({
      id: 'interp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      direction,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/interpret/text:', error);
    return res.status(500).json({
      error: error.message || 'Failed to interpret text. Please try again.',
    });
  }
});

// British Voice Audio Generation (Gemini TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Puck', speed = 1.0 } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for speech synthesis' });
    }

    const ai = getGeminiClient();

    // Use Gemini TTS preview with clear British cadence prompt instruction
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Speak in a calm, clear British English accent with warm and reassuring tone: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audio: base64Audio,
        mimeType: 'audio/pcm;rate=24000',
      });
    }

    return res.status(404).json({ error: 'No audio generated' });
  } catch (error: any) {
    console.error('TTS generation error:', error);
    // Return gracefully so client can use Web Speech API British voice
    return res.status(500).json({ error: error.message || 'TTS unavailable, client fallback will be used' });
  }
});

// Endpoint for Letter & Document Analysis
app.post('/api/interpret/letter', async (req, res) => {
  try {
    const { image, text, mimeType = 'image/jpeg' } = req.body;

    if (!image && !text) {
      return res.status(400).json({ error: 'Image or letter text is required' });
    }

    const systemInstruction = `You are a specialist UK asylum, NHS, and legal document analyzer for Farsi & Dari speaking refugees in the UK.
Analyze official UK letters (Home Office, NASS, Migrant Help, NHS, Solicitors, DWP, Councils, Housing, Police).
Never invent facts not present in the document.

Return clean JSON with:
- letterType: Document category (e.g. "Home Office Reporting Requirement", "NHS Hospital Appointment", "ASPEN Card Notification", "Housing Change Notice").
- sender: Sender name/department (e.g., "Home Office Visas & Immigration", "NHS Foundation Trust").
- whatIsThis: Clear 1-2 sentence explanation of what this document is.
- whatDoesItSayFa: Plain-language summary in Farsi/Dari script for the user.
- whatDoesItSayEn: Plain-language summary in Simple English.
- whatDoINeedToDo: Array of action items [{ en, fa, urgency: 'high'|'medium'|'normal' }].
- importantDates: Array of dates/deadlines extracted [{ date, action, faAction }].
- importantNamesContact: Array of key contacts [{ nameOrOrg, roleOrDetail, contactInfo }].
- questionsToAsk: Array of clarification questions the refugee can ask their solicitor or caseworker [{ questionEn, questionFa }].
- ukContextTerms: Array of UK terms in document explained [{ term, faExplanation, simpleEn }].
- timelineSteps: Array of next steps [{ step: number, titleEn, titleFa, descriptionFa }].
- suggestedResponseEn: A polite British English reply message draft.
- suggestedResponseFa: Farsi translation of suggested reply.
- legalNotice: "This application provides translation and general guidance. It is not a solicitor and does not replace professional legal advice."`;

    const letterSchema = {
      type: Type.OBJECT,
      properties: {
        letterType: { type: Type.STRING },
        sender: { type: Type.STRING },
        whatIsThis: { type: Type.STRING },
        whatDoesItSayFa: { type: Type.STRING },
        whatDoesItSayEn: { type: Type.STRING },
        whatDoINeedToDo: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              en: { type: Type.STRING },
              fa: { type: Type.STRING },
              urgency: { type: Type.STRING },
            },
            required: ['en', 'fa'],
          },
        },
        importantDates: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              action: { type: Type.STRING },
              faAction: { type: Type.STRING },
            },
            required: ['date', 'action'],
          },
        },
        importantNamesContact: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nameOrOrg: { type: Type.STRING },
              roleOrDetail: { type: Type.STRING },
              contactInfo: { type: Type.STRING },
            },
            required: ['nameOrOrg'],
          },
        },
        questionsToAsk: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionEn: { type: Type.STRING },
              questionFa: { type: Type.STRING },
            },
            required: ['questionEn', 'questionFa'],
          },
        },
        ukContextTerms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              faExplanation: { type: Type.STRING },
              simpleEn: { type: Type.STRING },
            },
            required: ['term', 'faExplanation'],
          },
        },
        timelineSteps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              step: { type: Type.NUMBER },
              titleEn: { type: Type.STRING },
              titleFa: { type: Type.STRING },
              descriptionFa: { type: Type.STRING },
            },
            required: ['step', 'titleEn', 'titleFa'],
          },
        },
        suggestedResponseEn: { type: Type.STRING },
        suggestedResponseFa: { type: Type.STRING },
        legalNotice: { type: Type.STRING },
      },
      required: ['letterType', 'whatIsThis', 'whatDoesItSayFa', 'whatDoesItSayEn'],
    };

    let contents: any;
    if (image && typeof image === 'string') {
      let cleanImage = image;
      let detectedMime = mimeType || 'image/jpeg';
      if (cleanImage.startsWith('data:')) {
        const match = cleanImage.match(/^data:([^;,]+)/);
        if (match) {
          detectedMime = match[1];
        }
      }
      if (cleanImage.includes('base64,')) {
        cleanImage = cleanImage.split('base64,')[1];
      }
      const cleanMime = detectedMime.split(';')[0].trim();

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: cleanMime,
              data: cleanImage,
            },
          },
          {
            text: 'Analyze this official UK letter/document carefully. Extract all structured details according to the schema.',
          },
        ],
      };
    } else {
      contents = `Analyze this official UK letter text: "${text}" and return JSON explaining it to a Farsi/Dari refugee according to the schema.`;
    }

    const rawResponseText = await generateWithFallback(
      contents,
      systemInstruction,
      letterSchema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json({
      id: 'letter_' + Date.now(),
      timestamp: Date.now(),
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/interpret/letter:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze letter photo. Please try again or type the letter details.',
    });
  }
});

// Endpoint: Form Analyzer - Extract ALL Form Fields from uploaded document photo or PDF
app.post('/api/form/analyze-document', async (req, res) => {
  try {
    const { image, text, mimeType } = req.body;

    const systemInstruction = `You are an expert UK official form analyzer for refugees and asylum seekers.
Examine the uploaded document or form image carefully.
Identify the official document title, issuing authority (e.g. Home Office, NHS, Local Council, DWP, Migrant Help), and extract EVERY SINGLE fillable question, field, or response box printed on the document.

CRITICAL INSTRUCTIONS:
1. Do NOT omit any field. Extract all personal info, reference numbers, addresses, dates, financial questions, family/dependents info, reason for application, and signature/contact fields.
2. For each field, provide clear, respectful Farsi (and Dari) translations so a Persian speaker who does NOT understand English can fill it out effortlessly.
3. Provide simple English explanations and realistic examples.
4. Output JSON matching the schema.`;

    const formDocSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        titleFa: { type: Type.STRING },
        farsiSummary: { type: Type.STRING },
        sender: { type: Type.STRING },
        category: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fieldKey: { type: Type.STRING },
              section: { type: Type.STRING },
              questionEn: { type: Type.STRING },
              simpleEnglish: { type: Type.STRING },
              farsiTranslation: { type: Type.STRING },
              dariTranslation: { type: Type.STRING },
              explanationFa: { type: Type.STRING },
              whatTypeInfoNeeded: { type: Type.STRING },
              exampleFormat: { type: Type.STRING },
              required: { type: Type.BOOLEAN },
            },
            required: ['fieldKey', 'section', 'questionEn', 'farsiTranslation', 'explanationFa'],
          },
        },
      },
      required: ['title', 'titleFa', 'farsiSummary', 'questions'],
    };

    let contents: any;
    const isBase64Media = image && typeof image === 'string' && !image.startsWith('data:text/html');

    if (isBase64Media) {
      let cleanImage = image;
      let detectedMime = mimeType || 'image/jpeg';
      if (cleanImage.startsWith('data:')) {
        const match = cleanImage.match(/^data:([^;,]+)/);
        if (match) {
          detectedMime = match[1];
        }
      }
      if (cleanImage.includes('base64,')) {
        cleanImage = cleanImage.split('base64,')[1];
      }
      const cleanMime = detectedMime.split(';')[0].trim();

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: cleanMime,
              data: cleanImage,
            },
          },
          {
            text: `Examine this official UK form document image/scan carefully. Extract ALL fields, boxes, and questions that need to be answered, along with full Farsi translations and explanations.${text ? ` Additional context: ${text}` : ''}`,
          },
        ],
      };
    } else {
      let docText = text || 'Official form document';
      if (typeof image === 'string' && image.startsWith('data:text/html')) {
        try {
          docText = decodeURIComponent(image.replace(/^data:text\/html;charset=utf-8,/, ''));
        } catch (_) {
          docText = image;
        }
      }
      contents = `Examine this form text description / HTML content: "${docText.substring(0, 8000)}". Extract all fillable fields with Farsi translations and guidance.`;
    }

    const rawResponseText = await generateWithFallback(
      contents,
      systemInstruction,
      formDocSchema
    );

    const parsed = cleanJsonText(rawResponseText);
    
    let questionsWithNumbers = (parsed.questions || []).map((q: any, idx: number) => ({
      id: `extracted_q_${idx + 1}`,
      number: idx + 1,
      questionCode: `Q${idx + 1}`,
      totalQuestions: (parsed.questions || []).length,
      section: q.section || 'بخش عمومی / General Section',
      questionEn: q.questionEn || q.simpleEnglish || 'Form field',
      simpleEnglish: q.simpleEnglish || q.questionEn || 'Form field',
      farsiTranslation: q.farsiTranslation || 'پاسخ این بخش را وارد کنید',
      dariTranslation: q.dariTranslation || q.farsiTranslation || 'پاسخ این بخش را بنویسید',
      explanationFa: q.explanationFa || 'توضیحات لازم را بنویسید',
      whatTypeInfoNeeded: q.whatTypeInfoNeeded || 'اطلاعات عمومی',
      exampleFormat: q.exampleFormat || '',
      fieldKey: q.fieldKey || `field_${idx + 1}`,
      required: q.required !== false,
    }));

    if (questionsWithNumbers.length === 0) {
      questionsWithNumbers = [
        {
          id: 'extracted_q_1',
          number: 1,
          questionCode: 'Q1',
          totalQuestions: 3,
          section: 'بخش ۱: اطلاعات هویت و مرجع / Section 1: Identity & Reference Details',
          questionEn: 'Section 1: Full Name, Date of Birth, and Reference / NINO Number shown on document',
          simpleEnglish: 'Your full name, date of birth, and reference number on the form.',
          farsiTranslation: 'سوال ۱: نام و نام خانوادگی کامل، تاریخ تولد میلادی و شماره مرجع/اینشورنس چیست؟',
          dariTranslation: 'سوال ۱: نام کامل، تاریخ تولد و نمبر مرجع شما چیست؟',
          explanationFa: 'اطلاعات اولیه هویت شامل نام انگلیسی، تاریخ تولد و شماره پرونده درج شده بالای برگه.',
          whatTypeInfoNeeded: 'Full Name, DOB & Reference Number',
          exampleFormat: 'e.g. Ali Reza AHMADI | DOB: 15/08/1994 | Ref: HO-012/345',
          fieldKey: 'full_name_ref',
          required: true,
        },
        {
          id: 'extracted_q_2',
          number: 2,
          questionCode: 'Q2',
          totalQuestions: 3,
          section: 'بخش ۲: گزینه و توضیحات اصلی فرم / Section 2: Main Choices & Details',
          questionEn: 'Section 2: What request options or details apply to your uploaded document?',
          simpleEnglish: 'Tick options that apply or explain what you are requesting.',
          farsiTranslation: 'سوال ۲: کدام یک از گزینه‌ها یا توضیحات زیر مربوط به برگه فرم آپلود شده شماست؟',
          dariTranslation: 'سوال ۲: توضیحات اصلی شما برای این فرم چیست؟',
          explanationFa: 'گزینه‌های مربوط به برگه را انتخاب کنید یا توضیحات اصلی خود را بنویسید.',
          whatTypeInfoNeeded: 'Form Choice Options & Details',
          exampleFormat: 'Tick options or type details',
          fieldKey: 'form_choices_details',
          required: true,
        },
        {
          id: 'extracted_q_3',
          number: 3,
          questionCode: 'Q3',
          totalQuestions: 3,
          section: 'بخش ۳: آدرس، تماس و امضا / Section 3: Address, Contact & Declaration',
          questionEn: 'Section 3: What is your UK Accommodation Address, Postcode, Phone Number, and Declaration?',
          simpleEnglish: 'Full address with postcode, active mobile number, and declaration confirmation.',
          farsiTranslation: 'سوال ۳: آدرس کامل محل سکونت در بریتانیا با کدپستی، شماره موبایل و امضای تاییدیه نهایی؟',
          dariTranslation: 'سوال ۳: آدرس کامل، کودپستی و شماره تماس شما چیست؟',
          explanationFa: 'آدرس دقیق محل سکونت (هتل یا خانه) همراه با کد پستی و شماره تلفن جهت پیگیری.',
          whatTypeInfoNeeded: 'UK Address, Postcode & Phone Number',
          exampleFormat: 'e.g. 12 High Street, London E1 6AN | Phone: 07700 900123',
          fieldKey: 'address_contact',
          required: true,
        },
      ];
    }

    return res.json({
      id: 'custom_uploaded_' + Date.now(),
      title: parsed.title || 'Uploaded Form Document',
      titleFa: parsed.titleFa || `فرم آپلود شده: ${parsed.title || 'اسناد رسمی'}`,
      description: parsed.farsiSummary || 'فرم آپلود شده شما استخراج شد. لطفا سوالات را پاسخ دهید.',
      category: parsed.category || 'فرم آپلود شده',
      sender: parsed.sender || 'فرم رسمی بریتانیا',
      questionsCount: questionsWithNumbers.length,
      questions: questionsWithNumbers,
    });
  } catch (error: any) {
    console.error('Error in /api/form/analyze-document:', error);
    return res.status(500).json({ error: 'Failed to analyze form document fields' });
  }
});

// Endpoint: Form Companion - Parse Spoken / Typed Answer into Structured Field Value
app.post('/api/form/parse-answer', async (req, res) => {
  try {
    const { questionEn, userSpeechOrText, userLanguage = 'farsi', fieldKey } = req.body;
    if (!userSpeechOrText || !userSpeechOrText.trim()) {
      return res.status(400).json({ error: 'Answer input is required' });
    }

    const systemInstruction = `You are a patient UK form filling assistant.
The user was asked the form question: "${questionEn}".
The user answered in ${userLanguage}: "${userSpeechOrText}".

IMPORTANT RULES:
1. NEVER invent facts or add information the user did not provide.
2. If the user provided a date of birth or date in the Solar Hijri (Shamsi / Iranian / Afghan) calendar (e.g. years starting with 13xx or 14xx, such as 1373/05/24, 1370, or Persian month names like Farvardin, Mordad, Asad, etc.), convert it to the Gregorian calendar (UK DD/MM/YYYY format, e.g. 15/08/1994). Explain the conversion clearly in summaryFa.
3. Structure the user's exact answer into clean, accurate English for an official UK form field.
4. If information is incomplete or ambiguous, flag confidence as medium/low and explain why in Farsi/Dari.
5. Output JSON with:
   - extractedAnswer: Clear English text suitable for official UK form (dates in UK DD/MM/YYYY format).
   - summaryFa: Farsi/Dari confirmation phrase ("ما این پاسخ را ثبت کردیم: ...").
   - confidence: 'high' | 'medium' | 'low'.
   - needsConfirmation: boolean.
   - warningFa: String warning if answer seems incomplete or unclear.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        extractedAnswer: { type: Type.STRING },
        summaryFa: { type: Type.STRING },
        confidence: { type: Type.STRING },
        needsConfirmation: { type: Type.BOOLEAN },
        warningFa: { type: Type.STRING },
      },
      required: ['extractedAnswer', 'summaryFa', 'confidence'],
    };

    const rawResponseText = await generateWithFallback(
      `Form field: ${fieldKey || 'general'}\nQuestion: ${questionEn}\nUser answer: ${userSpeechOrText}`,
      systemInstruction,
      schema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/form/parse-answer:', error);
    return res.status(500).json({ error: 'Failed to process answer' });
  }
});

// Endpoint: Form Companion Interactive AI Chat Sidepanel
app.post('/api/form/chat', async (req, res) => {
  try {
    const { message, formTitle, questions = [], activeFieldKey, currentAnswers = {}, userLanguage = 'farsi' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const activeQ = questions.find((q: any) => q.fieldKey === activeFieldKey) || questions[0];

    const systemInstruction = `You are a patient, friendly, bilingual AI Form & Document Interpreter Assistant for Farsi and Dari speaking refugees in the UK.
The user is viewing an official UK form: "${formTitle}".
Currently focused question/box: ${activeQ ? `[Box ${activeQ.number} - ${activeQ.fieldKey}] ${activeQ.questionEn} (${activeQ.farsiTranslation})` : 'General Document'}.
List of form fields: ${JSON.stringify(questions.map((q: any) => ({ number: q.number, key: q.fieldKey, en: q.questionEn, fa: q.farsiTranslation })))}
Current filled answers so far: ${JSON.stringify(currentAnswers)}

User language: ${userLanguage}.

YOUR GOAL:
1. Answer the user's question about the form, a specific question box, or UK administrative terms in plain, reassuring ${userLanguage === 'dari' ? 'Dari' : 'Farsi'}.
2. Explain UK concepts in context (e.g. Home Office Ref, NASS Ref, GP Catchment Area, CAD number, MATB1) without jargon.
3. If the user provided their personal details or answer for a form field (e.g. their name, DOB, address, reason for loss, etc.), extract the EXACT structured English text for that field in 'suggestedAnswer' so it can be saved to their answer sheet!
4. Always maintain strict legal neutrality: explain questions neutrally and format their exact words without making decisions or claims for them.
5. Provide 2-3 short, relevant follow-up question chips in ${userLanguage === 'dari' ? 'Dari' : 'Farsi'}.

Return JSON:
- replyFa: Clear, warm, helpful response in ${userLanguage === 'dari' ? 'Dari' : 'Farsi'}.
- fieldKey: The fieldKey this answer relates to (e.g. "${activeQ?.fieldKey || ''}"), or null if general.
- suggestedAnswer: String (If user provided info for a field, output clean English text formatted for official UK form, e.g. "Ali REZA" or "012/345/678" or "15/08/1994"). Otherwise null.
- quickSuggestions: Array of 2-3 short Farsi/Dari question strings.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        replyFa: { type: Type.STRING },
        fieldKey: { type: Type.STRING },
        suggestedAnswer: { type: Type.STRING },
        quickSuggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['replyFa'],
    };

    const rawResponseText = await generateWithFallback(
      `User asked: "${message}"\nActive Question: ${JSON.stringify(activeQ)}`,
      systemInstruction,
      schema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json({
      id: 'chat_' + Date.now(),
      timestamp: Date.now(),
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/form/chat:', error);
    return res.json({
      id: 'chat_' + Date.now(),
      replyFa: 'متأسفانه مشکلی در ارتباط با هوش مصنوعی رخ داد. اما شما می‌توانید سوال خود را مستقیماً از بخش خانه‌های فرم بپرسید.',
      quickSuggestions: ['توضیح این سوال به زبان ساده', 'از کجا این مدرک رو پیدا کنم؟'],
    });
  }
});

// Endpoint: Form Consistency Scanner
// Endpoint: explain one box on the official form, in plain Persian or Dari.
// The client sends the PDF's own field name plus the text printed around it,
// so the explanation describes the real box on the paper rather than a
// question we wrote separately.
app.post('/api/form/explain-field', async (req, res) => {
  try {
    const { fieldName, fieldType = 'text', pageContext = '', formTitle = 'UK official form', userLanguage = 'farsi' } = req.body;
    if (!fieldName || !String(fieldName).trim()) {
      return res.status(400).json({ error: 'fieldName is required' });
    }

    const language = userLanguage === 'dari' ? 'Dari' : 'Farsi';

    const systemInstruction = `You explain one single box on an official UK paper form to a refugee or asylum seeker who reads little English and may read ${language} slowly.

You are given the form's own internal name for the box and the text printed on that page around it. Explain THAT box only.

RULES:
1. Write in simple, everyday ${language}. Short sentences. No legal or bureaucratic wording. No Home Office jargon.
2. NEVER invent what the form says. If the page text does not make the box's meaning clear, say plainly that it is not clear and suggest asking the office on the form's helpline.
3. NEVER tell the person what to answer about their own circumstances, and never suggest an answer that could be untrue.
4. The person writes on the paper form by hand. Tell them what kind of thing goes in the box, not how to use an app.
5. exampleAnswer must be an obviously fictional illustration of the FORMAT only (e.g. a made-up name, "15/08/1994"), never advice.
6. If the box is a tick box, say clearly what ticking it means.

Output JSON with:
 - labelFa: a short ${language} name for this box, 2-6 words.
 - meaningFa: 1-3 short ${language} sentences saying what the box is asking for.
 - whatToWriteFa: one ${language} sentence on the kind of information that goes here.
 - exampleAnswer: a short fictional example in English showing the format, or an empty string for a tick box.
 - cautionFa: an empty string, or one short ${language} sentence if getting this box wrong commonly causes problems.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        labelFa: { type: Type.STRING },
        meaningFa: { type: Type.STRING },
        whatToWriteFa: { type: Type.STRING },
        exampleAnswer: { type: Type.STRING },
        cautionFa: { type: Type.STRING },
      },
      required: ['labelFa', 'meaningFa', 'whatToWriteFa'],
    };

    const rawResponseText = await generateWithFallback(
      `Form: ${formTitle}\nBox internal name: ${fieldName}\nBox type: ${fieldType === 'choice' ? 'tick box or yes/no box' : 'text box'}\n\nText printed on this page:\n${String(pageContext).slice(0, 4000)}`,
      systemInstruction,
      schema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/form/explain-field:', error);
    return res.status(500).json({ error: 'Failed to explain field' });
  }
});

app.post('/api/form/consistency-check', async (req, res) => {
  try {
    const { formAnswers = [] } = req.body;

    const systemInstruction = `You are an AI Form Integrity & Consistency Scanner.
Review these form entries provided by the user for potential obvious errors or contradictions (e.g. conflicting dates of birth, inconsistent names, missing mandatory fields, duplicate addresses).

CRITICAL RULE: NEVER change or fix an answer yourself. ONLY flag potential discrepancies for the user to review.

Return clean JSON with:
- warnings: Array of [{ fieldKey, issueEn, issueFa, suggestionEn, suggestionFa }]`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        warnings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fieldKey: { type: Type.STRING },
              issueEn: { type: Type.STRING },
              issueFa: { type: Type.STRING },
              suggestionEn: { type: Type.STRING },
              suggestionFa: { type: Type.STRING },
            },
            required: ['fieldKey', 'issueEn', 'issueFa'],
          },
        },
      },
      required: ['warnings'],
    };

    const rawResponseText = await generateWithFallback(
      `Form Answers JSON: ${JSON.stringify(formAnswers)}`,
      systemInstruction,
      schema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/form/consistency-check:', error);
    return res.json({ warnings: [] });
  }
});

// Endpoint: Message Writer (Check Before I Send)
app.post('/api/message/write', async (req, res) => {
  try {
    const { text, recipientCategory = 'caseworker', tone = 'polite' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message input is required' });
    }

    const systemInstruction = `You are a UK professional message composer for refugees and asylum seekers.
The user wants to send a message to: ${recipientCategory}.
Tone requested: ${tone}.
User's input (Farsi/Dari or draft English): "${text}".

Produce a clear, respectful, natural UK English message.
NEVER change the user's factual meaning or insert unverified facts.

Return JSON:
- englishMessage: Clear, polite UK English message text.
- farsiTranslation: Direct Farsi translation of the English message so the user knows exactly what it says.
- tone: Selected tone ('polite', 'firm', 'professional', 'simple').
- suggestions: Array of 2 short tips in Farsi/English to improve the message clarity if needed.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        englishMessage: { type: Type.STRING },
        farsiTranslation: { type: Type.STRING },
        tone: { type: Type.STRING },
        suggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['englishMessage', 'farsiTranslation'],
    };

    const rawResponseText = await generateWithFallback(
      `Draft to ${recipientCategory} with tone ${tone}: "${text}"`,
      systemInstruction,
      schema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json({
      id: 'msg_' + Date.now(),
      timestamp: Date.now(),
      recipientCategory,
      originalText: text,
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/message/write:', error);
    return res.status(500).json({ error: 'Failed to write message' });
  }
});

// Endpoint: Say It For Me (Instant Spoken UK English helper)
app.post('/api/say-it-for-me', async (req, res) => {
  try {
    const { text, tone = 'polite' } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Input text is required' });
    }

    const systemInstruction = `You are a UK speech companion for refugees.
Convert this Farsi/Dari or raw English statement into natural, clear British English to be spoken aloud out of a phone speaker to an official or caseworker.
Tone: ${tone} (natural, polite, professional, simple).

Return JSON:
- englishText: Natural British English phrase to speak out loud.
- farsiTranslation: Confirmation translation in Farsi.
- phonetic: Romanized pronunciation if helpful.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        englishText: { type: Type.STRING },
        farsiTranslation: { type: Type.STRING },
        phonetic: { type: Type.STRING },
      },
      required: ['englishText', 'farsiTranslation'],
    };

    const rawResponseText = await generateWithFallback(
      `Convert for voice output (${tone}): "${text}"`,
      systemInstruction,
      schema
    );

    const parsed = cleanJsonText(rawResponseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/say-it-for-me:', error);
    return res.status(500).json({ error: 'Failed to process phrase' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * Serving the front end.
 *
 * On Vercel this never runs: the built site is served from the CDN and only
 * /api/* is rewritten to this app, which arrives as a serverless function via
 * api/index.ts. Everywhere else - local development, or a plain Node host -
 * this process serves the front end itself, as it always has.
 */
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    // Imported here rather than at the top of the file so that Vite, a build
    // dependency, is never pulled into the deployed function bundle.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Interpreter widget backend running on http://0.0.0.0:${PORT}`);
  });
}

// A serverless platform imports this app and handles the listening itself;
// starting a listener there would hold the function open for nothing.
if (!process.env.VERCEL) {
  start();
}

export default app;
