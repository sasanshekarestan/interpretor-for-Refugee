// DO NOT REGENERATE. The PDFs in public/forms are the official documents.
// Never draw, rebuild or re-type an official form in code. Only the questions[] arrays may be edited.

import { FormQuestion } from '../types';

/**
 * How the form is actually completed.
 *
 * 'paper'  — there is a real document to fill in by hand. Form Companion can
 *            show it, so it belongs in the library.
 * 'online' — the application only exists as a web journey. There is nothing
 *            to display beside a guide, so these are kept here for the
 *            browser extension to use and are not listed in the app.
 */
export type FormDelivery = 'paper' | 'online';

export interface OfficialForm {
  id: string;
  code: string;
  titleEn: string;
  titleFa: string;
  titleDari: string;
  issuer: string;
  category: string;
  purposeFa: string;
  purposeEn: string;
  pdfPath: string;
  officialSourceUrl: string;
  pageCount: number;
  delivery: FormDelivery;
  questions: FormQuestion[];
}

/** The forms Form Companion can show: the ones that exist on paper. */
export const paperForms = (forms: OfficialForm[]) => forms.filter((f) => f.delivery !== 'online');

export const OFFICIAL_FORMS: OfficialForm[] = [
  {
    id: 'nhs_hc1',
    code: 'HC1',
    titleEn: 'NHS Low Income Scheme Claim (HC1)',
    titleFa: 'ادعای کمک به هزینه‌های درمانی NHS (فرم HC1)',
    titleDari: 'ادعای کمک به مصارف صحی NHS (فرم HC1)',
    issuer: 'NHS Business Services Authority',
    category: 'nhs',
    purposeFa: 'درخواست معافیت یا دریافت تخفیف برای هزینه‌های دارو، دندانپزشکی، عینک و سفر درمانی NHS',
    purposeEn: 'Claim full or partial help with NHS prescription, dental, optical and travel costs.',
    pdfPath: 'public/forms/hc1.pdf',
    officialSourceUrl: 'https://www.nhsbsa.nhs.uk/nhs-low-income-scheme',
    pageCount: 20,
    delivery: 'paper',
    questions: [
      {
        id: 'hc1_q1',
        number: 1,
        questionCode: 'Part 1.1',
        section: 'Part 1: About You and Your Partner',
        questionEn: 'Are you claiming a refund of health costs you have already paid?',
        simpleEnglish: 'Have you already paid for NHS prescriptions, dental work, sight tests or travel, and want your money back?',
        farsiTranslation: 'آیا ادعای بازپرداخت هزینه‌های درمانی پرداخت‌شده قبلی را دارید؟',
        dariTranslation: 'آیا خواهان بازپرداخت هزینه‌های صحی پرداخته‌شده قبلی هستید؟',
        explanationFa: 'اگر در ۳ ماه اخیر هزینه‌ای بابت داروی نسخه NHS، دندانپزشکی، معاینه چشم یا عینک پرداخته‌اید، گزینه‌های مربوطه را علامت بزنید.',
        whatTypeInfoNeeded: 'تیک زدن گزینه‌های مربوطه (نسخه، دندانپزشکی، عینک، سفر درمانی)',
        exampleFormat: 'Tick NHS prescriptions / dental treatment',
        fieldKey: 'hc1_refund_ticks',
        isCheckbox: true
      },
      {
        id: 'hc1_q2',
        number: 2,
        questionCode: 'Part 1.2',
        section: 'Part 1: About You and Your Partner',
        questionEn: 'Do you have a partner?',
        simpleEnglish: 'Do you live with a husband, wife, civil partner or partner as a couple?',
        farsiTranslation: 'آیا همسر یا شریک زندگی دارید؟',
        dariTranslation: 'آیا همسر یا شریک زندگی دارید؟',
        explanationFa: 'در صورتی که با همسر یا شریک زندگی خود زیر یک سقف زندگی می‌کنید گزینه بله را انتخاب کنید.',
        whatTypeInfoNeeded: 'انتخاب بله یا خیر',
        exampleFormat: 'Yes / No',
        fieldKey: 'hc1_has_partner'
      },
      {
        id: 'hc1_q3',
        number: 3,
        questionCode: 'Part 1.3',
        section: 'Part 1: Personal Details',
        questionEn: 'What is your Full Name, Date of Birth, NHS Number and UK Address?',
        simpleEnglish: 'Write your title, surname, first name, date of birth, 10-digit NHS number and full UK postcode address.',
        farsiTranslation: 'نام کامل، تاریخ تولد، شماره ۱۰ رقمی NHS و آدرس محل سکونت شما چیست؟',
        dariTranslation: 'نام مکمل، تاریخ تولد، نمبر ۱۰ رقمی NHS و آدرس شما چیست؟',
        explanationFa: 'نام خانوادگی و نام کوچک به حروف بزرگ انگلیسی. شماره NHS یک شماره ۱۰ رقمی است که روی کارت پزشک یا نامه‌های پزشکی درج می‌شود.',
        whatTypeInfoNeeded: 'نام کامل انگلیسی، تاریخ تولد (روز/ماه/سال)، شماره ۱۰ رقمی NHS، آدرس و کد پستی',
        exampleFormat: 'AHMADI, Reza / 15/04/1988 / NHS: 123 456 7890 / 12 High Street, London SW1A 1AA',
        fieldKey: 'hc1_part1_details',
        required: true
      },
      {
        id: 'hc1_q4',
        number: 4,
        questionCode: 'Part 2.1',
        section: 'Part 2: Children & Dependents',
        questionEn: 'Do you have any children under 16 or aged 16–19 in full-time education?',
        simpleEnglish: 'Do any children live with you who depend on you financially?',
        farsiTranslation: 'آیا فرزند زیر ۱۶ سال یا ۱۶ تا ۱۹ سال در حال تحصیل تمام‌وقت دارید؟',
        dariTranslation: 'آیا طفل زیر ۱۶ سال یا ۱۶ تا ۱۹ سال مصروف تعلیم دارید؟',
        explanationFa: 'نام، تاریخ تولد و نسبت فرزندان تحت تکفل خود را وارد کنید.',
        whatTypeInfoNeeded: 'اسامی فرزندان و تاریخ تولد میلادی آن‌ها',
        exampleFormat: 'Ali Ahmadi, 10/02/2012 (Son)',
        fieldKey: 'hc1_part2_children'
      },
      {
        id: 'hc1_q5',
        number: 5,
        questionCode: 'Part 4.1',
        section: 'Part 4: Savings and Property',
        questionEn: 'What total bank savings, investments, property or money do you and your partner hold?',
        simpleEnglish: 'Do you or your partner have more than £16,000 in savings, property or bank accounts?',
        farsiTranslation: 'مجموع پس‌انداز بانکی، املاک یا دارایی شما و همسرتان چقدر است؟',
        dariTranslation: 'مجموع پس‌انداز بانکی و اموال شما و همسرتان چقدر است؟',
        explanationFa: 'برای دریافت کمک‌هزینه low income scheme، کل پس‌انداز بانکی نباید بیشتر از ۱۶,۰۰۰ پوند باشد.',
        whatTypeInfoNeeded: 'مبلغ کل پس‌انداز موجود در حساب‌های بانکی بریتانیا یا خارج از بریتانیا',
        exampleFormat: '£150.00 (Lloyds Bank)',
        fieldKey: 'hc1_part4_savings',
        required: true
      },
      {
        id: 'hc1_q6',
        number: 6,
        questionCode: 'Part 5.1',
        section: 'Part 5: Benefits and Income',
        questionEn: 'Do you receive Universal Credit, Section 95 Asylum Support, or other state benefits?',
        simpleEnglish: 'List all weekly or monthly benefit payments you get from DWP or Home Office.',
        farsiTranslation: 'آیا یونیورسال کریدیت، حقوق پناهندگی سکشن ۹۵ یا دیگر مزایای دولتی دریافت می‌کنید؟',
        dariTranslation: 'آیا یونیورسال کریدیت، کمک پناهندگی سکشن ۹۵ یا دیگر حقوق دولتی می‌گیرید؟',
        explanationFa: 'در صورت دریافت حقوق پناهندگی (Section 95)، شماره پرونده هوم آفیس و مبلغ هفتگی را ذکر کنید.',
        whatTypeInfoNeeded: 'نوع مزایا و مبلغ دریافتی',
        exampleFormat: 'Section 95 Asylum Support (£49.18 per week per person)',
        fieldKey: 'hc1_part5_income',
        required: true
      },
      {
        id: 'hc1_q7',
        number: 7,
        questionCode: 'Part 6.1',
        section: 'Part 6: Work Details',
        questionEn: 'Are you or your partner employed or self-employed?',
        simpleEnglish: 'Are you working in a job or earning money from work?',
        farsiTranslation: 'آیا شما یا همسرتان شاغل یا دارای شغل آزاد هستید؟',
        dariTranslation: 'آیا شما یا همسرتان کار می‌کنید؟',
        explanationFa: 'در صورت کار کردن، ساعات کار در هفته و حقوق خالص پس از کسر مالیات را وارد کنید.',
        whatTypeInfoNeeded: 'وضعیت اشتغال، ساعات کار هفتگی و حقوق خالص',
        exampleFormat: 'Not Working / Asylum Seeker (No right to work)',
        fieldKey: 'hc1_part6_work'
      },
      {
        id: 'hc1_q8',
        number: 8,
        questionCode: 'Part 7.4',
        section: 'Part 7: Housing Costs',
        questionEn: 'How much rent or housing costs do you pay each week or month?',
        simpleEnglish: 'What is your rent amount, and does Housing Benefit or Asylum Support pay for it?',
        farsiTranslation: 'مبلغ اجاره‌خانه یا هزینه‌های مسکن پرداختی شما چقدر است؟',
        dariTranslation: 'کرایه خانه شما ماهانه چقدر است؟',
        explanationFa: 'اگر در مسکن پناهندگی هوم آفیس زندگی می‌کنید اجاره ۰ پوند است. در غیر این صورت اجاره ماهانه و سهم پرداختی خود را بنویسید.',
        whatTypeInfoNeeded: 'مبلغ اجاره و پرداخت‌کننده اصلی',
        exampleFormat: '£0 (Home Office Provided Accommodation)',
        fieldKey: 'hc1_part7_housing'
      },
      {
        id: 'hc1_q9',
        number: 9,
        questionCode: 'Part 10',
        section: 'Part 10: Declaration',
        questionEn: 'Declaration: I declare that the information given on this form is correct and complete.',
        simpleEnglish: 'Sign and date the form confirming your information is truthful.',
        farsiTranslation: 'بیانیه و امضا: تایید می‌کنم تمامی اطلاعات داده‌شده صحیح و کامل است.',
        dariTranslation: 'تایید و امضا: اقرار می‌نمایم اطلاعات داده‌شده درست و کامل است.',
        explanationFa: 'امضای متقاضی یا نماینده قانونی و تاریخ روز به میلادی.',
        whatTypeInfoNeeded: 'امضا و تاریخ میلادی',
        exampleFormat: 'Signed: R. Ahmadi, Date: 27/08/2026',
        fieldKey: 'hc1_declaration',
        required: true
      }
    ]
  },
  {
    id: 'hc5_dental',
    code: 'HC5(D)',
    titleEn: 'Claim a refund of NHS dental treatment HC5(D)',
    titleFa: 'پس گرفتن پول دندان‌پزشکی NHS (فرم HC5(D))',
    titleDari: 'پس گرفتن پول دندان‌داکتری NHS (فورم HC5(D))',
    issuer: 'NHS Business Services Authority',
    category: 'nhs',
    purposeFa: 'اگر هزینهٔ درمان دندان NHS در انگلستان را پرداخته‌اید و حق معافیت داشته‌اید، با این فرم پولتان را پس بگیرید',
    purposeEn: 'Claim back NHS dental charges you paid in England.',
    pdfPath: 'public/forms/hc5-dental.pdf',
    officialSourceUrl: 'https://www.nhsbsa.nhs.uk/HC5',
    pageCount: 4,
    delivery: 'paper',
    questions: [
      {
        id: 'hc5_dental_q1',
        number: 1,
        questionCode: 'Part 1',
        section: "Patient's details",
        questionEn: 'Surname, forenames, title, sex, date of birth, NHS number, National Insurance number, address and postcode, and contact details.',
        simpleEnglish: 'The patient is the person who had the treatment. If someone else should be contacted about the claim, their name goes in the contact box.',
        farsiTranslation: 'نام خانوادگی، نام، عنوان، جنسیت، تاریخ تولد، شمارهٔ NHS، شمارهٔ بیمهٔ ملی، آدرس و کد پستی، و مشخصات تماس.',
        dariTranslation: 'تخلص، نام، عنوان، جنسیت، تاریخ تولد، نمبر NHS، نمبر بیمهٔ ملی، آدرس و کد پستی، و معلومات تماس.',
        explanationFa: 'بیمار همان کسی است که درمان شده. اگر باید با شخص دیگری دربارهٔ این درخواست تماس بگیرند، نام او در کادر تماس نوشته می‌شود.',
        whatTypeInfoNeeded: 'نام کامل، تاریخ تولد میلادی، آدرس و کد پستی',
        exampleFormat: 'AHMADI / ALI / 10 05 1990 / M14 5TP',
        fieldKey: 'hc5_dental_patient_details',
        required: true
      },
      {
        id: 'hc5_dental_q2',
        number: 2,
        questionCode: 'Part 2',
        section: 'Charges paid',
        questionEn: 'Amount paid, treatment start and end dates, and the dental practice. Receipts must be included.',
        simpleEnglish: 'The claim cannot be processed without the receipts.',
        farsiTranslation: 'مبلغی که پرداخته‌اید، تاریخ شروع و پایان درمان، و نام و آدرس و تلفن مطب دندان‌پزشکی. باید کپی رسیدها را هم بفرستید.',
        dariTranslation: 'مبلغی که پرداخته‌اید، تاریخ شروع و پایان درمان، و نام و آدرس و تلفن مطب دندان‌پزشکی. باید کپی رسیدها را هم بفرستید.',
        explanationFa: 'بدون رسید، درخواست بررسی نمی‌شود.',
        whatTypeInfoNeeded: 'مبلغ به پوند، تاریخ میلادی، و رسیدها',
        exampleFormat: '£25.80 / 03 06 2026 تا 17 06 2026',
        fieldKey: 'hc5_dental_charges',
        required: true
      },
      {
        id: 'hc5_dental_q3',
        number: 3,
        questionCode: 'Part 3',
        section: 'Part 3 - Bank details',
        questionEn: 'Account holder, bank name, six-digit sort code and eight-digit account number.',
        simpleEnglish: 'Wrong account details delay the refund.',
        farsiTranslation: 'نام صاحب حساب، نام بانک، sort code شش‌رقمی و شمارهٔ حساب هشت‌رقمی. اگر حساب building society است، شمارهٔ roll یا reference آن هم لازم است.',
        dariTranslation: 'نام صاحب حساب، نام بانک، sort code شش‌رقمی و شمارهٔ حساب هشت‌رقمی. اگر حساب building society است، شمارهٔ roll یا reference آن هم لازم است.',
        explanationFa: 'خود فرم می‌گوید مشخصات اشتباه بانکی پرداخت را عقب می‌اندازد. sort code شش رقم و شمارهٔ حساب هشت رقم است.',
        whatTypeInfoNeeded: 'شمارهٔ حساب بانکی',
        exampleFormat: 'Sort code: 20 45 89 / Account: 12345678',
        fieldKey: 'hc5_dental_part3',
        required: true
      },
      {
        id: 'hc5_dental_q4',
        number: 4,
        questionCode: 'Part 4',
        section: 'Reason for claim',
        questionEn: 'Tick the group that applied on the day the charge was paid: Group 1 war pension, Group 2 an HC2 or HC3 certificate, Group 3 a qualifying benefit, Group 4 low income with an HC1.',
        simpleEnglish: 'Each group sends the form to a different address, printed beside it.',
        farsiTranslation: 'گروهی را علامت بزنید که روزِ پرداختِ هزینه به شما مربوط بوده: گروه ۱ مستمری جانبازی، گروه ۲ گواهی HC2 یا HC3، گروه ۳ یکی از کمک‌هزینه‌های واجد شرایط، گروه ۴ درآمد کم به همراه فرم HC1.',
        dariTranslation: 'گروهی را نشانی کنید که روز پرداخت مصرف به شما مربوط بوده: گروپ ۱ معاش جانبازی، گروپ ۲ سرتیفیکیت HC2 یا HC3، گروپ ۳ یکی از کمک‌هزینه‌ها، گروپ ۴ عاید کم با فورم HC1.',
        explanationFa: 'هر گروه آدرس فرستادن خودش را دارد و کنار همان گروه روی کاغذ نوشته شده. اگر در هیچ‌کدام از گروه‌های ۱ تا ۳ نیستید، گروه ۴ می‌گوید فرم HC1 را هم پر کنید.',
        whatTypeInfoNeeded: 'یک گروه، و شمارهٔ گواهی یا مشخصات کسی که کمک‌هزینه را می‌گیرد',
        exampleFormat: 'Group 3 ✗ Universal Credit',
        fieldKey: 'hc5_dental_reason',
        required: true
      },
      {
        id: 'hc5_dental_q5',
        number: 5,
        questionCode: 'Part 5',
        section: 'Declaration and signature',
        questionEn: 'Sign at A if this is your own claim, or at B if you are claiming for someone else, where your name, address and relationship to the patient are also needed.',
        simpleEnglish: 'The form warns that giving false information may lead to prosecution.',
        farsiTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای شخص دیگری است بخش B، که نام و آدرس و نسبت شما با بیمار را هم می‌خواهد.',
        dariTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای کس دیگری است بخش B.',
        explanationFa: 'خود فرم هشدار می‌دهد دادن اطلاعات نادرست می‌تواند به پیگرد قانونی بینجامد. امضا و تاریخ میلادی لازم است.',
        whatTypeInfoNeeded: 'امضا و تاریخ میلادی',
        exampleFormat: 'Signed / 21 06 2026',
        fieldKey: 'hc5_dental_declaration',
        required: true
      }
    ]
  },
  {
    id: 'hc5_optical',
    code: 'HC5(O)',
    titleEn: 'Claim a refund of optical costs HC5(O)',
    titleFa: 'پس گرفتن پول تست چشم، عینک و لنز (فرم HC5(O))',
    titleDari: 'پس گرفتن پول معاینهٔ چشم، عینک و لنز (فورم HC5(O))',
    issuer: 'NHS Business Services Authority',
    category: 'nhs',
    purposeFa: 'اگر هزینهٔ تست چشم، عینک یا لنز در انگلستان را پرداخته‌اید و حق معافیت داشته‌اید، با این فرم پولتان را پس بگیرید',
    purposeEn: 'Claim back sight test, glasses or contact lens charges you paid in England.',
    pdfPath: 'public/forms/hc5-optical.pdf',
    officialSourceUrl: 'https://www.nhsbsa.nhs.uk/HC5',
    pageCount: 4,
    delivery: 'paper',
    questions: [
      {
        id: 'hc5_optical_q1',
        number: 1,
        questionCode: 'Part 1',
        section: "Patient's details",
        questionEn: 'Surname, forenames, title, sex, date of birth, NHS number, National Insurance number, address and postcode, and contact details.',
        simpleEnglish: 'The patient is the person who had the treatment. If someone else should be contacted about the claim, their name goes in the contact box.',
        farsiTranslation: 'نام خانوادگی، نام، عنوان، جنسیت، تاریخ تولد، شمارهٔ NHS، شمارهٔ بیمهٔ ملی، آدرس و کد پستی، و مشخصات تماس.',
        dariTranslation: 'تخلص، نام، عنوان، جنسیت، تاریخ تولد، نمبر NHS، نمبر بیمهٔ ملی، آدرس و کد پستی، و معلومات تماس.',
        explanationFa: 'بیمار همان کسی است که درمان شده. اگر باید با شخص دیگری دربارهٔ این درخواست تماس بگیرند، نام او در کادر تماس نوشته می‌شود.',
        whatTypeInfoNeeded: 'نام کامل، تاریخ تولد میلادی، آدرس و کد پستی',
        exampleFormat: 'AHMADI / ALI / 10 05 1990 / M14 5TP',
        fieldKey: 'hc5_optical_patient_details',
        required: true
      },
      {
        id: 'hc5_optical_q2',
        number: 2,
        questionCode: 'Part 2',
        section: 'Charges paid',
        questionEn: 'Sight test amount and date, glasses or lens amount, and the opticians. Receipts and the optical prescription must be included.',
        simpleEnglish: 'The claim cannot be processed without the receipts.',
        farsiTranslation: 'دو کادر جدا: مبلغ تست چشم با تاریخ آن، و مبلغ عینک یا لنز. بعد نام و آدرس و تلفن عینک‌فروشی. باید کپی رسیدها را بفرستید و برای عینک یا لنز نسخهٔ چشم‌پزشکی را هم.',
        dariTranslation: 'دو کادر جدا: مبلغ تست چشم با تاریخ آن، و مبلغ عینک یا لنز. بعد نام و آدرس و تلفن عینک‌فروشی. باید کپی رسیدها را بفرستید و برای عینک یا لنز نسخهٔ چشم‌پزشکی را هم.',
        explanationFa: 'بدون رسید، درخواست بررسی نمی‌شود.',
        whatTypeInfoNeeded: 'مبلغ به پوند، تاریخ میلادی، و رسیدها',
        exampleFormat: '£25.00 برای تست چشم / 12 05 2026',
        fieldKey: 'hc5_optical_charges',
        required: true
      },
      {
        id: 'hc5_optical_q3',
        number: 3,
        questionCode: 'Part 3',
        section: 'Part 3 - Bank details',
        questionEn: 'Account holder, bank name, six-digit sort code and eight-digit account number.',
        simpleEnglish: 'Wrong account details delay the refund.',
        farsiTranslation: 'نام صاحب حساب، نام بانک، sort code شش‌رقمی و شمارهٔ حساب هشت‌رقمی. اگر حساب building society است، شمارهٔ roll یا reference آن هم لازم است.',
        dariTranslation: 'نام صاحب حساب، نام بانک، sort code شش‌رقمی و شمارهٔ حساب هشت‌رقمی. اگر حساب building society است، شمارهٔ roll یا reference آن هم لازم است.',
        explanationFa: 'خود فرم می‌گوید مشخصات اشتباه بانکی پرداخت را عقب می‌اندازد. sort code شش رقم و شمارهٔ حساب هشت رقم است.',
        whatTypeInfoNeeded: 'شمارهٔ حساب بانکی',
        exampleFormat: 'Sort code: 20 45 89 / Account: 12345678',
        fieldKey: 'hc5_optical_part3',
        required: true
      },
      {
        id: 'hc5_optical_q4',
        number: 4,
        questionCode: 'Part 4',
        section: 'Reason for claim',
        questionEn: 'Tick the group that applied on the day the charge was paid: Group 1 war pension, Group 2 an HC2 or HC3 certificate, Group 3 a qualifying benefit, Group 4 low income with an HC1.',
        simpleEnglish: 'Each group sends the form to a different address, printed beside it.',
        farsiTranslation: 'گروهی را علامت بزنید که روزِ پرداختِ هزینه به شما مربوط بوده: گروه ۱ مستمری جانبازی، گروه ۲ گواهی HC2 یا HC3، گروه ۳ یکی از کمک‌هزینه‌های واجد شرایط، گروه ۴ درآمد کم به همراه فرم HC1.',
        dariTranslation: 'گروهی را نشانی کنید که روز پرداخت مصرف به شما مربوط بوده: گروپ ۱ معاش جانبازی، گروپ ۲ سرتیفیکیت HC2 یا HC3، گروپ ۳ یکی از کمک‌هزینه‌ها، گروپ ۴ عاید کم با فورم HC1.',
        explanationFa: 'هر گروه آدرس فرستادن خودش را دارد و کنار همان گروه روی کاغذ نوشته شده. اگر در هیچ‌کدام از گروه‌های ۱ تا ۳ نیستید، گروه ۴ می‌گوید فرم HC1 را هم پر کنید.',
        whatTypeInfoNeeded: 'یک گروه، و شمارهٔ گواهی یا مشخصات کسی که کمک‌هزینه را می‌گیرد',
        exampleFormat: 'Group 3 ✗ Universal Credit',
        fieldKey: 'hc5_optical_reason',
        required: true
      },
      {
        id: 'hc5_optical_q5',
        number: 5,
        questionCode: 'Part 5',
        section: 'Declaration and signature',
        questionEn: 'Sign at A if this is your own claim, or at B if you are claiming for someone else, where your name, address and relationship to the patient are also needed.',
        simpleEnglish: 'The form warns that giving false information may lead to prosecution.',
        farsiTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای شخص دیگری است بخش B، که نام و آدرس و نسبت شما با بیمار را هم می‌خواهد.',
        dariTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای کس دیگری است بخش B.',
        explanationFa: 'خود فرم هشدار می‌دهد دادن اطلاعات نادرست می‌تواند به پیگرد قانونی بینجامد. امضا و تاریخ میلادی لازم است.',
        whatTypeInfoNeeded: 'امضا و تاریخ میلادی',
        exampleFormat: 'Signed / 21 06 2026',
        fieldKey: 'hc5_optical_declaration',
        required: true
      }
    ]
  },
  {
    id: 'hc5_travel',
    code: 'HC5(T)',
    titleEn: 'Refund claim form: travel costs to receive NHS treatment HC5(T)',
    titleFa: 'پس گرفتن پول رفت‌وآمد برای درمان NHS (فرم HC5(T))',
    titleDari: 'پس گرفتن پول سفر برای تداوی NHS (فورم HC5(T))',
    issuer: 'NHS Business Services Authority',
    category: 'nhs',
    purposeFa: 'اگر برای درمانی که پزشک، دندان‌پزشک یا اپتومتریست شما را به آن ارجاع داده هزینهٔ رفت‌وآمد داده‌اید، با این فرم پولتان را پس بگیرید',
    purposeEn: 'Claim back travel costs for NHS treatment you were referred to.',
    pdfPath: 'public/forms/hc5-travel.pdf',
    officialSourceUrl: 'https://www.nhsbsa.nhs.uk/HC5',
    pageCount: 4,
    delivery: 'paper',
    questions: [
      {
        id: 'hc5_travel_q1',
        number: 1,
        questionCode: 'Part 1',
        section: "Patient's details",
        questionEn: 'Surname, forenames, title, sex, date of birth, NHS number, National Insurance number, address and postcode, and contact details.',
        simpleEnglish: 'The patient is the person who had the treatment. If someone else should be contacted about the claim, their name goes in the contact box.',
        farsiTranslation: 'نام خانوادگی، نام، عنوان، جنسیت، تاریخ تولد، شمارهٔ NHS، شمارهٔ بیمهٔ ملی، آدرس و کد پستی، و مشخصات تماس.',
        dariTranslation: 'تخلص، نام، عنوان، جنسیت، تاریخ تولد، نمبر NHS، نمبر بیمهٔ ملی، آدرس و کد پستی، و معلومات تماس.',
        explanationFa: 'بیمار همان کسی است که درمان شده. اگر باید با شخص دیگری دربارهٔ این درخواست تماس بگیرند، نام او در کادر تماس نوشته می‌شود.',
        whatTypeInfoNeeded: 'نام کامل، تاریخ تولد میلادی، آدرس و کد پستی',
        exampleFormat: 'AHMADI / ALI / 10 05 1990 / M14 5TP',
        fieldKey: 'hc5_travel_patient_details',
        required: true
      },
      {
        id: 'hc5_travel_q2',
        number: 2,
        questionCode: 'Part 2',
        section: 'Charges paid',
        questionEn: 'Total claimed, then up to four visits with dates and amounts, plus escort costs. Tickets or fuel receipts must be included.',
        simpleEnglish: 'The claim cannot be processed without the receipts.',
        farsiTranslation: 'کل مبلغی که می‌خواهید پس بگیرید، و بعد تا چهار سفر با تاریخ هر کدام و مبلغ هر کدام. اگر کسی به عنوان همراه با شما آمده، مبلغ او هم ردیف خودش را دارد. بلیت‌ها یا رسید سوخت را بفرستید.',
        dariTranslation: 'کل مبلغی که می‌خواهید پس بگیرید، و بعد تا چهار سفر با تاریخ هر کدام و مبلغ هر کدام. اگر کسی به عنوان همراه با شما آمده، مبلغ او هم ردیف خودش را دارد. بلیت‌ها یا رسید سوخت را بفرستید.',
        explanationFa: 'بدون رسید، درخواست بررسی نمی‌شود.',
        whatTypeInfoNeeded: 'مبلغ به پوند، تاریخ میلادی، و رسیدها',
        exampleFormat: '£18.40 / 03 06 2026',
        fieldKey: 'hc5_travel_charges',
        required: true
      },
      {
        id: 'hc5_travel_q3',
        number: 3,
        questionCode: 'Part 3',
        section: 'Part 3 - Other information we need',
        questionEn: 'The hospital or place of treatment, then the bank account for the refund.',
        simpleEnglish: 'Wrong account details delay the refund.',
        farsiTranslation: 'نام و آدرس و تلفن بیمارستان یا جایی که درمان شده‌اید، و بعد مشخصات حساب بانکی: نام صاحب حساب، نام بانک، sort code و شمارهٔ حساب.',
        dariTranslation: 'نام و آدرس و تلفن بیمارستان یا جایی که درمان شده‌اید، و بعد مشخصات حساب بانکی: نام صاحب حساب، نام بانک، sort code و شمارهٔ حساب.',
        explanationFa: 'خود فرم می‌گوید مشخصات اشتباه بانکی پرداخت را عقب می‌اندازد. sort code شش رقم و شمارهٔ حساب هشت رقم است.',
        whatTypeInfoNeeded: 'محل درمان و حساب بانکی',
        exampleFormat: 'Sort code: 20 45 89 / Account: 12345678',
        fieldKey: 'hc5_travel_part3',
        required: true
      },
      {
        id: 'hc5_travel_q4',
        number: 4,
        questionCode: 'Part 4',
        section: 'Reason for claim',
        questionEn: 'Tick the group that applied on the day the charge was paid: Group 1 war pension, Group 2 an HC2 or HC3 certificate, Group 3 a qualifying benefit, Group 4 low income with an HC1.',
        simpleEnglish: 'Each group sends the form to a different address, printed beside it.',
        farsiTranslation: 'گروهی را علامت بزنید که روزِ پرداختِ هزینه به شما مربوط بوده: گروه ۱ مستمری جانبازی، گروه ۲ گواهی HC2 یا HC3، گروه ۳ یکی از کمک‌هزینه‌های واجد شرایط، گروه ۴ درآمد کم به همراه فرم HC1.',
        dariTranslation: 'گروهی را نشانی کنید که روز پرداخت مصرف به شما مربوط بوده: گروپ ۱ معاش جانبازی، گروپ ۲ سرتیفیکیت HC2 یا HC3، گروپ ۳ یکی از کمک‌هزینه‌ها، گروپ ۴ عاید کم با فورم HC1.',
        explanationFa: 'هر گروه آدرس فرستادن خودش را دارد و کنار همان گروه روی کاغذ نوشته شده. اگر در هیچ‌کدام از گروه‌های ۱ تا ۳ نیستید، گروه ۴ می‌گوید فرم HC1 را هم پر کنید.',
        whatTypeInfoNeeded: 'یک گروه، و شمارهٔ گواهی یا مشخصات کسی که کمک‌هزینه را می‌گیرد',
        exampleFormat: 'Group 3 ✗ Universal Credit',
        fieldKey: 'hc5_travel_reason',
        required: true
      },
      {
        id: 'hc5_travel_q5',
        number: 5,
        questionCode: 'Part 4A / 4B',
        section: 'Declaration and signature',
        questionEn: 'Sign at A if this is your own claim, or at B if you are claiming for someone else, where your name, address and relationship to the patient are also needed.',
        simpleEnglish: 'The form warns that giving false information may lead to prosecution.',
        farsiTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای شخص دیگری است بخش B، که نام و آدرس و نسبت شما با بیمار را هم می‌خواهد.',
        dariTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای کس دیگری است بخش B.',
        explanationFa: 'خود فرم هشدار می‌دهد دادن اطلاعات نادرست می‌تواند به پیگرد قانونی بینجامد. امضا و تاریخ میلادی لازم است.',
        whatTypeInfoNeeded: 'امضا و تاریخ میلادی',
        exampleFormat: 'Signed / 21 06 2026',
        fieldKey: 'hc5_travel_declaration',
        required: true
      }
    ]
  },
  {
    id: 'hc5_wigs',
    code: 'HC5(W)',
    titleEn: 'Refund claim form: NHS wigs and fabric supports HC5(W)',
    titleFa: 'پس گرفتن پول کلاه‌گیس و پوشش‌های پزشکی NHS (فرم HC5(W))',
    titleDari: 'پس گرفتن پول کلاه‌گیس و پوشش‌های طبی NHS (فورم HC5(W))',
    issuer: 'NHS Business Services Authority',
    category: 'nhs',
    purposeFa: 'اگر هزینهٔ کلاه‌گیس یا پوشش پارچه‌ای پزشکی NHS را پرداخته‌اید و حق معافیت داشته‌اید، با این فرم پولتان را پس بگیرید',
    purposeEn: 'Claim back NHS wig or fabric support charges you paid.',
    pdfPath: 'public/forms/hc5-wigs.pdf',
    officialSourceUrl: 'https://www.nhsbsa.nhs.uk/HC5',
    pageCount: 4,
    delivery: 'paper',
    questions: [
      {
        id: 'hc5_wigs_q1',
        number: 1,
        questionCode: 'Part 1',
        section: "Patient's details",
        questionEn: 'Surname, forenames, title, sex, date of birth, NHS number, National Insurance number, address and postcode, and contact details.',
        simpleEnglish: 'The patient is the person who had the treatment. If someone else should be contacted about the claim, their name goes in the contact box.',
        farsiTranslation: 'نام خانوادگی، نام، عنوان، جنسیت، تاریخ تولد، شمارهٔ NHS، شمارهٔ بیمهٔ ملی، آدرس و کد پستی، و مشخصات تماس.',
        dariTranslation: 'تخلص، نام، عنوان، جنسیت، تاریخ تولد، نمبر NHS، نمبر بیمهٔ ملی، آدرس و کد پستی، و معلومات تماس.',
        explanationFa: 'بیمار همان کسی است که درمان شده. اگر باید با شخص دیگری دربارهٔ این درخواست تماس بگیرند، نام او در کادر تماس نوشته می‌شود.',
        whatTypeInfoNeeded: 'نام کامل، تاریخ تولد میلادی، آدرس و کد پستی',
        exampleFormat: 'AHMADI / ALI / 10 05 1990 / M14 5TP',
        fieldKey: 'hc5_wigs_patient_details',
        required: true
      },
      {
        id: 'hc5_wigs_q2',
        number: 2,
        questionCode: 'Part 2',
        section: 'Charges paid',
        questionEn: 'Amount claimed and the date paid. Original receipts must be included.',
        simpleEnglish: 'The claim cannot be processed without the receipts.',
        farsiTranslation: 'مبلغی که می‌خواهید پس بگیرید و تاریخ پرداخت آن. رسیدهای اصلی را بفرستید؛ بدون آن‌ها درخواست بررسی نمی‌شود.',
        dariTranslation: 'مبلغی که می‌خواهید پس بگیرید و تاریخ پرداخت آن. رسیدهای اصلی را بفرستید؛ بدون آن‌ها درخواست بررسی نمی‌شود.',
        explanationFa: 'بدون رسید، درخواست بررسی نمی‌شود.',
        whatTypeInfoNeeded: 'مبلغ به پوند، تاریخ میلادی، و رسیدها',
        exampleFormat: '£75.00 / 20 05 2026',
        fieldKey: 'hc5_wigs_charges',
        required: true
      },
      {
        id: 'hc5_wigs_q3',
        number: 3,
        questionCode: 'Part 3',
        section: 'Part 3 - Other information we need',
        questionEn: 'The organisation that arranged the wig or support, then the bank account.',
        simpleEnglish: 'Wrong account details delay the refund.',
        farsiTranslation: 'نام و آدرس و تلفن سازمانی که کلاه‌گیس یا پوشش را برای شما ترتیب داده. خود فرم می‌گوید بدون این اطلاعات درخواست بررسی نمی‌شود؛ در نامهٔ ارجاعتان هست. بعد مشخصات حساب بانکی.',
        dariTranslation: 'نام و آدرس و تلفن سازمانی که کلاه‌گیس یا پوشش را برای شما ترتیب داده. خود فرم می‌گوید بدون این اطلاعات درخواست بررسی نمی‌شود؛ در نامهٔ ارجاعتان هست. بعد مشخصات حساب بانکی.',
        explanationFa: 'خود فرم می‌گوید مشخصات اشتباه بانکی پرداخت را عقب می‌اندازد. sort code شش رقم و شمارهٔ حساب هشت رقم است.',
        whatTypeInfoNeeded: 'سازمان ارجاع‌دهنده و حساب بانکی',
        exampleFormat: 'Sort code: 20 45 89 / Account: 12345678',
        fieldKey: 'hc5_wigs_part3',
        required: true
      },
      {
        id: 'hc5_wigs_q4',
        number: 4,
        questionCode: 'Part 4',
        section: 'Reason for claim',
        questionEn: 'Tick the group that applied on the day the charge was paid: Group 1 war pension, Group 2 an HC2 or HC3 certificate, Group 3 a qualifying benefit, Group 4 low income with an HC1.',
        simpleEnglish: 'Each group sends the form to a different address, printed beside it.',
        farsiTranslation: 'گروهی را علامت بزنید که روزِ پرداختِ هزینه به شما مربوط بوده: گروه ۱ مستمری جانبازی، گروه ۲ گواهی HC2 یا HC3، گروه ۳ یکی از کمک‌هزینه‌های واجد شرایط، گروه ۴ درآمد کم به همراه فرم HC1.',
        dariTranslation: 'گروهی را نشانی کنید که روز پرداخت مصرف به شما مربوط بوده: گروپ ۱ معاش جانبازی، گروپ ۲ سرتیفیکیت HC2 یا HC3، گروپ ۳ یکی از کمک‌هزینه‌ها، گروپ ۴ عاید کم با فورم HC1.',
        explanationFa: 'هر گروه آدرس فرستادن خودش را دارد و کنار همان گروه روی کاغذ نوشته شده. اگر در هیچ‌کدام از گروه‌های ۱ تا ۳ نیستید، گروه ۴ می‌گوید فرم HC1 را هم پر کنید.',
        whatTypeInfoNeeded: 'یک گروه، و شمارهٔ گواهی یا مشخصات کسی که کمک‌هزینه را می‌گیرد',
        exampleFormat: 'Group 3 ✗ Universal Credit',
        fieldKey: 'hc5_wigs_reason',
        required: true
      },
      {
        id: 'hc5_wigs_q5',
        number: 5,
        questionCode: 'Part 4A / 4B',
        section: 'Declaration and signature',
        questionEn: 'Sign at A if this is your own claim, or at B if you are claiming for someone else, where your name, address and relationship to the patient are also needed.',
        simpleEnglish: 'The form warns that giving false information may lead to prosecution.',
        farsiTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای شخص دیگری است بخش B، که نام و آدرس و نسبت شما با بیمار را هم می‌خواهد.',
        dariTranslation: 'اگر درخواست خودتان است بخش A را امضا کنید؛ اگر برای کس دیگری است بخش B.',
        explanationFa: 'خود فرم هشدار می‌دهد دادن اطلاعات نادرست می‌تواند به پیگرد قانونی بینجامد. امضا و تاریخ میلادی لازم است.',
        whatTypeInfoNeeded: 'امضا و تاریخ میلادی',
        exampleFormat: 'Signed / 21 06 2026',
        fieldKey: 'hc5_wigs_declaration',
        required: true
      }
    ]
  },
  {
    id: 'gp_registration',
    code: 'GMS1',
    titleEn: 'Register with a GP Surgery (PRF1, formerly GMS1)',
    titleFa: 'ثبت‌نام در مطب پزشک عمومی (GP)',
    titleDari: 'ثبت‌نام نزد داکتر عمومی (GP)',
    issuer: 'NHS England',
    category: 'nhs',
    purposeFa: 'ثبت‌نام رایگان در مطب پزشک عمومی (GP) برای دریافت خدمات درمانی و دارویی NHS',
    purposeEn: 'Register with a local NHS GP surgery for free healthcare access.',
    pdfPath: 'public/forms/gms1.pdf',
    officialSourceUrl: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/',
    pageCount: 8,
    delivery: 'paper',
    // The six sections of the real document, in its own order. The four
    // questions here before this were invented: they described a two-page
    // GMS1 that the NHS has since replaced with this eight-page form, and
    // none of their section numbers matched the paper a person was holding.
    questions: [
      {
        id: 'gms1_q1',
        number: 1,
        questionCode: 'Section 1',
        section: 'Who is registering',
        questionEn: 'Are you registering yourself, or someone else?',
        simpleEnglish:
          'Tick "Yourself" and go straight to Section 2. Only fill in your name, phone number and relationship if you are registering another person.',
        farsiTranslation: 'خودتان را ثبت‌نام می‌کنید یا شخص دیگری را؟',
        dariTranslation: 'خودتان را راجستر می‌کنید یا کس دیگری را؟',
        explanationFa:
          'اگر برای خودتان است، گزینهٔ Yourself را علامت بزنید و مستقیم به بخش ۲ بروید. سه کادر بعدی فقط برای کسی است که دارد شخص دیگری را ثبت‌نام می‌کند.',
        whatTypeInfoNeeded: 'Yourself یا Someone else؛ در حالت دوم نام، تلفن و نسبت شما',
        exampleFormat: 'Yourself ✗',
        fieldKey: 'gms1_who_registering',
        required: true
      },
      {
        id: 'gms1_q2',
        number: 2,
        questionCode: 'Section 2',
        section: 'Patient details',
        questionEn:
          'Your name, date of birth, sex as recorded on your NHS record, NHS number if you have it, place and country of birth, current address and phone numbers.',
        simpleEnglish:
          'Twenty four boxes of personal details. Use BLOCK CAPITALS. If a box does not apply, write N/A. There is a "No fixed address" box if you have nowhere settled.',
        farsiTranslation:
          'نام، تاریخ تولد، جنسیت ثبت‌شده در پروندهٔ NHS، شمارهٔ NHS در صورت داشتن، شهر و کشور محل تولد، آدرس فعلی و شماره‌های تماس شما.',
        dariTranslation:
          'نام، تاریخ تولد، جنسیت، نمبر NHS در صورت داشتن، شهر و کشور تولد، آدرس فعلی و نمبرهای تماس شما.',
        explanationFa:
          'این بخش مشخصات خود بیمار است. با حروف بزرگ انگلیسی بنویسید. اگر کادری به شما ربطی ندارد، N/A بنویسید. اگر آدرس ثابتی ندارید، کادر No fixed address هست.',
        whatTypeInfoNeeded: 'نام کامل، تاریخ تولد میلادی، آدرس و کد پستی، شماره موبایل بریتانیا',
        exampleFormat: 'AHMADI / ALI / 10 05 1990 / 25 PARK LANE, MANCHESTER, M14 5TP',
        fieldKey: 'gms1_patient_details',
        required: true
      },
      {
        id: 'gms1_q3',
        number: 3,
        questionCode: 'Section 3',
        section: 'Patients under 18',
        questionEn:
          'For a patient under 18: where they were born, nursery or school, anyone involved in their care, and their routine vaccinations.',
        simpleEnglish:
          'Skip this whole section if the patient is 18 or over. Two of its questions are for babies under 12 months only.',
        farsiTranslation:
          'برای بیمار زیر ۱۸ سال: محل تولد، مهدکودک یا مدرسه، افرادی که در مراقبت از او نقش دارند، و واکسن‌های معمول.',
        dariTranslation:
          'برای مریض زیر ۱۸ سال: محل تولد، کودکستان یا مکتب، کسانی که در مراقبت او دخیل‌اند، و واکسین‌های معمول.',
        explanationFa:
          'اگر بیمار ۱۸ سال یا بیشتر دارد، تمام این بخش را رد کنید. دو پرسش آن فقط برای نوزاد زیر ۱۲ ماه است.',
        whatTypeInfoNeeded: 'فقط در صورتی که بیمار زیر ۱۸ سال باشد',
        exampleFormat: 'N/A',
        fieldKey: 'gms1_under_18'
      },
      {
        id: 'gms1_q4',
        number: 4,
        questionCode: 'Section 4',
        section: 'Additional information',
        questionEn:
          'Ethnic group, whether you have registered with a UK GP before, the date you arrived in the UK, armed forces service, whether you need an interpreter and in which language, carer details, and your chosen pharmacy.',
        simpleEnglish:
          'Question 5 asks whether you need an interpreter at appointments, and question 6 asks which language. Question 3 asks the date you arrived in the UK.',
        farsiTranslation:
          'گروه قومی، اینکه قبلاً در بریتانیا نزد پزشک عمومی ثبت‌نام کرده‌اید یا نه، تاریخ ورود شما به بریتانیا، سابقهٔ خدمت در ارتش، اینکه در قرارها مترجم لازم دارید یا نه و به چه زبانی، اطلاعات مراقب، و داروخانهٔ انتخابی شما.',
        dariTranslation:
          'گروه قومی، ثبت‌نام قبلی نزد داکتر در بریتانیا، تاریخ ورود شما به بریتانیا، خدمت در اردو، ضرورت به ترجمان و زبان آن، معلومات مراقبت‌کننده، و دواخانهٔ انتخابی شما.',
        explanationFa:
          'پرسش ۵ می‌پرسد آیا برای قرارهایتان مترجم لازم دارید و پرسش ۶ می‌پرسد به چه زبانی. پرسش ۳ تاریخ ورود شما به بریتانیا را می‌خواهد.',
        whatTypeInfoNeeded: 'تاریخ ورود میلادی، زبان مورد نیاز برای ترجمه، نام و کد پستی داروخانه',
        exampleFormat: 'Arrived 15 01 2026 / Interpreter: Yes, Farsi',
        fieldKey: 'gms1_additional_info'
      },
      {
        id: 'gms1_q5',
        number: 5,
        questionCode: 'Section 5 (Part B)',
        section: 'Patient health',
        questionEn:
          'Past conditions, smoking, alcohol, height and weight, allergies, mental health, medication, disabilities, and any accessible format or reasonable adjustment you need.',
        simpleEnglish:
          'The form says you do not have to complete this section. Anything you do give helps the GP care for you.',
        farsiTranslation:
          'بیماری‌های گذشته، سیگار، الکل، قد و وزن، حساسیت‌ها، سلامت روان، داروها، ناتوانی‌ها، و هر شکل دسترس‌پذیر یا تسهیلاتی که لازم دارید.',
        dariTranslation:
          'مریضی‌های گذشته، سگرت، الکول، قد و وزن، حساسیت‌ها، صحت روانی، دواها، معلولیت‌ها، و هر تسهیلاتی که ضرورت دارید.',
        explanationFa:
          'خود فرم نوشته پر کردن این بخش اجباری نیست. هرچه بنویسید به پزشک کمک می‌کند مراقبت بهتری از شما بکند.',
        whatTypeInfoNeeded: 'اختیاری',
        exampleFormat: 'Prefer not to say',
        fieldKey: 'gms1_health'
      },
      {
        id: 'gms1_q6',
        number: 6,
        questionCode: 'Section 6 (Part C)',
        section: 'Patients from abroad',
        questionEn:
          'Only for people who do not normally live in the UK, or who live here and receive a pension or benefit from a European country. It asks you to pick a statement about paying for NHS care outside the surgery, and for EHIC or S1 details.',
        simpleEnglish:
          'The form itself says anyone can register with a GP and get free care at that surgery. This section is about care elsewhere, such as a hospital.',
        farsiTranslation:
          'فقط برای کسانی که ساکن دائم بریتانیا نیستند، یا اینجا زندگی می‌کنند ولی از یک کشور اروپایی مستمری یا کمک‌هزینه می‌گیرند. از شما می‌خواهد یکی از جمله‌های مربوط به پرداخت هزینهٔ درمان بیرون از مطب را انتخاب کنید و مشخصات EHIC یا S1 را بنویسید.',
        dariTranslation:
          'فقط برای کسانی که باشندهٔ دایمی بریتانیا نیستند، یا اینجا زندگی می‌کنند ولی از یک کشور اروپایی معاش می‌گیرند.',
        explanationFa:
          'خود فرم نوشته هر کسی می‌تواند نزد پزشک عمومی ثبت‌نام کند و مراقبت همان مطب برایش رایگان است. این بخش دربارهٔ درمان بیرون از مطب است، مثل بیمارستان. فرم پناهجویان و پناهندگان را در فهرست کسانی آورده که این مراقبت برایشان هم رایگان است.',
        whatTypeInfoNeeded: 'فقط در صورتی که ساکن دائم بریتانیا نیستید',
        exampleFormat: 'N/A',
        fieldKey: 'gms1_from_abroad'
      }
    ]
  },
  {
    id: 'arc_replacement',
    code: 'ARC',
    titleEn: 'Application for Replacement Application Registration Card (ARC)',
    titleFa: 'درخواست کارت جدید پناهندگی (کارت ARC گم‌شده یا دزدیده‌شده)',
    titleDari: 'درخواست کارت جدید پناهندگی (کارت ARC مفقود یا سرقت شده)',
    issuer: 'UK Visas & Immigration (Home Office)',
    category: 'home_office',
    purposeFa: 'درخواست صدور مجدد کارت هویت پناهندگی (ARC) در صورت مفقودی، سرقت یا آسیب‌دیدگی',
    purposeEn: 'Report lost, stolen, or damaged ARC identity card and request a replacement from Home Office.',
    pdfPath: 'public/forms/arc-replacement.pdf',
    officialSourceUrl: 'https://www.gov.uk/asylum-reporting-centre',
    pageCount: 2,
    delivery: 'online',
    questions: [
      {
        id: 'arc_q1',
        number: 1,
        questionCode: 'Box 1.1',
        section: 'Section 1: Applicant Information',
        questionEn: 'What is your Full Name as recorded on Home Office files?',
        simpleEnglish: 'Write your surname and first names exactly as shown on your Home Office letters.',
        farsiTranslation: 'نام کامل شما طبق پرونده هوم آفیس چیست؟',
        dariTranslation: 'نام مکمل شما مطابق اسناد هوم آفیس چیست؟',
        explanationFa: 'نام و نام خانوادگی به لاتین دقیقاً مطابق با مدارک پناهندگی ثبت‌شده.',
        whatTypeInfoNeeded: 'نام خانوادگی (SURNAME) و نام کوچک (First Name)',
        exampleFormat: 'SURNAME: AHMADI / First Name: Reza',
        fieldKey: 'arc_full_name',
        required: true
      },
      {
        id: 'arc_q2',
        number: 2,
        questionCode: 'Box 1.2',
        section: 'Section 1: Applicant Information',
        questionEn: 'What is your Home Office Reference Number / Port Reference?',
        simpleEnglish: 'Your 9-digit Home Office reference number (e.g. 01234567 or A1234567).',
        farsiTranslation: 'شماره مرجع هوم آفیس (HO Reference) شما چیست؟',
        dariTranslation: 'نمبر دوسیه هوم آفیس شما چیست؟',
        explanationFa: 'شماره ۹ رقمی پرونده که در بالای تمام نامه‌های رسمی هوم آفیس درج شده است.',
        whatTypeInfoNeeded: 'شماره پرونده ۹ رقمی هوم آفیس',
        exampleFormat: '01234567 or A1234567',
        fieldKey: 'arc_ho_ref',
        required: true,
        isLegallySensitive: true,
        legalAidNotice: 'شماره پرونده هوم آفیس شما کلید شناسه پرونده پناهندگی است.'
      },
      {
        id: 'arc_q3',
        number: 3,
        questionCode: 'Box 1.3',
        section: 'Section 1: Applicant Information',
        questionEn: 'What is your Date of Birth (DD/MM/YYYY)?',
        simpleEnglish: 'Your birth date in day / month / year format.',
        farsiTranslation: 'تاریخ تولد شما به میلادی چیست؟',
        dariTranslation: 'تاریخ تولد شما به میلادی چیست؟',
        explanationFa: 'تاریخ تولد میلادی ثبت‌شده در مدارک پناهندگی.',
        whatTypeInfoNeeded: 'روز / ماه / سال میلادی',
        exampleFormat: '15/04/1992',
        fieldKey: 'arc_dob',
        required: true
      },
      {
        id: 'arc_q4',
        number: 4,
        questionCode: 'Box 2.1',
        section: 'Section 2: Incident & Reason',
        questionEn: 'What is the reason for requesting a replacement ARC card?',
        simpleEnglish: 'Is your card lost, stolen, damaged, expired or has incorrect personal details?',
        farsiTranslation: 'علت درخواست کارت جدید ARC چیست؟',
        dariTranslation: 'علت درخواست کارت جدید پناهندگی چیست؟',
        explanationFa: 'علت مفقودی، دزدیده شدن، آسیب فیزیکی یا منقضی شدن کارت را مشخص کنید.',
        whatTypeInfoNeeded: 'انتخاب علت (Lost / Stolen / Damaged / Expired)',
        exampleFormat: 'Stolen on 10/08/2026 along with wallet',
        fieldKey: 'arc_reason_loss',
        required: true
      },
      {
        id: 'arc_q5',
        number: 5,
        questionCode: 'Box 2.2',
        section: 'Section 2: Incident & Reason',
        questionEn: 'What is the Police CAD / Incident Reference Number (if reported)?',
        simpleEnglish: 'If stolen or lost, give the police report reference number (e.g. CAD-12345/26).',
        farsiTranslation: 'شماره گزارش پلیس (Police CAD / Incident Ref) چیست؟',
        dariTranslation: 'نمبر راپور پولیس چیست؟',
        explanationFa: 'اگر سرقت یا مفقودی را به پلیس گزارش داده‌اید، شماره CAD یا شماره پیگیری پلیس را وارد کنید.',
        whatTypeInfoNeeded: 'شماره کدی پیگیری گزارش پلیس',
        exampleFormat: 'CAD-54321/26 (Greater Manchester Police)',
        fieldKey: 'arc_police_ref'
      },
      {
        id: 'arc_q6',
        number: 6,
        questionCode: 'Box 3.1',
        section: 'Section 3: Accommodation & Contact',
        questionEn: 'What is your current UK Address, Postcode, Mobile Number and Email?',
        simpleEnglish: 'Your current living address where Home Office can send your replacement ARC card.',
        farsiTranslation: 'آدرس کامل محل سکونت، کد پستی، شماره موبایل و ایمیل فعلی شما چیست؟',
        dariTranslation: 'آدرس، کد پستی و نمبر تماس شما جهت ارسال کارت چیست؟',
        explanationFa: 'آدرسی که کارت جدید به آن ارسال خواهد شد یا برای تحویل حضوری هماهنگ می‌شود.',
        whatTypeInfoNeeded: 'آدرس مسکن، کدپستی بریتانیا، شماره تلفن همراه',
        exampleFormat: 'Hotel Room 104, 12 Station Road, Birmingham, B1 1AA / 07123456789',
        fieldKey: 'arc_address_contact',
        required: true
      }
    ]
  },
  {
    id: 'asf1_asylum_support',
    code: 'ASF1',
    titleEn: 'Application for Asylum Support (ASF1)',
    titleFa: 'درخواست اسکان و کمک‌هزینه پناهندگی (فرم ASF1 / سکشن ۹۵ و سکشن ۴)',
    titleDari: 'درخواست جای بودوباش و کمک مالی پناهندگی (فرم ASF1)',
    issuer: 'UK Visas & Immigration (Home Office)',
    category: 'home_office',
    purposeFa: 'درخواست مسکن و حقوق هفتگی پناهندگی برای افراد فاقد تمکن مالی',
    purposeEn: 'Apply for Home Office housing and weekly cash support for destitute asylum seekers.',
    pdfPath: 'public/forms/asf1.pdf',
    officialSourceUrl: 'https://www.gov.uk/government/publications/application-for-asylum-support-form-asf1',
    pageCount: 36,
    delivery: 'paper',
    questions: [
      {
        id: 'asf1_q1',
        number: 1,
        questionCode: 'Section 1',
        section: 'Applicant & Family Details',
        questionEn: 'What are the personal details of the main applicant and all family members?',
        simpleEnglish: 'List full names, dates of birth, nationalities and Home Office reference numbers.',
        farsiTranslation: 'مشخصات کامل متقاضی اصلی و تمامی اعضای خانواده چیست؟',
        dariTranslation: 'معلومات مکمل متقاضی اصلی و تمام اعضای فامیل چیست؟',
        explanationFa: 'تمام افرادی که نیازمند مسکن و کمک مالی پناهندگی هستند باید نام برده شوند.',
        whatTypeInfoNeeded: 'نام، تاریخ تولد، تابعیت و شماره پرونده هوم آفیس همه اعضا',
        exampleFormat: 'Main applicant: Ali Ahmadi (DOB 12/03/1985, Iran), Wife: Maryam Ahmadi',
        fieldKey: 'asf1_family_details',
        required: true
      },
      {
        id: 'asf1_q2',
        number: 2,
        questionCode: 'Section 2',
        section: 'Destitution Proof & Assets',
        questionEn: 'Are you currently destitute or about to become destitute within 14 days?',
        simpleEnglish: 'Explain why you cannot afford food, accommodation or essential living needs.',
        farsiTranslation: 'آیا در حال حاضر بی‌پناه/فاقد تمکن مالی هستید یا ظرف ۱۴ روز آینده بی‌پناه می‌شوید؟',
        dariTranslation: 'آیا فعلاً بدون سرپناه و پول هستید؟',
        explanationFa: 'توضیح دهید که چرا توانایی پرداخت هزینه مسکن یا غذا را ندارید و اکنون کجا می‌خوابید.',
        whatTypeInfoNeeded: 'توضیح عدم تمکن مالی و محل خواب فعلی',
        exampleFormat: 'Currently sleeping on friend couch, no money left, evicted on 30/08/2026',
        fieldKey: 'asf1_destitution_reason',
        required: true,
        isLegallySensitive: true
      },
      {
        id: 'asf1_q3',
        number: 3,
        questionCode: 'Section 3',
        section: 'Special Needs & Disability',
        questionEn: 'Do you or any family member have medical conditions, pregnancy, or disability?',
        simpleEnglish: 'Any health issues needing ground floor housing, medical care or wheelchair access?',
        farsiTranslation: 'آیا شما یا اعضای خانواده بیماری خاص، بارداری یا معلولیت دارید؟',
        dariTranslation: 'آیا مشکل صحی، حمل‌داری یا معلولیت در فامیل دارید؟',
        explanationFa: 'جهت تخصیص مسکن مناسب (مانند طبقه همکف یا دسترسی آسانسر) مدارک پزشکی ضمیمه شود.',
        whatTypeInfoNeeded: 'نام بیماری، بارداری (تاریخ زایمان) یا معلولیت',
        exampleFormat: 'Pregnant (Due date 15/11/2026), needs ground floor accommodation',
        fieldKey: 'asf1_medical_needs'
      }
    ]
  },
  {
    id: 'asf2_additional_support',
    code: 'ASF2',
    titleEn: 'Request for Additional Support (ASF2)',
    titleFa: 'درخواست کمک اضافی (فرم ASF2 / سکشن ۹۶)',
    titleDari: 'درخواست کمک اضافی (فرم ASF2)',
    issuer: 'UK Visas & Immigration (Home Office)',
    category: 'home_office',
    purposeFa: 'درخواست کمک اضافی برای نیازهای ضروری که با کمک‌هزینه فعلی شما پوشش داده نمی‌شود',
    purposeEn: 'Ask for extra support when the current cash allowance does not cover essential living needs.',
    pdfPath: 'public/forms/asf2.pdf',
    officialSourceUrl: 'https://www.gov.uk/government/publications/application-for-additional-asylum-support-form-asf2',
    pageCount: 9,
    delivery: 'paper',
    // The Home Office publishes ASF2 as an ODT only. This PDF is that file
    // converted unchanged - no question set is written for it, because the
    // guidance comes from tapping the document itself.
    questions: [],
  },
  {
    id: 'universal_credit',
    code: 'UC',
    titleEn: 'Universal Credit Claim Information & Questionnaire',
    titleFa: 'فرم اطلاعات و درخواست کمک‌هزینه یونیورسال کریدیت (UC)',
    titleDari: 'فرم درخواست کمک مالی یونیورسال کریدیت (UC)',
    issuer: 'Department for Work and Pensions (DWP)',
    category: 'benefits',
    purposeFa: 'درخواست حقوق ماهانه معیشت و اجاره‌خانه پس از دریافت قبولی پناهندگی',
    purposeEn: 'Apply for financial monthly living allowance and housing help after refugee status is granted.',
    pdfPath: 'public/forms/universal-credit.pdf',
    officialSourceUrl: 'https://www.gov.uk/universal-credit',
    pageCount: 6,
    delivery: 'online',
    questions: [
      {
        id: 'uc_q1',
        number: 1,
        questionCode: 'Section 1',
        section: 'Identity & National Insurance',
        questionEn: 'What is your Full Name, DOB, and National Insurance Number (NINO)?',
        simpleEnglish: 'Your legal name, birth date and 9-character National Insurance number.',
        farsiTranslation: 'نام کامل، تاریخ تولد و شماره بیمه ملی (NINO) شما چیست؟',
        dariTranslation: 'نام مکمل، تاریخ تولد و نمبر بیمه ملی (NINO) شما چیست؟',
        explanationFa: 'شماره بیمه ملی (NINO) روی کارت BRP یا نامه قبولی پناهندگی درج شده است.',
        whatTypeInfoNeeded: 'نام، تاریخ تولد، شماره NINO (مثلا QQ 12 34 56 A)',
        exampleFormat: 'Name: AMIR HOSSEINI / DOB: 01/01/1990 / NINO: QQ123456A',
        fieldKey: 'uc_nino_details',
        required: true
      },
      {
        id: 'uc_q2',
        number: 2,
        questionCode: 'Section 2',
        section: 'UK Bank Account Details',
        questionEn: 'What are your UK Bank Account Name, Sort Code, and Account Number?',
        simpleEnglish: 'Bank details for receiving monthly Universal Credit payments.',
        farsiTranslation: 'مشخصات حساب بانکی بریتانیا (نام صاحب حساب، سورت کد و شماره حساب) چیست؟',
        dariTranslation: 'معلومات حساب بانکی شما برای دریافت حقوق چیست؟',
        explanationFa: 'حقوق ماهانه DWP فقط به حساب بانکی به نام خود شما واریز می‌شود.',
        whatTypeInfoNeeded: 'نام حساب، Sort Code (۶ رقمی)، Account Number (۸ رقمی)',
        exampleFormat: 'Amir Hosseini / Sort Code: 11-22-33 / Account No: 87654321',
        fieldKey: 'uc_bank_details',
        required: true
      },
      {
        id: 'uc_q3',
        number: 3,
        questionCode: 'Section 3',
        section: 'Housing & Tenancy Agreement',
        questionEn: 'What is your monthly rent amount and landlord contact details?',
        simpleEnglish: 'How much rent do you pay, and do you have a signed tenancy agreement?',
        farsiTranslation: 'مبلغ اجاره ماهانه و مشخصات صاحب‌خانه / اجاره‌نامه شما چیست؟',
        dariTranslation: 'کرایه ماهانه خانه و معلومات مالکان چیست؟',
        explanationFa: 'کمک‌هزینه مسکن یونیورسال کریدیت بر اساس اجاره‌نامه رسمی محاسبه می‌شود.',
        whatTypeInfoNeeded: 'مبلغ اجاره ماهانه، نام صاحب‌خانه/آژانس املاک',
        exampleFormat: '£650 per month, Tenancy agreement attached',
        fieldKey: 'uc_housing_details',
        required: true
      }
    ]
  },
  {
    id: 'school_admission',
    code: 'School Application',
    titleEn: 'In-Year School Admissions Application',
    titleFa: 'فرم ثبت‌نام مدرسه برای کودکان (ثبت‌نام میان‌سال یا شروع سال تحصیلی)',
    titleDari: 'فرم ثبت‌نام مکتب برای اطفال',
    issuer: 'Local Council Education Authority',
    category: 'education',
    purposeFa: 'ثبت‌نام فرزندان در مدارس دولتی محل سکونت بریتانیا',
    purposeEn: 'Apply for a local state primary or secondary school place for your children.',
    pdfPath: 'public/forms/school-admission.pdf',
    officialSourceUrl: 'https://www.gov.uk/apply-for-school-place',
    pageCount: 4,
    delivery: 'paper',
    questions: [
      {
        id: 'school_q1',
        number: 1,
        questionCode: 'Section 1',
        section: 'Child Details',
        questionEn: 'What is the Child\'s Full Name, Gender, DOB and Current School (if any)?',
        simpleEnglish: 'Details of the child needing a school place.',
        farsiTranslation: 'نام کامل فرزند، جنسیت، تاریخ تولد و مدرسه فعلی او چیست؟',
        dariTranslation: 'نام مکمل طفل، جنسیت و تاریخ تولد او چیست؟',
        explanationFa: 'مشخصات کامل کودکی که نیازمند ثبت‌نام در مدرسه است.',
        whatTypeInfoNeeded: 'نام فرزند، تاریخ تولد میلادی، جنسیت',
        exampleFormat: 'Child: ZAHRA AHMADI / Female / DOB: 14/06/2017',
        fieldKey: 'school_child_details',
        required: true
      },
      {
        id: 'school_q2',
        number: 2,
        questionCode: 'Section 2',
        section: 'Parent / Carer Contact & Address',
        questionEn: 'What is the Parent/Carer Name, Address, Postcode, Phone and Relationship?',
        simpleEnglish: 'Your contact details as parent or legal guardian.',
        farsiTranslation: 'نام، آدرس کامل، کد پستی و شماره تماس سرپرست قانونی چیست؟',
        dariTranslation: 'نام، آدرس و شماره تماس والدین طفل چیست؟',
        explanationFa: 'مدارس بر اساس فاصله جغرافیایی از منزل تا مدرسه به فرزندان جا تخصیص می‌دهند.',
        whatTypeInfoNeeded: 'نام سرپرست، آدرس با کدپستی، شماره موبایل',
        exampleFormat: 'Parent: Reza Ahmadi / 10 Church Street, Leeds, LS1 2AB / 07999888777',
        fieldKey: 'school_parent_details',
        required: true
      },
      {
        id: 'school_q3',
        number: 3,
        questionCode: 'Section 3',
        section: 'Preferred Schools Choice',
        questionEn: 'List your 3 preferred local schools in order of priority (Preference 1, 2, 3).',
        simpleEnglish: 'Name up to 3 local primary or secondary schools near your home.',
        farsiTranslation: 'نام ۳ مدرسه ترجیحی نزدیک محل سکونت خود را به ترتیب اولویت بنویسید.',
        dariTranslation: 'نام ۳ مکتب مورد نظر تان را بنویسید.',
        explanationFa: 'شورای محلی بر اساس این اولویت‌ها جای خالی در مدرسه پیدا می‌کند.',
        whatTypeInfoNeeded: 'نام ۳ مدرسه نزدیک',
        exampleFormat: '1. St Mary Primary School / 2. Oakfield Academy / 3. Hillside School',
        fieldKey: 'school_preferences',
        required: true
      }
    ]
  }
];
