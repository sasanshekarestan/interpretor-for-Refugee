import { FormQuestion } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  textFa: string;
  textEn?: string;
  timestamp: number;
  fieldKey?: string;
  suggestedAnswer?: string;
  quickSuggestions?: string[];
}

export interface CustomFormObject {
  id: string;
  title: string;
  titleFa: string;
  description: string;
  category: string;
  questionsCount: number;
  questions: FormQuestion[];
  uploadedPages?: {
    id: string;
    pageNumber: number;
    dataUrl: string;
    fileName: string;
    fileType?: string;
    htmlContent?: string;
    isBlurryOrDark?: boolean;
  }[];
}

/** Which of the two phone views is showing. */
export type PhoneView = 'document' | 'questions';
