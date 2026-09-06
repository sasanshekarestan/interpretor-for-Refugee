import { AppTab } from '../types';

/**
 * The name of every destination, in both languages, in one place.
 *
 * The navigation bar has its own shortened labels because it has a fifth of a
 * phone screen to work with. These are the full names, used wherever there is
 * room for them - at the moment, the back button, which has to say where it is
 * going rather than just that it goes somewhere.
 */
export const TAB_LABELS: Record<AppTab, { fa: string; en: string }> = {
  home: { fa: 'خانه', en: 'Home' },
  interpreter: { fa: 'مترجم زنده', en: 'Live interpreter' },
  letter_scanner: { fa: 'فهمیدن نامه', en: 'Letter reader' },
  form_companion: { fa: 'تکمیل فرم', en: 'Form companion' },
  message_writer: { fa: 'نوشتن پیام', en: 'Message writer' },
  phrases: { fa: 'اصطلاحات بریتانیا', en: 'UK terms and phrases' },
  documents: { fa: 'مدارک من', en: 'My documents' },
  more: { fa: 'بیشتر', en: 'More' },
};
