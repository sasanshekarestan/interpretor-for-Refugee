import { FormQuestion } from '../types';

export interface SimpleQuestionGuidance {
  meaningSimple: string;
  concreteExample: string;
  whyTheyAsk?: string;
  audioText: string;
}

/**
 * Generates an extremely simple, jargon-free, plain Persian/Dari breakdown 
 * of any form question with a concrete, realistic example answer.
 * Strict rule: No Home Office bureaucratic phrasing, no legal jargon, no complex terms.
 */
export function getSuperSimpleQuestionGuidance(
  question: FormQuestion,
  isDari: boolean = false
): SimpleQuestionGuidance {
  if (isDari && question.superSimpleExplanationDari && question.concreteExampleAnswer) {
    return {
      meaningSimple: question.superSimpleExplanationDari,
      concreteExample: question.concreteExampleAnswer,
      audioText: `${question.superSimpleExplanationDari}. مثال پاسخ: ${question.concreteExampleAnswer}`,
    };
  }

  if (question.superSimpleExplanationFa && question.concreteExampleAnswer) {
    return {
      meaningSimple: question.superSimpleExplanationFa,
      concreteExample: question.concreteExampleAnswer,
      audioText: `${question.superSimpleExplanationFa}. مثال پاسخ: ${question.concreteExampleAnswer}`,
    };
  }

  const qEn = (question.questionEn || '').toLowerCase();
  const qFa = (question.farsiTranslation || '').toLowerCase();
  const fieldKey = (question.fieldKey || '').toLowerCase();
  const section = (question.section || '').toLowerCase();

  // 1. Name & Personal Details
  if (
    fieldKey.includes('name') ||
    qEn.includes('full name') ||
    qEn.includes('surname') ||
    qEn.includes('first name') ||
    qFa.includes('نام کامل') ||
    qFa.includes('نام خانوادگی')
  ) {
    const meaning = isDari
      ? 'اینجا فقط نام و تخلص (نام خانوادگی) خود را به حروف کلان انگلیسی می‌نویسید. همان‌طور که در کارت یا سند هوم آفیس شما ثبت شده است.'
      : 'اینجا فقط اسم و فامیل خود را با حروف بزرگ انگلیسی می‌نویسید. دقیقاً همان‌طور که روی کارت یا نامه‌هایتان نوشته شده است.';
    const example = 'مثال: AHMADI, Reza (احمدی، رضا)';
    const why = isDari
      ? 'تا اداره مربوطه بداند این فرم برای چه کسی است.'
      : 'برای اینکه بدانند این برگه متعلق به چه کسی است.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 2. Date of Birth / Shamsi date
  if (
    fieldKey.includes('dob') ||
    fieldKey.includes('birth') ||
    qEn.includes('date of birth') ||
    qEn.includes('born') ||
    qFa.includes('تاریخ تولد')
  ) {
    const meaning = isDari
      ? 'تاریخ تولد میلادی خود را به شکل (روز / ماه / سال) بنویسید. اگر تاریخ میلادی خود را نمی‌دانید، در کادر پایین تاریخ شمسی خود را انتخاب کنید تا خودکار تبدیل شود.'
      : 'تاریخ تولد میلادی خود را به صورت (روز / ماه / سال) بنویسید. اگر تاریخ میلادی را نمی‌دانید، می‌توانید در بخش تبدیل تاریخ شمسی زیر، سال و ماه تولدتان را انتخاب کنید.';
    const example = 'مثال: 15/04/1990 (یعنی ۱۵ اپریل ۱۹۹۰)';
    const why = isDari
      ? 'برای تطبیق سن و هویت شما در سیستم.'
      : 'برای اینکه سن و پرونده شما دقیق ثبت شود.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 3. Address & Postcode
  if (
    fieldKey.includes('address') ||
    fieldKey.includes('postcode') ||
    qEn.includes('address') ||
    qEn.includes('postcode') ||
    qFa.includes('آدرس') ||
    qFa.includes('کد پستی')
  ) {
    const meaning = isDari
      ? 'آدرس دقیق محلی که فعلاً در آن زندگی می‌کنید همراه با کد پستی (Postcode) را بنویسید. کد پستی چند حرف و عدد انگلیسی در آخر آدرس شماست.'
      : 'آدرس کامل جایی که الان زندگی می‌کنید را با کد پستی (Postcode) بنویسید. کد پستی همان حروف و اعدادی است که در پایین نامه‌های دریافتی روی پاکت نامه نوشته می‌شود.';
    const example = 'مثال: 12 High Street, Birmingham, B1 1AA';
    const why = isDari
      ? 'برای این‌که نامه‌ها، مدارک یا کارت‌ها به خانه شما پست شود.'
      : 'برای اینکه نامه‌ها و کارت جدید به خانه شما پست شود.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 4. NHS Number
  if (
    fieldKey.includes('nhs') ||
    qEn.includes('nhs number') ||
    qFa.includes('شماره nhs') ||
    qFa.includes('ان‌اچ‌اس')
  ) {
    const meaning = isDari
      ? 'شماره ۱۰ رقمی صحی شما است. این شماره روی نامه‌های داکتر (GP) یا کارت پزشکی شما با فاصله سه رقمی و چهار رقمی نوشته شده است.'
      : 'این یک شماره ۱۰ رقمی پزشکی است که بالای همه نامه‌های درمانگاه یا دکتر عمومی (GP) شما نوشته شده است.';
    const example = 'مثال: 123 456 7890 (ده رقم با فاصله)';
    const why = isDari
      ? 'تا داکتر پرونده پزشکی شما را در سیستم سراسری پیدا کند.'
      : 'تا دکتر بتواند پرونده درمانی شما را در کامپیوتر پیدا کند.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 5. National Insurance Number (NINo)
  if (
    fieldKey.includes('nino') ||
    fieldKey.includes('national_insurance') ||
    qEn.includes('national insurance') ||
    qFa.includes('بیمه ملی') ||
    qFa.includes('ناشنال اینشورنس')
  ) {
    const meaning = isDari
      ? 'شماره بیمه ملی (National Insurance) یک کد ۹ حرفی و عددی است که با دو حرف شروع شده و با یک حرف ختم می‌شود. اگر هنوز ندارید، بنویسید: Not available.'
      : 'شماره بیمه ملی (NINo) کدی است شامل ۲ حرف، ۶ عدد و ۱ حرف آخر. روی نامه‌های کاری یا کمک‌های دولتی نوشته می‌شود. اگر هنوز ندارید بنویسید: Not applicable.';
    const example = 'مثال: QQ 12 34 56 A یا Not yet issued';
    const why = isDari
      ? 'برای ثبت سوابق کار و کمک‌های دولتی.'
      : 'برای ثبت اطلاعات شما در سیستم مالیات و بیمه دولتی.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 6. Home Office / ARC / Reference Number
  if (
    fieldKey.includes('arc') ||
    fieldKey.includes('ho_ref') ||
    fieldKey.includes('reference') ||
    qEn.includes('home office') ||
    qEn.includes('arc number') ||
    qEn.includes('reference number') ||
    qFa.includes('هوم آفیس') ||
    qFa.includes('شماره پرونده')
  ) {
    const meaning = isDari
      ? 'شماره پرونده هوم آفیس شماست. این شماره روی کارت اقامت موقت (ARC) یا نامه‌های رسمی که از هوم آفیس می‌گیرید چاپ شده است.'
      : 'شماره پرونده شما در هوم آفیس است. این شماره روی کارت پناهندگی (ARC) یا بالای نامه‌های هوم آفیس قرار دارد.';
    const example = 'مثال: 012345678 (معمولاً ۸ یا ۹ رقم) یا Z1234567';
    const why = isDari
      ? 'تا بتوانند پرونده پناهندگی شما را فوراً تشخیص دهند.'
      : 'تا پرونده شما سریع و درست پیدا شود.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 7. Partner / Spouse
  if (
    fieldKey.includes('partner') ||
    fieldKey.includes('spouse') ||
    qEn.includes('partner') ||
    qEn.includes('married') ||
    qFa.includes('همسر') ||
    qFa.includes('شریک زندگی')
  ) {
    const meaning = isDari
      ? 'می‌پرسند آیا زن، شوهر یا شریک زندگی دارید که همراه‌تان در یک خانه زندگی کند؟ اگر مجرد هستید یا همسرتان در بریتانیا نیست، گزینه No را انتخاب کنید.'
      : 'می‌پرسند آیا ازدواج کرده‌اید و با همسرتان در یک خانه زندگی می‌کنید یا خیر؟ اگر تنها زندگی می‌کنید یا همسرتان این‌جا نیست، بزنید No.';
    const example = 'مثال: No (اگر تنها هستید) یا Yes (اگر با همسرتان زندگی می‌کنید)';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 8. Children / Family members
  if (
    fieldKey.includes('child') ||
    fieldKey.includes('depend') ||
    qEn.includes('children') ||
    qEn.includes('dependant') ||
    qFa.includes('فرزند') ||
    qFa.includes('طفل')
  ) {
    const meaning = isDari
      ? 'آیا طفل یا فرزندی زیر سن ۱۸ سال دارید که با شما زندگی کند و خرجش با شما باشد؟ اگر ندارید بنویسید None.'
      : 'آیا فرزندی دارید که با شما زندگی کند و خرجش با شما باشد؟ اگر فرزندی ندارید بنویسید None.';
    const example = 'مثال: Ali Ahmadi, 12/05/2015 (Son) یا None';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 9. Savings / Money in Bank
  if (
    fieldKey.includes('saving') ||
    fieldKey.includes('property') ||
    qEn.includes('saving') ||
    qEn.includes('bank account') ||
    qFa.includes('پس‌انداز') ||
    qFa.includes('دارایی')
  ) {
    const meaning = isDari
      ? 'می‌پرسند چقدر پول نقد یا پس‌انداز در حساب بانکی خود دارید. اگر پناهجو هستید و فقط کارت آسپن (Aspen) دارید یا موجودی کمی دارید، مبلغ تقریبی را بنویسید.'
      : 'می‌پرسند چقدر پول نقد در حساب بانکی‌تان دارید. اگر پول کمی دارید یا فقط کارت پناهندگی دارید، مبلغ دقیق یا تقریبی را بنویسید.';
    const example = 'مثال: £50 (Lloyds Bank) یا £0 (No savings)';
    const why = isDari
      ? 'برای اطمینان از این‌که آیا مستحق دریافت کمک و تخفیف رایگان هستید یا خیر.'
      : 'برای اینکه مطمئن شوند واجد شرایط دریافت کمک‌هزینه رایگان هستید.';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      whyTheyAsk: why,
      audioText: `${meaning} ${example}`,
    };
  }

  // 10. Income / Benefits / Section 95 / Universal Credit
  if (
    fieldKey.includes('income') ||
    fieldKey.includes('benefit') ||
    qEn.includes('benefit') ||
    qEn.includes('universal credit') ||
    qEn.includes('section 95') ||
    qFa.includes('کمک‌های دولتی') ||
    qFa.includes('یونیورسال کریدیت') ||
    qFa.includes('سکشن ۹۵')
  ) {
    const meaning = isDari
      ? 'آیا از دولت یا هوم آفیس پول و کمک مالی دریافت می‌کنید؟ مثلاً کمک هفتگی پناهجویان (Section 95) یا یونیورسال کریدیت.'
      : 'آیا از دولت یا هوم آفیس حقوق و کمک‌هزینه می‌گیرید؟ مثل حقوق هفتگی پناهندگی (Section 95) یا یونیورسال کریدیت.';
    const example = 'مثال: Section 95 Asylum Support (£49.18 per week) یا Universal Credit';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 11. Work / Employment
  if (
    fieldKey.includes('work') ||
    fieldKey.includes('job') ||
    fieldKey.includes('employ') ||
    qEn.includes('work') ||
    qEn.includes('employed') ||
    qFa.includes('شغل') ||
    qFa.includes('کار')
  ) {
    const meaning = isDari
      ? 'می‌پرسند آیا در حال حاضر کار می‌کنید و معاش می‌گیرید؟ اگر پناهجو هستید و اجازه کار ندارید، بنویسید No right to work.'
      : 'می‌پرسند آیا الان سر کار می‌روید و حقوق می‌گیرید؟ اگر پناهجو هستید و اجازه کار ندارید، بنویسید Not working (Asylum seeker).';
    const example = 'مثال: Not working / Asylum seeker (No permission to work)';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 12. Housing Costs / Rent
  if (
    fieldKey.includes('housing') ||
    fieldKey.includes('rent') ||
    qEn.includes('rent') ||
    qEn.includes('housing cost') ||
    qFa.includes('اجاره') ||
    qFa.includes('مسکن')
  ) {
    const meaning = isDari
      ? 'چقدر کرایه خانه در ماه یا هفته پرداخت می‌کنید؟ اگر در هتل یا خانه پناهندگی هوم آفیس هستید و خودتان کرایه نمی‌دهید، بنویسید 0£.'
      : 'هر ماه یا هفته چقدر اجاره خانه می‌دهید؟ اگر در هتل یا خانه هوم آفیس هستید و رایگان است، بنویسید £0 (هوم آفیس پرداخت می‌کند).';
    const example = 'مثال: £0 (Home Office Accommodation) یا £450 per month';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 13. Bank Account / Sort code / Account number
  if (
    fieldKey.includes('bank') ||
    fieldKey.includes('sort_code') ||
    qEn.includes('sort code') ||
    qEn.includes('bank details') ||
    qFa.includes('بانک') ||
    qFa.includes('سورت کد')
  ) {
    const meaning = isDari
      ? 'مشخصات حساب بانکی‌تان را برای واریز مستقیم پول بنویسید: نام روی کارت، سورت کد (۶ رقم) و نمبر حساب (۸ رقم).'
      : 'مشخصات حساب بانکی شما برای واریز پول: نام صاحب حساب، کد ۶ رقمی Sort Code و شماره حساب ۸ رقمی Account Number.';
    const example = 'مثال: Name: Reza Ahmadi / Sort Code: 20-40-60 / Account: 12345678';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 14. Declaration & Signature
  if (
    fieldKey.includes('declaration') ||
    fieldKey.includes('sign') ||
    qEn.includes('declaration') ||
    qEn.includes('sign') ||
    qFa.includes('امضا') ||
    qFa.includes('تایید')
  ) {
    const meaning = isDari
      ? 'اینجا پای برگه را امضا می‌کنید و تاریخ همان روز را به میلادی می‌نویسید تا تایید کنید تمام چیزهایی که گفتید راست و درست است.'
      : 'این بخش پایانی است: امضای دست‌نویس شما روی برگه کاغذی و تاریخ همان روز به میلادی برای تایید صحت اطلاعات.';
    const example = 'مثال: Signed: [امضای شما روی کاغذ] / Date: 28/08/2026';
    return {
      meaningSimple: meaning,
      concreteExample: example,
      audioText: `${meaning} ${example}`,
    };
  }

  // 15. Default Fallback based on question details (Clean, calm, jargon-free)
  const baseExplanation = question.explanationFa || question.simpleEnglish || question.questionEn;
  const exampleFormat = question.exampleFormat || question.whatTypeInfoNeeded || 'پاسخ کوتاه و روشن به انگلیسی';

  const defaultMeaning = isDari
    ? `منظور این بخش: ${baseExplanation}. اطلاعات خواسته شده را به زبان ساده و به انگلیسی روی برگه بنویسید.`
    : `منظور این بخش: ${baseExplanation}. این بخش از شما می‌خواهد که اطلاعات خواسته‌شده را به زبان ساده و انگلیسی بنویسید.`;

  const defaultExample = `مثال نمونه پاسخ: ${exampleFormat}`;

  return {
    meaningSimple: defaultMeaning,
    concreteExample: defaultExample,
    whyTheyAsk: 'برای تکمیل درست و بدون نقص پرونده شما.',
    audioText: `${defaultMeaning}. ${defaultExample}`,
  };
}
