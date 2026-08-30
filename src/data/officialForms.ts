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
    titleFa: 'ادعای کمک به هزینه‌های درمانی ان‌اچ‌اس (فرم HC1)',
    titleDari: 'ادعای کمک به مصارف صحی ان‌اچ‌اس (فرم HC1)',
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
    id: 'nhs_hc2_hc5',
    code: 'HC2 / HC5',
    titleEn: 'NHS Health Costs Certificate (HC2) / Refund Claim (HC5)',
    titleFa: 'گواهی معافیت پزشکی HC2 و درخواست استرداد هزینه HC5',
    titleDari: 'سرتیفیکیت معافیت صحی HC2 و درخواست بازپرداخت HC5',
    issuer: 'NHS Business Services Authority',
    category: 'nhs',
    purposeFa: 'درخواست بازپرداخت پول هزینه‌های پزشکی پرداختی ۳ ماه گذشته یا دریافت کارت معافیت کامل HC2',
    purposeEn: 'Claim money back for medical costs paid in the last 3 months or request full HC2 exemption.',
    pdfPath: 'public/forms/hc5.pdf',
    officialSourceUrl: 'https://www.nhsbsa.nhs.uk/nhs-low-income-scheme',
    pageCount: 4,
    delivery: 'paper',
    questions: [
      {
        id: 'hc5_q1',
        number: 1,
        questionCode: 'Part 1',
        section: 'Personal Details',
        questionEn: 'What is your Full Name, Address, and NHS Number?',
        simpleEnglish: 'Provide your name, current address, postcode and 10-digit NHS number.',
        farsiTranslation: 'نام کامل، آدرس دقیق و شماره NHS ۱۰ رقمی شما چیست؟',
        dariTranslation: 'نام مکمل، آدرس و نمبر NHS ۱۰ رقمی شما چیست؟',
        explanationFa: 'مشخصات فردی متقاضی بازپرداخت هزینه پزشکی.',
        whatTypeInfoNeeded: 'نام کامل، آدرس، کدپستی و شماره NHS',
        exampleFormat: 'REZA AHMADI, 15 High Street, London, NHS: 123 456 7890',
        fieldKey: 'hc5_personal_details',
        required: true
      },
      {
        id: 'hc5_q2',
        number: 2,
        questionCode: 'Part 2',
        section: 'Receipt Details',
        questionEn: 'What exact health costs did you pay, and on what date?',
        simpleEnglish: 'List prescription FP57 receipts, dental receipts, or glasses invoices.',
        farsiTranslation: 'چه هزینه‌های درمانی را در چه تاریخی پرداخت کرده‌اید؟',
        dariTranslation: 'کدام مصارف صحی را در چه تاریخی پرداخت کرده‌اید؟',
        explanationFa: 'باید رسيد رسمی FP57 یا رسید دندانپزشکی/عینک را ضمیمه کنید.',
        whatTypeInfoNeeded: 'تاریخ پرداخت، نوع درمان و مبلغ دقیق پرداختی',
        exampleFormat: 'Prescription charge £9.65 paid on 12/08/2026 (Receipt FP57 attached)',
        fieldKey: 'hc5_receipt_details',
        required: true
      },
      {
        id: 'hc5_q3',
        number: 3,
        questionCode: 'Part 3',
        section: 'Bank Details for Refund Direct Payment',
        questionEn: 'What are your UK Bank Account Name, Sort Code and Account Number?',
        simpleEnglish: 'Your bank details so NHS can pay your refund straight into your bank account.',
        farsiTranslation: 'نام صاحب حساب، سورت کُد (Sort Code) و شماره حساب بانکی بریتانیا جهت واریز وجه چیست؟',
        dariTranslation: 'معلومات حساب بانکی شما (سورت کد و نمبر حساب) برای واریز پول چیست؟',
        explanationFa: 'پزشکی و NHS مبلغ استرداد را مستقیماً به حساب بانکی شما واریز می‌کند.',
        whatTypeInfoNeeded: 'نام حساب، Sort Code (۶ رقمی) و Account Number (۸ رقمی)',
        exampleFormat: 'Account: Reza Ahmadi / Sort Code: 20-45-89 / Account No: 12345678',
        fieldKey: 'hc5_bank_details',
        required: true
      }
    ]
  },
  {
    id: 'gp_registration',
    code: 'GMS1',
    titleEn: 'Family Doctor Services Registration (GMS1)',
    titleFa: 'فرم ثبت‌نام پزشک عمومی خانواده (پزشک GP)',
    titleDari: 'فرم ثبت‌نام داکتر فامیلی (داکتر GP)',
    issuer: 'NHS England / Department of Health',
    category: 'nhs',
    purposeFa: 'ثبت‌نام رایگان در درمانگاه GP برای دریافت خدمات درمانی و دارویی ان‌اچ‌اس',
    purposeEn: 'Register with a local NHS General Practitioner (GP) surgery for free healthcare access.',
    pdfPath: 'public/forms/gms1.pdf',
    officialSourceUrl: 'https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/',
    pageCount: 2,
    delivery: 'paper',
    questions: [
      {
        id: 'gms1_q1',
        number: 1,
        questionCode: 'Section 1',
        section: 'Patient Details',
        questionEn: 'What is your Surname, First Name, Date of Birth, Sex and NHS Number?',
        simpleEnglish: 'Write your full legal name, date of birth (DD/MM/YYYY) and NHS number if known.',
        farsiTranslation: 'نام خانوادگی، نام کوچک، تاریخ تولد، جنسیت و شماره NHS شما چیست؟',
        dariTranslation: 'تخلص، نام، تاریخ تولد، جنسیت و نمبر NHS شما چیست؟',
        explanationFa: 'مشخصات فردی متقاضی ثبت نام در مطب پزشک GP.',
        whatTypeInfoNeeded: 'نام کامل، تاریخ تولد میلادی، جنسیت و شماره NHS',
        exampleFormat: 'Surname: AHMADI / First Name: Ali / DOB: 10/05/1990 / Male',
        fieldKey: 'gms1_patient_name',
        required: true
      },
      {
        id: 'gms1_q2',
        number: 2,
        questionCode: 'Section 2',
        section: 'Address & Contact',
        questionEn: 'What is your current UK home address, postcode, phone number and email?',
        simpleEnglish: 'Where do you live in the UK? Provide house number, street, city and postcode.',
        farsiTranslation: 'آدرس کامل محل سکونت، کد پستی، شماره تلفن و ایمیل شما در بریتانیا چیست؟',
        dariTranslation: 'آدرس مکمل، کد پستی و شماره تماس شما در بریتانیا چیست؟',
        explanationFa: 'آدرس دقیق برای ارسال نامه‌های نوبت‌دهی بیمارستان و آزمایشگاه‌ها استفاده می‌شود.',
        whatTypeInfoNeeded: 'آدرس، کد پستی ۶ یا ۷ کاراکتری، شماره موبایل بریتانیا',
        exampleFormat: 'Flat 4, 25 Park Lane, Manchester, M14 5TP / Tel: 07700 900123',
        fieldKey: 'gms1_address',
        required: true
      },
      {
        id: 'gms1_q3',
        number: 3,
        questionCode: 'Section 3',
        section: 'Previous GP & History',
        questionEn: 'Who was your previous GP surgery in the UK, or are you arriving from abroad?',
        simpleEnglish: 'Name of your last UK doctor or town, or date you entered the UK if arriving from abroad.',
        farsiTranslation: 'نام پزشک عمومی قبلی شما در بریتانیا چه بوده است یا چه تاریخی وارد بریتانیا شدید؟',
        dariTranslation: 'داکتر قبلی شما در بریتانیا چه نام داشت یا چه زمانی وارد بریتانیا شدید؟',
        explanationFa: 'در صورتی که تازه به بریتانیا رسیده‌اید، تاریخ ورود به کشور را بنویسید تا پرونده جدید ایجاد شود.',
        whatTypeInfoNeeded: 'نام درمانگاه قبلی یا تاریخ ورود به بریتانیا',
        exampleFormat: 'Arrived from abroad on 15/01/2026',
        fieldKey: 'gms1_previous_gp'
      },
      {
        id: 'gms1_q4',
        number: 4,
        questionCode: 'Section 4',
        section: 'Organ Donation & Declaration',
        questionEn: 'Organ Donor Registration & Signature',
        simpleEnglish: 'Sign and date to confirm you want to register with this GP surgery.',
        farsiTranslation: 'امضا و تایید ثبت‌نام در مطب GP',
        dariTranslation: 'امضا و تایید ثبت‌نام داکتر GP',
        explanationFa: 'امضای متقاضی جهت موافقت با ثبت‌نام و انتقال پرونده پزشکی.',
        whatTypeInfoNeeded: 'امضا و تاریخ میلادی',
        exampleFormat: 'Signed: A. Ahmadi / Date: 27/08/2026',
        fieldKey: 'gms1_signature',
        required: true
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
    officialSourceUrl: 'https://www.gov.uk/asylum-support/how-to-claim',
    pageCount: 12,
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
