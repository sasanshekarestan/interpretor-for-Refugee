export type TranslationDirection = 'farsi_to_english' | 'english_to_farsi';

export type UserLanguage = 'farsi' | 'dari' | 'english';

export type AppTab = 'home' | 'interpreter' | 'letter_scanner' | 'form_companion' | 'message_writer' | 'phrases' | 'documents' | 'more';

export interface KeyTermExplanation {
  farsi: string;
  dari?: string;
  english: string;
  explanation: string;
  simpleEnglish?: string;
  category?: 'asylum' | 'housing' | 'healthcare' | 'legal' | 'support' | 'benefits' | 'work' | 'education' | 'police' | 'general';
  whereHeard?: string;
  exampleSentence?: string;
  relatedTerms?: string[];
}

export interface InterpretationResult {
  id: string;
  timestamp: number;
  direction: TranslationDirection;
  sourceText: string;
  translatedText: string;
  detectedDialect?: string; // e.g. "Afghan Dari (Kabuli)", "Hazaragi", "Iranian Farsi (Tehrani)", "Herati"
  dialectConfidence?: number;
  dialectNotes?: string;
  britishPhrasing?: string; // Clear British conversational English
  formalPhrasing?: string; // Formal version for Home Office or solicitors
  phoneticSpelling?: string; // Pinglish / pronunciation assistance
  keyTerms?: KeyTermExplanation[];
  toneOrEmotion?: string; // e.g., "Anxious / Urgent medical query"
  audioBase64?: string; // Server TTS audio if generated
  lowConfidence?: boolean;
  confidenceMessage?: string;
  pinnedDetails?: string[];
  rating?: 'up' | 'down';
  speaker?: 'you' | 'caseworker';
}

export interface QuickPhrase {
  id: string;
  category: 'emergency' | 'home_office' | 'health' | 'housing' | 'legal' | 'daily' | 'support' | 'work' | 'education';
  farsiText: string;
  dariText?: string;
  dariNote?: string;
  englishText: string;
  phonetic: string;
}

export interface SavedPhrase {
  id: string;
  label: string;
  farsiText: string;
  dariText?: string;
  englishText: string;
  category?: string;
  createdAt: number;
}

export interface EmbedSettings {
  theme: 'light' | 'dark' | 'system' | 'teal';
  compactMode: boolean;
  autoSpeak: boolean;
  voiceSpeed: number; // 1.0 = normal, 0.75 = slow English mode
  userLanguage: UserLanguage;
  defaultDialect: 'all' | 'iranian' | 'afghan_dari' | 'hazaragi';
  targetAudience: 'refugee_first' | 'advisor_first';
  fontSize: 'normal' | 'large' | 'xlarge';
  simpleEnglishMode: boolean;
}

export interface LetterAnalysisResult {
  id: string;
  timestamp: number;
  letterType: string;
  /** The category in Persian - the reader may know very little English. */
  letterTypeFa?: string;
  sender: string;
  whatIsThis: string;
  whatIsThisFa?: string;
  whatDoesItSayFa: string;
  whatDoesItSayEn: string;
  whatDoINeedToDo: { en: string; fa: string; urgency: 'high' | 'medium' | 'normal' }[];
  importantDates: { date: string; action: string; faAction: string }[];
  importantNamesContact: { nameOrOrg: string; roleOrDetail: string; contactInfo: string }[];
  questionsToAsk: { questionEn: string; questionFa: string }[];
  ukContextTerms: { term: string; faExplanation: string; simpleEn: string }[];
  timelineSteps: { step: number; titleEn: string; titleFa: string; descriptionFa: string }[];
  suggestedResponseEn: string;
  suggestedResponseFa: string;
  legalNotice: string;
  documentImageBase64?: string;
}

export interface FormQuestion {
  id: string;
  number: number;
  questionCode?: string; // e.g. "Q1-1", "Q1-2", "Q2-1" matching paper form numbering
  shortLabelFa?: string; // e.g. "نام کامل", "علت درخواست"
  totalQuestions?: number;
  section: string;
  questionEn: string;
  simpleEnglish: string;
  farsiTranslation: string;
  dariTranslation: string;
  explanationFa: string;
  whatTypeInfoNeeded: string;
  exampleFormat: string;
  isLegallySensitive?: boolean;
  legalAidNotice?: string;
  fieldKey: string;
  required?: boolean;
  isCheckbox?: boolean;
  options?: { value: string; labelEn: string; labelFa: string }[];
  superSimpleExplanationFa?: string;
  superSimpleExplanationDari?: string;
  concreteExampleAnswer?: string;
}

export interface FormAnswer {
  fieldKey: string;
  questionNumber: number;
  questionEn: string;
  userRawInput: string;
  extractedAnswer: string;
  languageUsed: UserLanguage;
  confidence: 'high' | 'medium' | 'low';
  needsConfirmation: boolean;
  confirmed: boolean;
  timestamp: number;
}

export interface FormConsistencyWarning {
  fieldKey: string;
  issueEn: string;
  issueFa: string;
  suggestionEn: string;
  suggestionFa: string;
}

export interface SavedDocument {
  id: string;
  title: string;
  category: 'identity' | 'home_office' | 'housing' | 'benefits' | 'nhs' | 'legal' | 'education' | 'other';
  dateUploaded: number;
  filename: string;
  previewUrl?: string;
  notes?: string;
  relatedForm?: string;
}

export interface GeneratedMessage {
  id: string;
  timestamp: number;
  recipientCategory: string;
  originalText: string;
  englishMessage: string;
  farsiTranslation: string;
  tone: 'polite' | 'firm' | 'professional' | 'simple';
  suggestions: string[];
}

