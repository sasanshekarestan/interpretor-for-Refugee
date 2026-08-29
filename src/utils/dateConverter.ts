/**
 * Utility functions for converting Solar Hijri (Shamsi / Jalali) dates to Gregorian dates (UK format: DD/MM/YYYY)
 */

export function faToEnDigits(str: string): string {
  if (!str) return '';
  const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(faDigits[i], 'g'), String(i));
    res = res.replace(new RegExp(arDigits[i], 'g'), String(i));
  }
  return res;
}

export const SHAMSI_MONTHS_FA = [
  { id: 1, fa: 'فروردین', afghani: 'حمل', en: 'Farvardin / Hamal' },
  { id: 2, fa: 'اردیبهشت', afghani: 'ثور', en: 'Ordibehesht / Saur' },
  { id: 3, fa: 'خرداد', afghani: 'جوزا', en: 'Khordad / Jawza' },
  { id: 4, fa: 'تیر', afghani: 'سرطان', en: 'Tir / Saratan' },
  { id: 5, fa: 'مرداد', afghani: 'اسد', en: 'Mordad / Asad' },
  { id: 6, fa: 'شهریور', afghani: 'سنبله', en: 'Shahrivar / Sonbola' },
  { id: 7, fa: 'مهر', afghani: 'میزان', en: 'Mehr / Mizan' },
  { id: 8, fa: 'آبان', afghani: 'عقرب', en: 'Aban / Aqrab' },
  { id: 9, fa: 'آذر', afghani: 'قوس', en: 'Azar / Qaws' },
  { id: 10, fa: 'دی', afghani: 'جدی', en: 'Dey / Jaddi' },
  { id: 11, fa: 'بهمن', afghani: 'دلو', en: 'Bahman / Dalw' },
  { id: 12, fa: 'اسفند', afghani: 'حوت', en: 'Esfand / Hoot' },
];

/**
 * Standard Jalali (Shamsi) to Gregorian conversion algorithm
 */
export function shamsiToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  sal_a = sal_a || [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy2 = (jy <= 979) ? 0 : 979;
  jy -= jy2;
  let days = (365 * jy) + (Math.floor(jy / 33) * 8) + Math.floor(((jy % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  let gy = 1600 + 400 * Math.floor(days / 146097);
  days %= 146097;
  let leap = true;
  if (days >= 36525) {
    days--;
    gy += 100 * Math.floor(days / 36524);
    days %= 36524;
    if (days >= 365) days++;
    else leap = false;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days >= 366) {
    leap = false;
    days--;
    gy += Math.floor(days / 365);
    days %= 365;
  }
  let i = 0;
  for (i = 0; days >= sal_a[i] + (i === 2 && leap ? 1 : 0); i++) {
    days -= sal_a[i] + (i === 2 && leap ? 1 : 0);
  }
  let gm = i;
  let gd = days + 1;
  return { gy, gm, gd };
}

let sal_a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Format Gregorian date into UK standard format DD/MM/YYYY
 */
export function formatUkDate(gy: number, gm: number, gd: number): string {
  const dStr = String(gd).padStart(2, '0');
  const mStr = String(gm).padStart(2, '0');
  return `${dStr}/${mStr}/${gy}`;
}

const MONTH_NAMES_EN = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_FA = [
  '', 'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
  'ژوئیه', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
];

export function formatUkDateDetailed(gy: number, gm: number, gd: number): { formatted: string; textEn: string; textFa: string } {
  const formatted = formatUkDate(gy, gm, gd);
  const textEn = `${gd} ${MONTH_NAMES_EN[gm]} ${gy}`;
  const textFa = `${gd} ${MONTH_NAMES_FA[gm]} ${gy}`;
  return { formatted, textEn, textFa };
}

/**
 * Attempts to parse Shamsi date patterns from user input string (e.g., 1373/05/24, 1373-5-24, ۱۳۷۳/۵/۲۴, "24 mordad 1373")
 */
export function detectAndConvertShamsi(input: string): {
  shamsiStr: string;
  gregorianFormatted: string;
  gregorianTextFa: string;
  gregorianTextEn: string;
} | null {
  if (!input) return null;
  const clean = faToEnDigits(input).trim();

  // Pattern 1: YYYY/MM/DD or YYYY-MM-DD where YYYY is 1300-1410
  const ymdMatch = clean.match(/\b(13\d{2}|140\d)[-\/\.](0?[1-9]|1[0-2])[-\/\.](0?[1-9]|[12]\d|3[01])\b/);
  if (ymdMatch) {
    const jy = parseInt(ymdMatch[1], 10);
    const jm = parseInt(ymdMatch[2], 10);
    const jd = parseInt(ymdMatch[3], 10);
    const { gy, gm, gd } = shamsiToGregorian(jy, jm, jd);
    const details = formatUkDateDetailed(gy, gm, gd);
    return {
      shamsiStr: `${jd}/${jm}/${jy}`,
      gregorianFormatted: details.formatted,
      gregorianTextFa: details.textFa,
      gregorianTextEn: details.textEn,
    };
  }

  // Pattern 2: DD/MM/YYYY where YYYY is 1300-1410
  const dmyMatch = clean.match(/\b(0?[1-9]|[12]\d|3[01])[-\/\.](0?[1-9]|1[0-2])[-\/\.](13\d{2}|140\d)\b/);
  if (dmyMatch) {
    const jd = parseInt(dmyMatch[1], 10);
    const jm = parseInt(dmyMatch[2], 10);
    const jy = parseInt(dmyMatch[3], 10);
    const { gy, gm, gd } = shamsiToGregorian(jy, jm, jd);
    const details = formatUkDateDetailed(gy, gm, gd);
    return {
      shamsiStr: `${jd}/${jm}/${jy}`,
      gregorianFormatted: details.formatted,
      gregorianTextFa: details.textFa,
      gregorianTextEn: details.textEn,
    };
  }

  // Pattern 3: Named months in Farsi (e.g. 24 مرداد 1373 or 1373 مرداد 24)
  for (const month of SHAMSI_MONTHS_FA) {
    if (input.includes(month.fa) || input.includes(month.afghani)) {
      const yearMatch = clean.match(/\b(13\d{2}|140\d)\b/);
      const dayMatch = clean.match(/\b([1-9]|[12]\d|3[01])\b/);
      if (yearMatch && dayMatch) {
        const jy = parseInt(yearMatch[1], 10);
        const jm = month.id;
        const jd = parseInt(dayMatch[1], 10);
        const { gy, gm, gd } = shamsiToGregorian(jy, jm, jd);
        const details = formatUkDateDetailed(gy, gm, gd);
        return {
          shamsiStr: `${jd} ${month.fa} ${jy}`,
          gregorianFormatted: details.formatted,
          gregorianTextFa: details.textFa,
          gregorianTextEn: details.textEn,
        };
      }
    }
  }

  return null;
}
