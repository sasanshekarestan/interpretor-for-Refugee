import React, { useState, useRef, useEffect } from 'react';
import { FormQuestion, FormAnswer, FormConsistencyWarning, UserLanguage } from '../types';
import { SAMPLE_FORM_DOCUMENTS, SampleFormPage } from '../data/sampleFormTemplates';
import { OFFICIAL_FORMS, OfficialForm } from '../data/officialForms';
import { OfficialPdfViewer } from './OfficialPdfViewer';
import { detectAndConvertShamsi } from '../utils/dateConverter';
import { ShamsiDateConverterWidget } from './ShamsiDateConverterWidget';
import { FormAnswerBlock } from './FormAnswerBlock';
import { FormQuestionCard } from './FormQuestionCard';
import { FormAssistantPanel } from './FormAssistantPanel';
import { getSuperSimpleQuestionGuidance } from '../utils/simpleQuestionHelper';
import { 
  CheckSquare, 
  Mic, 
  SquarePen, 
  HelpCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Upload, 
  FileText, 
  RotateCcw, 
  Download,
  AlertCircle,
  Paperclip,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Copy,
  Check,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Edit3,
  MessageSquare,
  Send,
  Bot,
  User,
  Volume2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  List,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react';

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
  uploadedPages?: { id: string; pageNumber: number; dataUrl: string; fileName: string; isBlurryOrDark?: boolean }[];
}

interface FormCompanionProps {
  userLanguage: UserLanguage;
  onGoBackToHome?: () => void;
  onPlayAudio?: (text: string, lang: string) => void;
  onOpenUploadModal?: () => void;
  onClearCustomForm?: () => void;
  initialFormId?: string | null;
  customUploadedForm?: CustomFormObject | null;
}

const SUPPORTED_FORMS = [
  {
    id: 'arc_replacement',
    title: 'ARC Card Replacement Form',
    titleFa: 'فرم درخواست کارت جایگزین ای‌آر‌سی',
    description: 'Application to replace a lost, stolen, or damaged Application Registration Card (ARC).',
    questionsCount: 8,
    category: 'Home Office',
  },
  {
    id: 'nhs_hc1',
    title: 'NHS HC1 Low Income Scheme',
    titleFa: 'فرم کمک‌هزینه درمانی ان‌اچ‌اس (ایچ‌سی۱)',
    description: 'Claim free NHS prescriptions, dental care, and glasses support.',
    questionsCount: 10,
    category: 'Healthcare',
  },
  {
    id: 'section95_coc',
    title: 'Section 95 Change of Circumstances',
    titleFa: 'تغییر شرایط حمایت پناهندگی (سکشن ۹۵)',
    description: 'Report a change of address, newborn child, or financial change to Home Office.',
    questionsCount: 9,
    category: 'Asylum Support',
  },
  {
    id: 'gp_registration',
    title: 'GP Doctor Registration (GMS1)',
    titleFa: 'فرم ثبت‌نام پزشک عمومی (جی‌پی)',
    description: 'Register yourself and family with a local UK NHS GP surgery.',
    questionsCount: 8,
    category: 'NHS',
  },
  {
    id: 'council_housing',
    title: 'Council Housing Assistance Inquiry',
    titleFa: 'درخواست مسکن و کمک شهرداری',
    description: 'Initial inquiry form for emergency accommodation or homelessness advice.',
    questionsCount: 8,
    category: 'Housing',
  },
];

const SAMPLE_FORM_QUESTIONS: Record<string, FormQuestion[]> = {
  arc_replacement: [
    {
      id: 'arc_q1',
      number: 1,
      questionCode: 'Q1',
      shortLabelFa: 'سوال ۱: مشخصات فردی و پرونده',
      totalQuestions: 3,
      section: 'بخش ۱: اطلاعات شخصی و شماره‌های مرجع / Section 1: Applicant Details',
      questionEn: 'Section 1: What is your Full Name, Home Office Reference Number, and Date of Birth?',
      simpleEnglish: 'Provide your full legal name as written on Home Office files, 9-digit HO Ref, and birth date.',
      farsiTranslation: 'سوال ۱: نام و نام خانوادگی کامل، شماره مرجع ۹ رقمی هوم آفیس و تاریخ تولد میلادی شما چیست؟',
      dariTranslation: 'سوال ۱: نام کامل، نمبر مرجع هوم آفیس و تاریخ تولد شما چیست؟',
      explanationFa: 'مشخصات هویت فردی شامل: ۱) نام کامل انگلیسی طبق مدرک ۲) شماره مرجع هوم آفیس (۹ رقمی) ۳) تاریخ تولد میلادی (DD/MM/YYYY).',
      whatTypeInfoNeeded: 'Full Name, HO Reference Number, and Date of Birth',
      exampleFormat: 'e.g. Ali Reza AHMADI | HO: 012/345/678 | DOB: 15/08/1994',
      fieldKey: 'full_name',
      required: true,
    },
    {
      id: 'arc_q2',
      number: 2,
      questionCode: 'Q2',
      shortLabelFa: 'سوال ۲: علت درخواست و گزارش پلیس',
      totalQuestions: 3,
      section: 'بخش ۲: گزارش حادثه و علت درخواست / Section 2: Incident Details',
      questionEn: 'Section 2: Why do you need a replacement ARC (Lost/Stolen/Damaged/Expired) and what is your Police CAD number?',
      simpleEnglish: 'Tick the reason on your form and write police reference if card was stolen.',
      farsiTranslation: 'سوال ۲: علت نیاز به کارت جدید چیست (گم شده، دزدیده شده، آسیب دیده یا منقضی شده) و در صورت گزارش به پلیس، شماره CAD چیست؟',
      dariTranslation: 'سوال ۲: دلیل درخواست کارت نو چیست و نمبر پولیس شما چند است؟',
      explanationFa: 'علت درخواست کارت جدید را علامت بزنید و در صورت دزدیده شدن یا گزارش به پلیس، شماره مرجع CAD پلیس را وارد نمایید.',
      whatTypeInfoNeeded: 'Reason for replacement (Checkboxes) & Police CAD Number',
      exampleFormat: 'Tick on Form: [X] Lost / [X] Stolen | Police CAD-12345/22',
      fieldKey: 'reason_loss',
      required: true,
      isCheckbox: true,
      options: [
        { value: 'Lost', labelEn: 'Lost ARC card (کارت گم شده)', labelFa: 'کارت گم شده است' },
        { value: 'Stolen', labelEn: 'Stolen card with Police Report (دزدیده شده با گزارش پلیس)', labelFa: 'کارت دزدیده شده و به پلیس گزارش شده است' },
        { value: 'Damaged', labelEn: 'Damaged or unreadable chip (آسیب دیده یا شکستگی)', labelFa: 'کارت آسیب دیده یا تراشه ناخوانا است' },
        { value: 'Expired', labelEn: 'Expired ARC card (کارت منقضی شده)', labelFa: 'اعتبار کارت به پایان رسیده است' },
      ],
    },
    {
      id: 'arc_q3',
      number: 3,
      questionCode: 'Q3',
      shortLabelFa: 'سوال ۳: آدرس، پناهندگی و تماس',
      totalQuestions: 3,
      section: 'بخش ۳: آدرس مسکن، دلایل پناهندگی و تماس / Section 3: Accommodation & Contact',
      questionEn: 'Section 3: What is your full UK Accommodation Address, brief Asylum grounds reason, and UK Contact Phone/Email?',
      simpleEnglish: 'Full address with postcode, brief asylum reason, and your active UK mobile number or email.',
      farsiTranslation: 'سوال ۳: آدرس کامل اقامتگاه در بریتانیا با کدپستی، خلاصه علل عدم امکان بازگشت و شماره تماس/ایمیل شما چیست؟',
      dariTranslation: 'سوال ۳: آدرس کامل، دلیل عدم امکان بازگشت و شماره تماس شما چیست؟',
      explanationFa: 'آدرس دقیق محل سکونت (هتل یا خانه) همراه با کد پستی ۶-۷ رقمی، شرح کوتاه دلایل پناهندگی، و شماره موبایل بریتانیایی جهت هماهنگی تحویل کارت.',
      whatTypeInfoNeeded: 'UK Accommodation Address, Postcode, Asylum Reason & Contact Phone',
      exampleFormat: 'e.g. Room 204, Crown Hotel, Manchester M1 2AB | Phone: 07700 900123',
      isLegallySensitive: true,
      legalAidNotice: 'اطلاعات مربوط به پرونده پناهندگی شما عیناً روی فرم درج می‌شود. برای مشاوره حقوقی تخصصی با وکیل رسمی مشورت کنید.',
      fieldKey: 'current_address',
      required: true,
    },
  ],

  nhs_hc1: [
    {
      id: 'hc1_part1',
      number: 1,
      questionCode: 'Part 1',
      shortLabelFa: 'بخش ۱: اطلاعات متقاضی و همسر (صفحه ۵)',
      totalQuestions: 10,
      section: 'Part 1: About you and your partner (Page 5)',
      questionEn: 'Part 1: Refund Checkboxes (1.1), Partner Status (1.2), and Personal Details for You and Your Partner (1.3)',
      simpleEnglish: 'Tick health costs already paid (1.1), say if you have a partner (1.2), and write full name, DOB, 10-digit NHS No., address, and phone (1.3).',
      farsiTranslation: 'بخش ۱: علامت زدن استرداد هزینه‌های درمانی قبلی (۱.۱)، وضعیت پارتنر/همسر (۱.۲) و مشخصات فردی شما و همسرتان شامل نام کامل، تاریخ تولد، شماره ۱۰ رقمی NHS، آدرس و شماره تماس (۱.۳)',
      dariTranslation: 'بخش ۱: انتخاب مصارف صحی قبلی، وضعیت همسر و معلومات شخصی با نمبر NHS و آدرس دقیق',
      explanationFa: 'مشخصات کامل متقاضی و همسر را بنویسید. در صورت پرداخت قبلی برای دارو، دندانپزشکی یا عینک، مربع ۱.۱ را تیک بزنید. شماره ۱۰ رقمی NHS روی کارت پزشک یا نامه‌های درمانی درج شده است.',
      whatTypeInfoNeeded: 'Full Name, Title, DOB, 10-digit NHS Number, UK Address, Phone & Email',
      exampleFormat: 'e.g. SURNAME: Karimi | First Name: Ali | DOB: 15/08/1992 | NHS: 485 772 9901 | Address: 12 High St, Leeds LS1 2AB',
      fieldKey: 'hc1_part1_details',
      required: true,
      isCheckbox: true,
      options: [
        { value: 'Prescriptions', labelEn: '1.1 NHS Prescriptions (داروهای نسخه ان‌اچ‌اس)', labelFa: 'درخواست بازپرداخت هزینه داروی نسخه' },
        { value: 'Dental', labelEn: '1.1 NHS Dental treatment (دندانپزشکی)', labelFa: 'درخواست بازپرداخت هزینه خدمات دندانپزشکی' },
        { value: 'Sight', labelEn: '1.1 Sight tests / Glasses & Lenses (معاینه چشم و عینک)', labelFa: 'درخواست بازپرداخت هزینه معاینه چشم و عینک' },
        { value: 'Wigs', labelEn: '1.1 NHS Wigs or fabric supports (کلاه گیس/پشتیبان طبی)', labelFa: 'درخواست بازپرداخت کلاه گیس یا پد طبی ان‌اچ‌اس' },
        { value: 'Travel', labelEn: '1.1 Travel to receive NHS treatment (هزینه رفت‌وآمد درمانی)', labelFa: 'درخواست بازپرداخت هزینه رفت‌وآمد کرایه بیمارستان' },
        { value: 'HasPartner', labelEn: '1.2 Do you have a partner living with you? (داشتن همسر/پارتنر)', labelFa: 'دارای همسر/پارتنر ساکن در همین آدرس' },
      ],
    },
    {
      id: 'hc1_part2',
      number: 2,
      questionCode: 'Part 2',
      shortLabelFa: 'بخش ۲: فرزندان و جوانان تحت تکفل (صفحه ۶)',
      totalQuestions: 10,
      section: 'Part 2: Children and qualifying young people (Page 6)',
      questionEn: 'Part 2 (2.1): Do you have any children under 16 or qualifying young people 16-19 in full-time education living with you?',
      simpleEnglish: 'Write full names, dates of birth, and relationships for any children under 16 or 16-19 in school/training.',
      farsiTranslation: 'بخش ۲ (۲.۱): آیا فرزند زیر ۱۶ سال یا جوان ۱۶ تا ۱۹ ساله محصل که با شما زندگی می‌کند دارید؟',
      dariTranslation: 'بخش ۲: نام کامل، تاریخ تولد و نسبت فرزندان یا جوانان محصل تحت تکفل شما',
      explanationFa: 'مشخصات کامل تمام فرزندان زیر ۱۶ سال یا ۱۶ تا ۱۹ سال که در حال تحصیل تمام وقت یا دوره کارآموزی تاییدشده هستند.',
      whatTypeInfoNeeded: 'Child Full Names, Dates of Birth, and Relationship to applicant',
      exampleFormat: 'e.g. Sara Karimi | DOB: 10/04/2012 | Daughter',
      fieldKey: 'hc1_part2_children',
      required: false,
    },
    {
      id: 'hc1_part3',
      number: 3,
      questionCode: 'Part 3',
      shortLabelFa: 'بخش ۳: سایر ساکنین خانه و مستاجرین (صفحه ۷-۸)',
      totalQuestions: 10,
      section: 'Part 3: Other people living in your home (Pages 7-8)',
      questionEn: 'Part 3 (3.1 - 3.3): Details of other relatives, friends, lodgers, or boarders in your household, their work hours, and benefits',
      simpleEnglish: 'List any other adults living with you, their relationship, benefit status, average work hours (over/under 16 hrs), and weekly income.',
      farsiTranslation: 'بخش ۳ (۳.۱ تا ۳.۳): آیا افراد دیگری (اقوام، دوستان، هم‌خانه‌ای یا پانسیونر) با شما زندگی می‌کنند؟ میزان درآمد و ساعات کار آنها چیست؟',
      dariTranslation: 'بخش ۳: معلومات در مورد سایر اقارب یا هم‌خانه‌ای‌های ساکن در منزل شما',
      explanationFa: 'نام و وضعیت تمام بزرگسالانی که با شما در یک خانه زندگی می‌کنند (غیر از همسر و فرزندان). وضعیت دریافت مزایای آنها برای محاسبه هزینه مسکن بررسی می‌شود.',
      whatTypeInfoNeeded: 'Other Adult Names, Ages, Relationships, Benefit status, and Weekly Income',
      exampleFormat: 'e.g. Person 1: Reza | Brother | Age 24 | Universal Credit | Work <16 hrs/wk',
      fieldKey: 'hc1_part3_residents',
      required: false,
    },
    {
      id: 'hc1_part4',
      number: 4,
      questionCode: 'Part 4',
      shortLabelFa: 'بخش ۴: پس‌انداز، حساب بانکی و املاک (صفحه ۹)',
      totalQuestions: 10,
      section: 'Part 4: About property, savings and other money (Page 9)',
      questionEn: 'Part 4 (4.1 & 4.2): Savings in bank/building society accounts, Premium Bonds, shares, ISAs (<£16,000) and other property or land owned',
      simpleEnglish: 'Declare all combined bank account balances, savings, and investments for you and your partner (must be under £16,000 limit).',
      farsiTranslation: 'بخش ۴ (۴.۱ و ۴.۲): مجموع پس‌انداز و موجودی حساب‌های بانکی بریتانیا و خارج از کشور شما و همسرتان (سقف ۱۶,۰۰۰ پوند) و املاک دیگر',
      dariTranslation: 'بخش ۴: میزان مجموعی پس‌انداز بانکی و املاک شما و همسرتان (باید زیر ۱۶,۰۰۰ پوند باشد)',
      explanationFa: 'مجموع موجودی تمامی حساب‌های بانکی شما و همسرتان. برای دریافت کارت معافیت کامل HC2، سقف پس‌انداز نباید از ۱۶,۰۰۰ پوند بیشتر باشد.',
      whatTypeInfoNeeded: 'Total Combined Savings & Bank Balances, Shares, Property Details',
      exampleFormat: 'Bank Account Balance: £120 | Premium Bonds: £0 | Second Property: None',
      fieldKey: 'hc1_part4_savings',
      required: true,
    },
    {
      id: 'hc1_part5',
      number: 5,
      questionCode: 'Part 5',
      shortLabelFa: 'بخش ۵: درآمدها و مزایای دولتی (صفحه ۱۰-۱۱)',
      totalQuestions: 10,
      section: 'Part 5: About your income (Pages 10-11)',
      questionEn: 'Part 5 (5.1 - 5.9): Social security benefits (Universal Credit, Asylum Support S95, Pension, JSA/ESA), disability allowances (PIP, DLA), and pensions',
      simpleEnglish: 'List all benefits, asylum support (Section 95), pensions, or disability allowances received by you or your partner.',
      farsiTranslation: 'بخش ۵ (۵.۱ تا ۵.۹): مزایای دولتی دریافتی (پناهندگی سکشن ۹۵، کارت ASPEN، یونیورسال کریدیت، PIP، DLA) و سایر درآمدهای منظم',
      dariTranslation: 'بخش ۵: انواع کمک‌هزینه‌ها و مزایای دولتی که شما یا همسرتان دریافت می‌کنید',
      explanationFa: 'نام تمام مزایا یا حمایت‌های مالی دولتی دریافتی (مانند حمایت پناهندگی Section 95، کارت ASPEN، Universal Credit، PIP، ESA) به همراه مبالغ پرداختی.',
      whatTypeInfoNeeded: 'Benefit Names (Asylum Support S95, UC, PIP, DLA, Pension) and Amounts',
      exampleFormat: 'e.g. Section 95 Asylum Support (£49.18/wk per person) OR Universal Credit (£368/month)',
      fieldKey: 'hc1_part5_income',
      required: true,
      isCheckbox: true,
      options: [
        { value: 'Section95', labelEn: 'Section 95 Asylum Support / ASPEN Card (حمایت پناهندگی سکشن ۹۵)', labelFa: 'دریافت‌کننده حمایت پناهندگی سکشن ۹۵ هوم آفیس' },
        { value: 'UniversalCredit', labelEn: 'Universal Credit (یونیورسال کریدیت)', labelFa: 'دریافت‌کننده یونیورسال کریدیت یا مزایای کم‌درآمد' },
        { value: 'ESA_JSA', labelEn: 'ESA / JSA Employment & Support Allowance', labelFa: 'مزایای جویندگان کار یا ازکارافتادگی (ESA/JSA)' },
        { value: 'PIP_DLA', labelEn: 'PIP / DLA Disability Living Allowance', labelFa: 'دریافت‌کننده معلولیت و مراقبت (PIP یا DLA)' },
      ],
    },
    {
      id: 'hc1_part6',
      number: 6,
      questionCode: 'Part 6',
      shortLabelFa: 'بخش ۶: اطلاعات اشتغال و فیش حقوقی (صفحه ۱۲-۱۳)',
      totalQuestions: 10,
      section: 'Part 6: About work (Pages 12-13)',
      questionEn: 'Part 6 (6.1 - 6.5): Employment or self-employment status, job title, hours worked per week, payslips provided, and personal pension',
      simpleEnglish: 'State if you or your partner have a job, job title, weekly hours, zero-hours contract status, and attach required payslips.',
      farsiTranslation: 'بخش ۶ (۶.۱ تا ۶.۵): وضعیت اشتغال (استخدامی یا خویش‌فرمایی)، عنوان شغلی، ساعات کار هفتگی و فیش‌های حقوقی ارسالی',
      dariTranslation: 'بخش ۶: معلومات وظیفه، ساعات کار هفتگی و فیش معاشات شما یا همسرتان',
      explanationFa: 'در صورت کار کردن، عنوان شغلی، ساعات کار هفتگی و نحوه دریافت حقوق (هفتگی/ماهانه) را بنویسید. آخرین فیش‌های حقوقی (۲ تا ۵ عدد) باید ضمیمه شوند.',
      whatTypeInfoNeeded: 'Employment Status, Job Title, Weekly Hours, Pay Frequency & Payslips',
      exampleFormat: 'e.g. Unemployed / Student OR Employed: Kitchen Assistant | 16 hrs/week | Weekly payslip',
      fieldKey: 'hc1_part6_work',
      required: true,
    },
    {
      id: 'hc1_part7',
      number: 7,
      questionCode: 'Part 7',
      shortLabelFa: 'بخش ۷: هزینه‌های اجاره، مسکن و شورای شهر (صفحه ۱۴-۱۵)',
      totalQuestions: 10,
      section: 'Part 7: About where you live (Pages 14-15)',
      questionEn: 'Part 7 (7.1 - 7.12): Accommodation type, weekly/monthly rent paid, heating/lighting/water/meals included, Council Tax, and mortgage payments',
      simpleEnglish: 'Provide your housing details: rent paid, Housing Benefit deductions, included bills (heating/hot water), Council Tax, or mortgage.',
      farsiTranslation: 'بخش ۷ (۷.۱ تا ۷.۱۲): نوع مسکن، میزان اجاره‌بهای پرداختی، شامل بودن قبوض گرمایش و آب، مالیات شورای شهر (Council Tax) یا وام مسکن',
      dariTranslation: 'بخش ۷: مصارف مسکن شامل کرایه خانه، بل‌های انرژی و مالیه شورای شهر',
      explanationFa: 'مبلغ اجاره‌بها، کسر نفع مسکن (Housing Benefit)، اینکه آیا قبوض گاز و برق یا وعده‌های غذایی روی اجاره محاسبه شده‌اند یا خیر.',
      whatTypeInfoNeeded: 'Weekly/Monthly Rent Paid, Included Utilities (Heating/Lighting/Water), Council Tax',
      exampleFormat: 'e.g. Rent: £150/week | Heating/Water included: Yes | Housing Benefit: £0',
      fieldKey: 'hc1_part7_housing',
      required: true,
    },
    {
      id: 'hc1_part8',
      number: 8,
      questionCode: 'Part 8',
      shortLabelFa: 'بخش ۸: اطلاعات تحصیل و حمایت مالی دانشجویی (صفحه ۱۶-۱۸)',
      totalQuestions: 10,
      section: 'Part 8: People in education (Pages 16-18)',
      questionEn: 'Part 8 (8.1 - 8.8): College/University details, exact term dates, Student Finance (SFE/SFW/SAAS/NHS), bursaries, grants, and term-time housing rent',
      simpleEnglish: 'If in education, state your college/university name, exact term dates, Student Finance loan/bursary details, and student housing rent.',
      farsiTranslation: 'بخش ۸ (۸.۱ تا ۸.۸): آیا دانشجو یا محصل هستید؟ نام دانشگاه/کالج، تاریخ‌های دقیق ترم، وام یا بورس تحصیلی (Student Finance) و اجاره خوابگاه',
      dariTranslation: 'بخش ۸: معلومات پوهنتون یا مکتب، تاریخ‌های سمستر و کمک‌هزینه تحصیلی',
      explanationFa: 'اگر شما یا همسرتان دانشجو هستید، نام دانشگاه/کالج، تاریخ‌های دقیق ۳ ترم تحصیلی و مدارک دریافت وام یا بورس تحصیلی را مشخص کنید.',
      whatTypeInfoNeeded: 'University/College Name, Exact 3-Term Dates, Student Finance Breakdown',
      exampleFormat: 'e.g. Not in education OR Student: University of Leeds | SFE Grant: £4,000/yr',
      fieldKey: 'hc1_part8_education',
      required: false,
    },
    {
      id: 'hc1_part9',
      number: 9,
      questionCode: 'Part 9',
      shortLabelFa: 'بخش ۹: توضیحات تکمیلی و چک‌لیست مدارک (صفحه ۱۹)',
      totalQuestions: 10,
      section: 'Part 9: Other information & evidence checklist (Page 19)',
      questionEn: 'Part 9: Space for extra circumstances (how you live if no income, mobility car, etc.) and mandatory attached evidence checklist',
      simpleEnglish: 'Provide any additional details about your circumstances and tick the checklist confirming attached payslips or award letters.',
      farsiTranslation: 'بخش ۹: فضای توضیحات اضافه درباره نحوه گذران زندگی و چک‌لیست تایید مدارک ضمیمه‌شده (فیش حقوقی، گواهی تحصیل)',
      dariTranslation: 'بخش ۹: توضیحات اضافه و چک‌لیست اسناد ضمیمه‌شده برای ان‌اچ‌اس',
      explanationFa: 'توضیح دهید در صورت نداشتن درآمد، مخارج زندگی چگونه تامین می‌شود. همچنین کادرهای چک‌لیست مدارک پیوست‌شده (فیش حقوقی، مدارک دانشجویی) را علامت بزنید.',
      whatTypeInfoNeeded: 'Additional Circumstances Notes & Evidence Checklist Checkboxes',
      exampleFormat: 'e.g. Currently supported by Section 95 Asylum Support allowance. All questions answered.',
      fieldKey: 'hc1_part9_checklist',
      required: true,
    },
    {
      id: 'hc1_part10',
      number: 10,
      questionCode: 'Part 10',
      shortLabelFa: 'بخش ۱۰: بیانیه قانونی، امضا و تاریخ (صفحه ۲۰)',
      totalQuestions: 10,
      section: 'Part 10: Declaration & Signature (Page 20)',
      questionEn: 'Part 10: Declaration statement, Box 10a signature and date for applicant, or Box 10b signature and details if claiming on behalf of someone else',
      simpleEnglish: 'Sign and date Box 10a (for yourself) or Box 10b (if signing on behalf of someone who cannot manage their affairs).',
      farsiTranslation: 'بخش ۱۰: بیانیه قانونی تایید صحت اطلاعات، امضا و تاریخ در کادر 10a (متقاضی) یا کادر 10b (نماینده قانونی با ذکر نام و آدرس)',
      dariTranslation: 'بخش ۱۰: امضا و تاریخ نهایی فرم در باکس 10a یا 10b جهت تایید قانون',
      explanationFa: 'کادر 10a باید توسط متقاضی یا همسر امضا و تاریخ زده شود. در صورتی که برای شخص دیگری فرم را پر می‌کنید، کادر 10b را امضا کرده و مشخصات خود را بنویسید.',
      whatTypeInfoNeeded: 'Applicant Signature, Date DD/MM/YYYY or Representative Details (Box 10b)',
      exampleFormat: 'Signed in Box 10a | Date: DD/MM/YYYY | Full Name: Ali Karimi',
      fieldKey: 'hc1_part10_declaration',
      required: true,
    },
  ],

  section95_coc: [
    {
      id: 's95_q1',
      number: 1,
      questionCode: 'Q1',
      shortLabelFa: 'سوال ۱: مشخصات و شماره مرجع NASS',
      totalQuestions: 3,
      section: 'بخش ۱: اطلاعات متقاضی و مرجع NASS / Section 1: Main Applicant & NASS Ref',
      questionEn: 'Section 1: Full Name, 9-digit NASS Reference Number, and Date of Birth',
      simpleEnglish: 'Your full name, NASS reference on ASPEN card, and date of birth.',
      farsiTranslation: 'سوال ۱: نام کامل، شماره مرجع ۹ رقمی حمایت پناهندگی (NASS Ref) و تاریخ تولد شما چیست؟',
      dariTranslation: 'سوال ۱: نام کامل، نمبر مرجع ناس هوم آفیس و تاریخ تولد شما چیست؟',
      explanationFa: 'اطلاعات اصلی پرونده حمایت پناهندگی سکشن ۹۵ (نوشته شده روی کارت ASPEN یا برگه درخواست پناهندگی).',
      whatTypeInfoNeeded: 'Full Name, NASS Reference Number & Date of Birth',
      exampleFormat: 'e.g. Reza Hosseini | NASS Ref: 19/04/12345 | DOB: 10/05/1991',
      fieldKey: 's95_name_nass',
      required: true,
    },
    {
      id: 's95_q2',
      number: 2,
      questionCode: 'Q2',
      shortLabelFa: 'سوال ۲: نوع تغییر شرایط گزارش شده',
      totalQuestions: 3,
      section: 'بخش ۲: نوع تغییر شرایط زندگی / Section 2: Type of Change in Circumstances',
      questionEn: 'Section 2: What change are you reporting (Newborn, Address Move, ASPEN Card, Medical Condition)?',
      simpleEnglish: 'Tick change category and state move date or event details.',
      farsiTranslation: 'سوال ۲: چه نوع تغییر در شرایط زندگی خود (تولد نوزاد، تغییر آدرس، کارت پولی ASPEN، شرایط پزشکی) را گزارش می‌دهید؟',
      dariTranslation: 'سوال ۲: کدام تغییر در زندگی خود را می‌خواهید به هوم آفیس خبر دهید؟',
      explanationFa: 'موضوع تغییر را علامت بزنید و تاریخ دقیق وقوع تغییر یا جابه‌جایی را قید فرمایید.',
      whatTypeInfoNeeded: 'Change Category (Checkboxes) & Date of Change',
      exampleFormat: 'Tick on Form: [X] Newborn Child / [X] Address Move | Date: 01/08/2026',
      fieldKey: 'type_of_change',
      required: true,
      isCheckbox: true,
      options: [
        { value: 'Newborn', labelEn: 'Newborn child born in family (تولد فرزند جدید)', labelFa: 'تولد نوزاد جدید در خانواده پناهجو' },
        { value: 'AddressChange', labelEn: 'Change of address / accommodation move (تغییر آدرس)', labelFa: 'جابجایی و تغییر آدرس محل سکونت' },
        { value: 'BankASPEN', labelEn: 'ASPEN card issue or replacement (مشکل کارت اسپین)', labelFa: 'تغییر یا ارسال کارت پرداخت ASPEN' },
        { value: 'MedicalNeeds', labelEn: 'Pregnancy or medical condition (بارداری یا پزشکی)', labelFa: 'شرایط خاص بارداری یا نیاز مبرم پزشکی' },
      ],
    },
    {
      id: 's95_q3',
      number: 3,
      questionCode: 'Q3',
      shortLabelFa: 'سوال ۳: آدرس جدید، مدارک و اعلامیه',
      totalQuestions: 3,
      section: 'بخش ۳: آدرس جدید، مدارک و اعلامیه / Section 3: New Address, Proofs & Declaration',
      questionEn: 'Section 3: New UK Address & Postcode, Attached evidence, Phone Number, and Declaration signature',
      simpleEnglish: 'New accommodation address, proofs attached, active mobile, and declaration.',
      farsiTranslation: 'سوال ۳: آدرس کامل جدید با کدپستی، مدارک ضمیمه شده، شماره موبایل و امضای تاییدیه؟',
      dariTranslation: 'سوال ۳: آدرس جدید، اسناد ضمیمه شده و شماره تماس شما چیست؟',
      explanationFa: 'آدرس کامل اقامتگاه جدید همراه با کدپستی، لیست مدارک اثباتی (مانند گواهی تولد نوزاد یا برگه هتل) و شماره تماس مسئول پرونده.',
      whatTypeInfoNeeded: 'New Accommodation Address, Attached Documents & Phone Number',
      exampleFormat: 'e.g. 45 Station Road, Leeds LS2 8DP | MATB1 Attached | Phone: 07890 123456',
      fieldKey: 's95_address',
      required: true,
    },
  ],

  gp_registration: [
    {
      id: 'gp_q1',
      number: 1,
      questionCode: 'Q1',
      shortLabelFa: 'سوال ۱: مشخصات فردی بیمار و شماره NHS',
      totalQuestions: 3,
      section: 'بخش ۱: اطلاعات هویت بیمار / Section 1: Patient Identity & NHS No.',
      questionEn: 'Section 1: Full Name, Date of Birth, Gender, Town/Country of Birth, and NHS Number (if known)',
      simpleEnglish: 'Title, name, birth date, country of birth, and 10-digit NHS number if previously registered.',
      farsiTranslation: 'سوال ۱: نام و نام خانوادگی کامل، تاریخ تولد، جنسیت، کشور محل تولد و شماره ۱۰ رقمی NHS شما چیست؟',
      dariTranslation: 'سوال ۱: نام کامل، تاریخ تولد، کشور تولد و نمبر ان‌اچ‌اس شما چیست؟',
      explanationFa: 'اطلاعات هویت بیمار برای تشکیل پرونده رسمی در مطب پزشک عمومی (GP Registration).',
      whatTypeInfoNeeded: 'Title, Full Name, DOB, Country of Birth & NHS Number',
      exampleFormat: 'e.g. Mr. Sasan SHEKARESTAN | DOB: 20/05/1992 | Birthplace: Iran',
      fieldKey: 'gp_full_name',
      required: true,
    },
    {
      id: 'gp_q2',
      number: 2,
      questionCode: 'Q2',
      shortLabelFa: 'سوال ۲: آدرس سکونت و سابقه مطب قبلی',
      totalQuestions: 3,
      section: 'بخش ۲: آدرس سکونت و مطب قبلی / Section 2: Address & Previous GP',
      questionEn: 'Section 2: Current UK Accommodation Address, Postcode, and Previous UK GP Practice (or First UK Entry date)',
      simpleEnglish: 'Full house/hotel address with postcode and name of previous UK doctor surgery.',
      farsiTranslation: 'سوال ۲: آدرس دقیق اقامتگاه در محدوده درمانگاه، کدپستی و نام مطب قبلی (یا تاریخ ورود به بریتانیا)؟',
      dariTranslation: 'سوال ۲: آدرس کامل، کودپستی و نام مطب قبلی شما چیست؟',
      explanationFa: 'آدرس کامل خانه یا هتل جهت قرارگیری در محدوده پوشش درمانگاه (Catchment Area) و اطلاعات سابقه پزشکی قبلی.',
      whatTypeInfoNeeded: 'UK Accommodation Address, Postcode & Previous GP Surgery Name',
      exampleFormat: 'e.g. 102 Park Avenue, Leeds LS3 1AA | Prev GP: Leeds Medical Practice',
      fieldKey: 'gp_current_address',
      required: true,
    },
    {
      id: 'gp_q3',
      number: 3,
      questionCode: 'Q3',
      shortLabelFa: 'سوال ۳: تماس اضطراری، سابقه پزشکی و امضا',
      totalQuestions: 3,
      section: 'بخش ۳: تماس اضطراری، وضعیت پزشکی و امضا / Section 3: Next of Kin, Medical & Signature',
      questionEn: 'Section 3: Emergency Contact (Next of Kin), Long-term conditions/Donor choice, Phone, and Signature',
      simpleEnglish: 'Emergency contact name and phone, donor options, active mobile, and signature.',
      farsiTranslation: 'سوال ۳: مشخصات فرد همراه برای تماس اضطراری، بیماری‌های خاص، اهدای عضو، شماره تلفن و امضا؟',
      dariTranslation: 'سوال ۳: شماره تماس اضطراری، سابقه بیماری و امضا چیست؟',
      explanationFa: 'نام و شماره تماس فرد همراه (Next of Kin)، انتخاب‌های مربوط به اهدا عضو و ثبت امضای نهایی بیمار.',
      whatTypeInfoNeeded: 'Emergency Contact Name/Phone, Medical Options & Patient Signature',
      exampleFormat: 'e.g. Maryam Karimi (Wife) - 07123456789 | Organ Donor: Yes | Signed',
      fieldKey: 'gp_next_of_kin',
      required: true,
      isCheckbox: true,
      options: [
        { value: 'OrganDonationYes', labelEn: 'NHS Organ Donor Registration (موافقت با اهدا عضو)', labelFa: 'موافق با ثبت‌نام در سامانه اهدا عضو ان‌اچ‌اس' },
        { value: 'BloodDonation', labelEn: 'NHS Blood Donor Register (اهدای خون)', labelFa: 'ثبت‌نام جهت اهدای داوطلبانه خون' },
        { value: 'DailyMeds', labelEn: 'Taking regular daily prescriptions (مصرف داروی روزانه)', labelFa: 'دارای بیماری خاص یا مصرف داروی روزانه' },
      ],
    },
  ],

  council_housing: [
    {
      id: 'ch_q1',
      number: 1,
      questionCode: 'Q1',
      shortLabelFa: 'سوال ۱: مشخصات متقاضی و وضعیت اقامت',
      totalQuestions: 3,
      section: 'بخش ۱: اطلاعات متقاضی و اقامت / Section 1: Applicant & Immigration Status',
      questionEn: 'Section 1: Applicant Full Name, DOB, HO Reference / NI Number, and Current Accommodation Address',
      simpleEnglish: 'Full legal name, birth date, asylum HO reference or NINO, and current address.',
      farsiTranslation: 'سوال ۱: نام کامل، تاریخ تولد، شماره پرونده هوم آفیس/اینشورنس و آدرس سکونت فعلی شما چیست؟',
      dariTranslation: 'سوال ۱: نام کامل، تاریخ تولد، نمبر پرونده و آدرس فعلی شما چیست؟',
      explanationFa: 'اطلاعات هویت متقاضی اصلی پرونده مسکن شهرداری (Council Housing) و وضعیت اقامت قانونی در بریتانیا.',
      whatTypeInfoNeeded: 'Full Name, DOB, HO Reference/NINO & Address',
      exampleFormat: 'e.g. Sasan Shekarestan | HO Ref: 01234567 | Address: Manchester Hotel',
      fieldKey: 'ch_full_name',
      required: true,
    },
    {
      id: 'ch_q2',
      number: 2,
      questionCode: 'Q2',
      shortLabelFa: 'سوال ۲: علت نیاز به مسکن و شرایط پزشکی',
      totalQuestions: 3,
      section: 'بخش ۲: علت نیاز به مسکن و پزشکی / Section 2: Housing Emergency & Medical Need',
      questionEn: 'Section 2: Reason for housing application (Eviction notice, Overcrowded, Medical grounds) and Local Connection',
      simpleEnglish: 'Tick reason for housing emergency (28-day notice/overcrowded) and explain medical needs.',
      farsiTranslation: 'سوال ۲: علت اصلی نیاز فوری به مسکن (تخلیه هتل پناهندگی، شلوغی بیش از حد، شرایط پزشکی) چیست؟',
      dariTranslation: 'سوال ۲: دلیل اصلی نیاز فوری به خانه چیست؟',
      explanationFa: 'گزینه‌های مربوط به دلیل بحران مسکن (مانند اخطاریه ۲۸ روزه تخلیه هتل یا شلوغی مسکن) را علامت بزنید.',
      whatTypeInfoNeeded: 'Housing Emergency Reason (Checkboxes) & Medical Grounds',
      exampleFormat: 'Tick on Form: [X] NASS 28-day Eviction Notice | Medical: Knee Disability',
      fieldKey: 'ch_housing_crisis',
      required: true,
      isCheckbox: true,
      options: [
        { value: 'Eviction28', labelEn: 'NASS 28-day Hotel Eviction Notice (تخلیه هتل)', labelFa: 'دریافت برگه ۲۸ روزه تخلیه هتل پناهندگی' },
        { value: 'Overcrowded', labelEn: 'Severe Overcrowding (کمبود شدید اتاق)', labelFa: 'شلوغی شدید و عدم تناسب اتاق‌ها با افراد خانواده' },
        { value: 'MedicalDisability', labelEn: 'Urgent Medical or Disability Grounds (پزشکی/معلولیت)', labelFa: 'شرایط حاد پزشکی یا معلولیت نیازمند مسکن مناسب' },
      ],
    },
    {
      id: 'ch_q3',
      number: 3,
      questionCode: 'Q3',
      shortLabelFa: 'سوال ۳: اعضای خانوار، درآمد و تایید نهایی',
      totalQuestions: 3,
      section: 'بخش ۳: اعضای خانواده، درآمد و اعلامیه / Section 3: Household, Income & Declaration',
      questionEn: 'Section 3: Total household members details, Benefits/Income summary, Phone/Email, and Declaration',
      simpleEnglish: 'Number of household members, benefit details, active UK phone, and final declaration.',
      farsiTranslation: 'سوال ۳: تعداد کل اعضای خانواده، خلاصه درآمد/مزایای دریافتی، شماره تماس و امضای تاییدیه نهایی؟',
      dariTranslation: 'سوال ۳: تعداد اعضای فامیل، خلاصه معاش و تاییدیه نهایی چیست؟',
      explanationFa: 'لیست مشخصات تمام اعضای خانواده (همسر و فرزندان)، خلاصه حقوق یا مزایا و تایید نهایی صحت مدارک ارائه شده.',
      whatTypeInfoNeeded: 'Household Members Summary, Benefit Status & Phone Number',
      exampleFormat: 'e.g. 2 Adults, 2 Children | Universal Credit | Phone: 07700 900888',
      fieldKey: 'ch_household_summary',
      required: true,
    },
  ],
};

export const FormCompanion: React.FC<FormCompanionProps> = ({
  userLanguage,
  onGoBackToHome,
  onPlayAudio,
  onOpenUploadModal,
  onClearCustomForm,
  initialFormId,
  customUploadedForm,
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(initialFormId || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<Record<string, string[]>>({});
  const [inputText, setInputText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingFieldKey, setProcessingFieldKey] = useState<string | null>(null);
  const [aiCallError, setAiCallError] = useState<{
    fieldKey: string;
    failedText: string;
    messageFa: string;
  } | null>(null);
  const [pendingExtraction, setPendingExtraction] = useState<{
    extractedAnswer: string;
    summaryFa: string;
    confidence: 'high' | 'medium' | 'low';
    needsConfirmation: boolean;
    warningFa?: string;
  } | null>(null);

  // Narrow screen mode: 'document' (default) or 'questions'
  const [narrowScreenTab, setNarrowScreenTab] = useState<'document' | 'questions'>('document');

  // Document canvas zoom & page switcher state
  const [documentPageIndex, setDocumentPageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isScreenshotMode, setIsScreenshotMode] = useState<boolean>(false);
  const [isEditingOCR, setIsEditingOCR] = useState<boolean>(false);
  const [editedOCRText, setEditedOCRText] = useState<string>('');

  // AI Chat Sidepanel state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);
  const [isMobileChatMinimized, setIsMobileChatMinimized] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Modals & review state
  const [showReviewMode, setShowReviewMode] = useState<boolean>(false);
  const [showDontUnderstand, setShowDontUnderstand] = useState<boolean>(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [consistencyWarnings, setConsistencyWarnings] = useState<FormConsistencyWarning[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreMenu]);

  // Sync initial form if passed or custom form uploaded
  useEffect(() => {
    if (customUploadedForm) {
      setSelectedFormId('custom_uploaded');
      setNarrowScreenTab('document');
      setCurrentQuestionIndex(0);
      setDocumentPageIndex(0);
      setShowReviewMode(false);
      setInputText('');
      setPendingExtraction(null);
    } else if (initialFormId) {
      handleSelectForm(initialFormId);
    }
  }, [initialFormId, customUploadedForm]);

  // Load saved answers from localStorage when form changes
  useEffect(() => {
    if (selectedFormId) {
      try {
        const savedAns = localStorage.getItem(`form_answers_${selectedFormId}`);
        if (savedAns) {
          setAnswers(JSON.parse(savedAns));
        } else {
          setAnswers({});
        }

        const savedCb = localStorage.getItem(`form_checkboxes_${selectedFormId}`);
        if (savedCb) {
          setSelectedCheckboxValues(JSON.parse(savedCb));
        } else {
          setSelectedCheckboxValues({});
        }
      } catch (_) {}
    }
  }, [selectedFormId]);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (selectedFormId && Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(`form_answers_${selectedFormId}`, JSON.stringify(answers));
      } catch (_) {}
    }
  }, [answers, selectedFormId]);

  // Save checkbox selections to localStorage
  useEffect(() => {
    if (selectedFormId && Object.keys(selectedCheckboxValues).length > 0) {
      try {
        localStorage.setItem(`form_checkboxes_${selectedFormId}`, JSON.stringify(selectedCheckboxValues));
      } catch (_) {}
    }
  }, [selectedCheckboxValues, selectedFormId]);

  const officialFormsList: OfficialForm[] = OFFICIAL_FORMS;

  const selectedFormObj: OfficialForm | undefined = (selectedFormId === 'custom_uploaded' && customUploadedForm)
    ? {
        id: 'custom_uploaded',
        code: 'CUSTOM',
        titleEn: customUploadedForm.title,
        titleFa: customUploadedForm.titleFa,
        titleDari: customUploadedForm.titleFa,
        issuer: 'User Upload',
        category: 'custom',
        purposeFa: customUploadedForm.description,
        purposeEn: customUploadedForm.description,
        pdfPath: '',
        officialSourceUrl: '',
        pageCount: customUploadedForm.uploadedPages?.length || 1,
        questions: customUploadedForm.questions,
      }
    : officialFormsList.find((f) => f.id === selectedFormId);

  // Questions array
  const rawQuestions: FormQuestion[] = (selectedFormId === 'custom_uploaded' && customUploadedForm)
    ? customUploadedForm.questions
    : (selectedFormObj
        ? selectedFormObj.questions
        : officialFormsList[0].questions);

  // Ensure 1-to-1 sequential question numbering and codes relative to question numbers
  const questions: FormQuestion[] = rawQuestions.map((q, idx) => ({
    ...q,
    number: idx + 1,
    questionCode: `Q${idx + 1}`,
  }));

  const currentQ = questions[currentQuestionIndex] || questions[0];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatProcessing]);

  // Initialize Chat Messages when form selection changes
  useEffect(() => {
    if (selectedFormObj && currentQ) {
      setChatMessages([]);
    }
  }, [selectedFormId]);

  // Document Pages (either custom uploaded photos or rendered sample document pages)
  const sampleDoc = selectedFormId && SAMPLE_FORM_DOCUMENTS[selectedFormId] ? SAMPLE_FORM_DOCUMENTS[selectedFormId] : null;
  const isCustomFormActive = selectedFormId === 'custom_uploaded' && !!customUploadedForm;
  const customPages = isCustomFormActive ? customUploadedForm?.uploadedPages : undefined;

  // Reset/sync input text whenever question or form changes
  useEffect(() => {
    if (currentQ) {
      const existing = answers[currentQ.fieldKey];
      setInputText(existing?.userRawInput || existing?.extractedAnswer || '');
      setPendingExtraction(null);
      setIsEditingOCR(false);
      setEditedOCRText(currentQ.questionEn);
      setShowDontUnderstand(false);
    }
  }, [currentQuestionIndex, selectedFormId, currentQ?.fieldKey]);

  const saveCurrentInputIfNeeded = () => {
    if (currentQ && inputText.trim()) {
      const existing = answers[currentQ.fieldKey];
      if (!existing || existing.userRawInput !== inputText.trim()) {
        const finalAnswer = pendingExtraction?.extractedAnswer || inputText.trim();
        const newAnswer: FormAnswer = {
          fieldKey: currentQ.fieldKey,
          questionNumber: currentQ.number,
          questionEn: editedOCRText || currentQ.questionEn,
          userRawInput: inputText.trim(),
          extractedAnswer: finalAnswer,
          languageUsed: userLanguage,
          confidence: pendingExtraction?.confidence || 'high',
          needsConfirmation: false,
          confirmed: true,
          timestamp: Date.now(),
        };
        setAnswers((prev) => ({ ...prev, [currentQ.fieldKey]: newAnswer }));
      }
    }
  };

  const handleNextQuestion = () => {
    saveCurrentInputIfNeeded();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      runConsistencyCheck();
      setShowReviewMode(true);
    }
  };

  const handlePrevQuestion = () => {
    saveCurrentInputIfNeeded();
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleSelectForm = (formId: string) => {
    setSelectedFormId(formId);
    setNarrowScreenTab('document');
    setDocumentPageIndex(0);
    setShowReviewMode(false);
    setInputText('');
    setPendingExtraction(null);
    setIsEditingOCR(false);
    setAiCallError(null);
    setChatMessages([]);
    setConsistencyWarnings([]);

    if (formId !== 'custom_uploaded') {
      onClearCustomForm?.();
    }

    // Retrieve saved answers to check count and jump directly to the first unanswered question
    const targetForm = (formId === 'custom_uploaded' && customUploadedForm)
      ? customUploadedForm
      : OFFICIAL_FORMS.find((f) => f.id === formId);

    let savedAnsCount = 0;
    if (targetForm && targetForm.questions && targetForm.questions.length > 0) {
      let savedAns: Record<string, FormAnswer> = {};
      try {
        const raw = localStorage.getItem(`form_answers_${formId}`);
        if (raw) savedAns = JSON.parse(raw);
      } catch (_) {}

      const validAnswers = Object.values(savedAns).filter(
        (a) => a && typeof a.extractedAnswer === 'string' && a.extractedAnswer.trim().length > 0
      );
      savedAnsCount = validAnswers.length;

      const firstUnansweredIndex = targetForm.questions.findIndex((q) => {
        const a = savedAns[q.fieldKey];
        return !a || !a.extractedAnswer || a.extractedAnswer.trim().length === 0;
      });

      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      } else {
        // If all questions are answered, start at the first question
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex(0);
    }

    // Show restored banner if saved answers existed
    setShowRestoredBanner(savedAnsCount > 0);
  };

  const handleClearFormAnswers = () => {
    if (!selectedFormId) return;
    try {
      localStorage.removeItem(`form_answers_${selectedFormId}`);
      localStorage.removeItem(`form_checkboxes_${selectedFormId}`);
    } catch (_) {}
    setAnswers({});
    setSelectedCheckboxValues({});
    setInputText('');
    setPendingExtraction(null);
    setCurrentQuestionIndex(0);
    setShowRestoredBanner(false);
    setShowResetConfirmModal(false);
  };

  const handleToggleCheckboxOption = (
    fieldKey: string,
    optionValue: string,
    optionLabelEn: string,
    optionLabelFa: string
  ) => {
    const currentSelected = selectedCheckboxValues[fieldKey] || [];
    const exists = currentSelected.includes(optionValue);
    const updated = exists
      ? currentSelected.filter((v) => v !== optionValue)
      : [...currentSelected, optionValue];

    setSelectedCheckboxValues((prev) => ({ ...prev, [fieldKey]: updated }));

    const targetQ = questions.find((q) => q.fieldKey === fieldKey) || currentQ;
    const opts = targetQ.options || [];

    const selectedOptsEn = opts
      .filter((o) => updated.includes(o.value))
      .map((o) => o.labelEn);
    const selectedOptsFa = opts
      .filter((o) => updated.includes(o.value))
      .map((o) => o.labelFa);

    const formattedAnswerEn =
      selectedOptsEn.length > 0
        ? `Tick on Form: ${selectedOptsEn.map((l) => `[X] ${l}`).join(' / ')}`
        : 'None ticked';

    const formattedSummaryFa =
      selectedOptsFa.length > 0
        ? `گزینه‌های تیک خورده: ${selectedOptsFa.join(' ، ')}`
        : 'هیچ گزینه‌ای تیک نخورده است';

    const newAnswer: FormAnswer = {
      fieldKey,
      questionNumber: targetQ.number,
      questionEn: targetQ.questionEn,
      userRawInput: formattedSummaryFa,
      extractedAnswer: formattedAnswerEn,
      languageUsed: userLanguage,
      confidence: 'high',
      needsConfirmation: false,
      confirmed: true,
      timestamp: Date.now(),
    };

    setAnswers((prev) => ({ ...prev, [fieldKey]: newAnswer }));

    // Send AI confirmation message in chat
    const confirmMsg: ChatMessage = {
      id: 'msg_checkbox_' + Date.now(),
      sender: 'ai',
      textFa: `☑️ ${formattedSummaryFa}\n\nمتن دقیق جهت علامت زدن (Tick) روی فرم کاغذی در برگه پاسخ ثبت شد:\n\`${formattedAnswerEn}\``,
      timestamp: Date.now(),
      fieldKey,
      suggestedAnswer: formattedAnswerEn,
      quickSuggestions: ['خانه بعدی ➔', 'تغییر گزینه‌ها'],
    };

    setChatMessages((prev) => [...prev, confirmMsg]);
  };

  const processUserAnswer = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessing(true);
    setProcessingFieldKey(currentQ.fieldKey);
    setAiCallError(null);

    // Auto-detect Shamsi date input (e.g. 1373/05/24 or ۲۴ مرداد ۱۳۷۳)
    const shamsiConversion = detectAndConvertShamsi(textToProcess);
    if (shamsiConversion && (currentQ.fieldKey === 'dob' || currentQ.questionEn.toLowerCase().includes('birth') || currentQ.questionEn.toLowerCase().includes('date'))) {
      setIsProcessing(false);
      setProcessingFieldKey(null);
      const newAnswer: FormAnswer = {
        fieldKey: currentQ.fieldKey,
        questionNumber: currentQ.number,
        questionEn: editedOCRText || currentQ.questionEn,
        userRawInput: textToProcess,
        extractedAnswer: shamsiConversion.gregorianFormatted,
        languageUsed: userLanguage,
        confidence: 'high',
        needsConfirmation: false,
        confirmed: true,
        timestamp: Date.now(),
      };
      setAnswers((prev) => ({ ...prev, [currentQ.fieldKey]: newAnswer }));
      setPendingExtraction({
        extractedAnswer: shamsiConversion.gregorianFormatted,
        summaryFa: `تاریخ شمسی شما (${shamsiConversion.shamsiStr}) به تاریخ میلادی بریتانیا (${shamsiConversion.gregorianFormatted} - ${shamsiConversion.gregorianTextFa}) تبدیل شد.`,
        confidence: 'high',
        needsConfirmation: false,
        warningFa: `در تمام فرم‌های رسمی بریتانیا (اداره مهاجرت و NHS) تاریخ تولد به میلادی ثبت می‌شود.`,
      });
      return;
    }

    try {
      const res = await fetch('/api/form/parse-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionEn: editedOCRText || currentQ.questionEn,
          userSpeechOrText: textToProcess,
          userLanguage,
          fieldKey: currentQ.fieldKey,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const extracted = data.extractedAnswer || textToProcess;
        const newAnswer: FormAnswer = {
          fieldKey: currentQ.fieldKey,
          questionNumber: currentQ.number,
          questionEn: editedOCRText || currentQ.questionEn,
          userRawInput: textToProcess,
          extractedAnswer: extracted,
          languageUsed: userLanguage,
          confidence: data.confidence || 'high',
          needsConfirmation: false,
          confirmed: true,
          timestamp: Date.now(),
        };
        setAnswers((prev) => ({ ...prev, [currentQ.fieldKey]: newAnswer }));
        setPendingExtraction({
          extractedAnswer: extracted,
          summaryFa: data.summaryFa || `پاسخ شما: ${textToProcess}`,
          confidence: data.confidence || 'high',
          needsConfirmation: false,
          warningFa: data.warningFa,
        });
        setAiCallError(null);
      } else {
        // AI call failed - preserve user input and offer retry chip
        setAiCallError({
          fieldKey: currentQ.fieldKey,
          failedText: textToProcess,
          messageFa: userLanguage === 'dari'
            ? 'ارتباط با هوش مصنوعی برقرار نشد. متن تایپ‌شده شما محفوظ است.'
            : 'ارتباط با هوش مصنوعی برقرار نشد. متن تایپ‌شده شما حفظ شده است.',
        });
      }
    } catch (e) {
      // Network/parse failure - preserve user input and offer retry chip
      setAiCallError({
        fieldKey: currentQ.fieldKey,
        failedText: textToProcess,
        messageFa: userLanguage === 'dari'
          ? 'خطا در برقراری ارتباط. متن شما پاک نشد.'
          : 'خطا در ارتباط با هوش مصنوعی. متن تایپ‌شده شما محفوظ ماند.',
      });
    } finally {
      setIsProcessing(false);
      setProcessingFieldKey(null);
    }
  };

  const confirmPendingAnswer = () => {
    if (!pendingExtraction) return;
    const newAnswer: FormAnswer = {
      fieldKey: currentQ.fieldKey,
      questionNumber: currentQ.number,
      questionEn: editedOCRText || currentQ.questionEn,
      userRawInput: inputText,
      extractedAnswer: pendingExtraction.extractedAnswer,
      languageUsed: userLanguage,
      confidence: pendingExtraction.confidence,
      needsConfirmation: false,
      confirmed: true,
      timestamp: Date.now(),
    };

    setAnswers((prev) => ({ ...prev, [currentQ.fieldKey]: newAnswer }));
    setPendingExtraction(null);

    // Advance to next question if not at end
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      runConsistencyCheck();
      setShowReviewMode(true);
    }
  };

  const runConsistencyCheck = async () => {
    try {
      const answersList = Object.values(answers).map((a: FormAnswer) => ({
        fieldKey: a.fieldKey,
        answer: a.extractedAnswer,
      }));
      const res = await fetch('/api/form/consistency-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formAnswers: answersList }),
      });

      if (res.ok) {
        const data = await res.json();
        setConsistencyWarnings(data.warnings || []);
      }
    } catch (e) {
      console.warn('Consistency check silent fail:', e);
    }
  };

  const handleSendChatMessage = async (inputMsg?: string) => {
    const text = (inputMsg || chatInput).trim();
    if (!text || isChatProcessing) return;

    const userMsgId = 'msg_user_' + Date.now();
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      textFa: text,
      timestamp: Date.now(),
      fieldKey: currentQ?.fieldKey,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsChatProcessing(true);

    // Auto-detect Shamsi date input
    const shamsiConversion = detectAndConvertShamsi(text);
    if (shamsiConversion && currentQ && (currentQ.fieldKey === 'dob' || currentQ.questionEn.toLowerCase().includes('birth') || currentQ.questionEn.toLowerCase().includes('date'))) {
      const aiResponseMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        textFa: `تاریخ شمسی شما (${shamsiConversion.shamsiStr}) به تاریخ میلادی بریتانیا تبدیل شد:\n\n📅 **${shamsiConversion.gregorianFormatted}** (${shamsiConversion.gregorianTextFa})\n\nدر تمام فرم‌های رسمی بریتانیا (اداره مهاجرت و NHS) تاریخ تولد به میلادی ثبت می‌شود.`,
        timestamp: Date.now(),
        fieldKey: currentQ.fieldKey,
        suggestedAnswer: shamsiConversion.gregorianFormatted,
        quickSuggestions: ['ثبت این تاریخ در برگه پاسخ', 'خانه بعدی'],
      };
      setChatMessages((prev) => [...prev, aiResponseMsg]);
      setIsChatProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/form/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          formTitle: selectedFormObj?.titleEn || 'UK Form Document',
          questions: questions,
          activeFieldKey: currentQ?.fieldKey,
          currentAnswers: answers,
          userLanguage: userLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiResponseMsg: ChatMessage = {
          id: 'msg_ai_' + Date.now(),
          sender: 'ai',
          textFa: data.replyFa || 'متشکرم. توضیحات ثبت گردید.',
          timestamp: Date.now(),
          fieldKey: data.fieldKey || currentQ?.fieldKey,
          suggestedAnswer: data.suggestedAnswer,
          quickSuggestions: data.quickSuggestions || ['توضیح خانه بعدی', 'مشاهده برگه پاسخ دست‌نویس'],
        };
        setChatMessages((prev) => [...prev, aiResponseMsg]);

        if (data.suggestedAnswer && currentQ) {
          setInputText(data.suggestedAnswer);
        }
      } else {
        throw new Error('Chat API failed');
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        textFa: `در رابطه با "${text}":\nسوال این خانه: "${currentQ?.farsiTranslation}".\nتوضیح: ${currentQ?.explanationFa}\n\nپاسخ شما آمادگی ثبت دارد.`,
        timestamp: Date.now(),
        fieldKey: currentQ?.fieldKey,
        suggestedAnswer: text,
        quickSuggestions: ['ثبت این پاسخ', 'سوال بعدی'],
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatProcessing(false);
    }
  };

  const handleApplySuggestedAnswer = (fieldKey: string, answerText: string) => {
    const targetQ = questions.find((q) => q.fieldKey === fieldKey) || currentQ;
    if (!targetQ) return;

    const newAnswer: FormAnswer = {
      fieldKey: targetQ.fieldKey,
      questionNumber: targetQ.number,
      questionEn: targetQ.questionEn,
      userRawInput: answerText,
      extractedAnswer: answerText,
      languageUsed: userLanguage,
      confidence: 'high',
      needsConfirmation: false,
      confirmed: true,
      timestamp: Date.now(),
    };

    setAnswers((prev) => ({ ...prev, [targetQ.fieldKey]: newAnswer }));

    setChatMessages((prev) => [
      ...prev,
      {
        id: 'confirm_' + Date.now(),
        sender: 'ai',
        textFa: `🟢 پاسخ "${answerText}" برای خانه ${targetQ.number} (${targetQ.farsiTranslation}) در برگه دست‌نویس ثبت شد.`,
        timestamp: Date.now(),
        fieldKey: targetQ.fieldKey,
      },
    ]);
  };


  const handleSelectFieldFromCanvas = (qIndex: number) => {
    setCurrentQuestionIndex(qIndex);
    const q = questions[qIndex];
    if (q) {
      if (sampleDoc) {
        const pageIdx = sampleDoc.pages.findIndex((page) =>
          page.sections.some((sec) => sec.fields.some((f) => f.fieldKey === q.fieldKey))
        );
        if (pageIdx !== -1) {
          setDocumentPageIndex(pageIdx);
        }
      }
      setIsMobileChatMinimized(false);

      // Clear previous inputs and stored answers for this field before presenting new AI context
      setInputText('');
      setPendingExtraction(null);
      setChatInput('');
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[q.fieldKey];
        return next;
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: 'canvas_select_' + Date.now(),
          sender: 'ai',
          textFa: `📌 **سوال ${q.questionCode || 'Q' + q.number}: ${q.shortLabelFa || q.farsiTranslation}**\n\n` +
            `**منظور این سوال:** ${q.farsiTranslation}\n\n` +
            `💡 **توضیح کامل:** ${q.explanationFa}\n\n` +
            `اگر درباره این بخش سوالی دارید یا معنی واژه‌ای را می‌خواهید، بپرسید!`,
          timestamp: Date.now(),
          fieldKey: q.fieldKey,
          quickSuggestions: [
            'معنی واژگان انگلیسی این بخش',
            'چگونه درباره شرایط خودم توضیح دهم؟',
            'از چه مدرکی برای این قسمت استفاده کنم؟',
          ],
        },
      ]);
    }
  };

  const speechRecognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isRecording) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (_) {}
      }
      setIsRecording(false);
      return;
    }

    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = userLanguage === 'en' ? 'en-GB' : 'fa-IR';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript;
          }
        }
        const fullTranscript = (finalStr + interimStr).trim();
        if (fullTranscript) {
          setInputText(fullTranscript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // VIEW 1: FORM SELECTION SCREEN
  if (!selectedFormId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 font-farsi dir-rtl">
        {/* Header Banner - Compact 1-line title + 1-line purpose */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
            فرم مورد نظر خود را انتخاب کنید
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            سند اصلی را ببینید و سوالات را گام‌به‌گام به زبان ساده پاسخ دهید.
          </p>
        </div>

        {/* 1. BUILT-IN FORM LIBRARY (FIRST THING ON SCREEN) */}
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005EB8]" />
                <span>کتابخانه فرم‌های رسمی (انتخاب فوری)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                روی یکی از فرم‌های زیر کلیک کنید تا سند اصلی و راهنمای فارسی باز شود:
              </p>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 font-mono">
              {OFFICIAL_FORMS.length} Forms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_FORMS.map((form) => {
              const displayTitle = userLanguage === 'dari' ? (form.titleDari || form.titleFa) : form.titleFa;

              // Read saved answers to calculate in-progress stats
              let savedAnsCount = 0;
              try {
                const raw = typeof window !== 'undefined' ? localStorage.getItem(`form_answers_${form.id}`) : null;
                if (raw) {
                  const parsed = JSON.parse(raw);
                  savedAnsCount = Object.values(parsed).filter(
                    (a: any) => a && typeof a.extractedAnswer === 'string' && a.extractedAnswer.trim().length > 0
                  ).length;
                }
              } catch (_) {}

              const totalQuestionsCount = form.questions.length;
              const hasSavedAnswers = savedAnsCount > 0;
              const isFullyCompleted = savedAnsCount >= totalQuestionsCount && totalQuestionsCount > 0;

              return (
                <div
                  key={form.id}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-[#005EB8] transition flex flex-col justify-between space-y-4 shadow-xs group"
                >
                  <div className="space-y-3">
                    {/* Form Code Badge, In-Progress Badge & Subtitle */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-xl shadow-2xs tracking-wider">
                          {form.code}
                        </span>
                        {hasSavedAnswers && (
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                            isFullyCompleted
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isFullyCompleted ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                            <span>
                              {isFullyCompleted
                                ? `تکمیل شده (${savedAnsCount} از ${totalQuestionsCount})`
                                : `در حال تکمیل (${savedAnsCount} از ${totalQuestionsCount} پاسخ داده شده)`}
                            </span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {form.issuer}
                      </span>
                    </div>

                    {/* Persian / Dari Title */}
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-slate-200 transition leading-snug">
                        {displayTitle}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 dir-ltr text-right">
                        {form.titleEn}
                      </p>
                    </div>

                    {/* Purpose in Plain Persian (ONE short line) */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      {form.purposeFa}
                    </p>
                  </div>

                  {/* One Large Button to Open / Continue It */}
                  <button
                    type="button"
                    onClick={() => handleSelectForm(form.id)}
                    className="w-full min-h-[48px] py-3 px-4 bg-[#005EB8] hover:bg-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>
                      {hasSavedAnswers ? 'ادامه دهید' : 'شروع فرم'}
                    </span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SECONDARY OPTION UNDERNEATH: UPLOAD BOX */}
        <div className="p-5 sm:p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xs space-y-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  فرم من در لیست نیست
                </h3>
                <p className="text-xs text-slate-400">
                  اگر فرم یا نامه اختصاصی دیگری دارید، عکس یا فایل آن را آپلود کنید.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenUploadModal) {
                  onOpenUploadModal();
                } else {
                  handleSelectForm('nhs_hc1');
                }
              }}
              className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-300" />
              <span>آپلود عکس یا فایل فرم اختصاصی 📷</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: HANDWRITING ANSWER SHEET (FINAL OUTPUT)
  if (showReviewMode) {
    const totalCount = questions.length;
    const answeredCount = Object.keys(answers).length;
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
      <div className={`max-w-5xl mx-auto space-y-6 font-farsi print-answer-sheet ${isScreenshotMode ? 'bg-white p-6 rounded-3xl shadow-xl' : ''}`}>
        {/* Top Action Banner (Screen only) */}
        {!isScreenshotMode ? (
          <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-800 space-y-4 dir-rtl text-right print:hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>برگه راهنمای دست‌نویس انگلیسی آماده گردید</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  برگه پاسخ دست‌نویس انگلیسی (Answer Sheet)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  این برگه را پرینت کنید یا از آن اسکرین‌شوت بگیرید و همراه خود به میز ببرید تا کلمات دقیق انگلیسی را مستقیماً روی برگه کاغذی رسمی بنویسید.
                </p>
              </div>

              {/* Primary Action (Print) & Secondary Actions */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[48px] px-5 py-2.5 bg-[#005EB8] hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer"
                  title="چاپ برگه تمیز برای دست‌نویس روی فرم کاغذی"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ برگه کاغذی A4 (Print)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScreenshotMode(true)}
                  className="min-h-[48px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>اسکرین‌شوت 📸</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowReviewMode(false)}
                  className="min-h-[48px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>بازگشت به فرم</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-slate-300" />
              <span className="font-bold text-sm">حالت اسکرین‌شوت فعال شد (متن‌ها درشت و واضح برای خواندن روی برگه)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-[#005EB8] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ A4</span>
              </button>
              <button
                type="button"
                onClick={() => setIsScreenshotMode(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold"
              >
                خروج از اسکرین‌شوت
              </button>
            </div>
          </div>
        )}

        {/* Consistency Warnings (Screen only) */}
        {consistencyWarnings.length > 0 && !isScreenshotMode && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 dir-rtl text-right print:hidden text-white">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-slate-400" />
              <span>⚠️ موارد نیازمند دقت در فرم شما</span>
            </div>
            <div className="space-y-2">
              {consistencyWarnings.map((w, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-1">
                  <p className="font-bold text-white">{w.issueFa || w.issueEn}</p>
                  <p className="text-slate-400 text-[11px]">{w.suggestionEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HANDWRITING ANSWER SHEET CARDS & PRINTABLE DOCUMENT */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-sm space-y-5 print:p-0 print:border-none print:shadow-none">
          {/* Printable Document Header (Optimized for A4 paper and desk presentation) */}
          <div className="pb-4 border-b-2 border-slate-900 print:border-b-2 print:border-black print-header-rule dir-rtl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 text-right">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-slate-900 text-white print:bg-black print:text-white text-[11px] font-mono font-bold">
                  <span>UK FORM HANDWRITING GUIDE • برگه رونویسی دست‌نویس</span>
                </div>
                <h1 className="font-black text-slate-900 text-lg sm:text-2xl pt-1">
                  {selectedFormObj?.titleFa || 'فرم رسمی بریتانیا'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 font-mono dir-ltr text-left font-bold">
                  {selectedFormObj?.titleEn} {selectedFormObj?.issuer ? `(${selectedFormObj.issuer})` : ''}
                </p>
              </div>

              <div className="text-left font-mono text-xs space-y-1 print:text-right">
                <span className="inline-block font-bold text-emerald-900 bg-emerald-100 print:bg-transparent px-3 py-1 rounded-lg border border-emerald-300 print:border-black">
                  {answeredCount} از {totalCount} خانه پاسخ داده شده
                </span>
                <p className="text-[11px] text-slate-600 font-mono">تاریخ چاپ: {formattedDate}</p>
              </div>
            </div>

            {/* Clear instruction on paper */}
            <div className="mt-3 p-2.5 bg-slate-100 print:bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-700 shrink-0 mt-0.5 print:hidden" />
              <p className="leading-relaxed">
                <strong className="text-slate-950">دستورالعمل: </strong>
                متن انگلیسی هر کادر زیر را به همان ترتیب در خانه یا صفحه مربوطه روی فرم کاغذی رسمی خود بنویسید (با حروف بزرگ انگلیسی / CAPITAL LETTERS در صورت لزوم).
              </p>
            </div>
          </div>

          {/* Question and Answer Grid */}
          <div className="space-y-4 print:space-y-3">
            {questions.map((q) => {
              const ans = answers[q.fieldKey];
              const boxLabel = q.questionCode
                ? `[بخش / سوال: ${q.questionCode} • ${q.shortLabelFa || q.fieldKey}]`
                : `[سوال Q${q.number} • ${q.fieldKey.toUpperCase()}]`;

              return (
                <div
                  key={q.id}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition print-avoid-break print:p-3 print:rounded-lg ${
                    ans
                      ? 'border-slate-300 bg-slate-50/50 print:border-slate-800 print:bg-white'
                      : 'border-rose-200 bg-rose-50/20 print:border-slate-400 print:bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 print:border-slate-300">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 bg-slate-900 text-slate-200 print:bg-slate-900 print:text-white rounded-md inline-block">
                          {boxLabel}
                        </span>
                        {q.section && (
                          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline print:inline">
                            {q.section}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base pt-1 dir-rtl text-right">
                        {q.farsiTranslation}
                      </h4>
                      <p className="text-xs text-slate-600 font-mono dir-ltr text-left">{q.questionEn}</p>
                    </div>

                    {ans && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(ans.extractedAnswer, q.fieldKey)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1 shrink-0 print:hidden cursor-pointer"
                      >
                        {copiedKey === q.fieldKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی متن</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="pt-2.5">
                    {ans ? (
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-500 font-mono dir-ltr text-left">
                          Exact text to write on the paper form:
                        </div>
                        <div className="p-3.5 bg-slate-900 rounded-xl border-2 border-amber-500/70 print:border-2 print:border-black font-mono text-base sm:text-lg font-black text-amber-300 print:text-black tracking-wide select-all text-left dir-ltr print-box-bordered">
                          {ans.extractedAnswer}
                        </div>
                        <p className="text-[11px] text-slate-600 font-farsi dir-rtl text-right pt-0.5">
                          معنای فارسی: {ans.userRawInput || ans.extractedAnswer}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-rose-50 print:bg-slate-50 rounded-xl border border-rose-200 print:border-dashed print:border-slate-400 text-xs font-bold text-rose-700 print:text-slate-600 font-farsi dir-rtl text-right flex items-center justify-between">
                        <span>🔴 این خانه روی فرم کاغذی هنوز پاسخ داده نشده است</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentQuestionIndex(q.number - 1);
                            setShowReviewMode(false);
                          }}
                          className="text-xs text-slate-700 underline print:hidden cursor-pointer hover:text-black"
                        >
                          پاسخ دادن به این خانه
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar (Screen only) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xs print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[48px] px-5 py-2.5 bg-[#005EB8] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ برگه پاسخ‌ها (Print A4)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const allText = questions
                  .map((q) => {
                    const a = answers[q.fieldKey];
                    return `[Box ${q.number} - ${q.questionEn}]:\n${a ? a.extractedAnswer : '(Blank)'}`;
                  })
                  .join('\n\n');
                navigator.clipboard.writeText(allText);
                alert('تمام پاسخ‌های انگلیسی کپی شد!');
              }}
              className="min-h-[48px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>کپی تمام کلمات</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFormId(null);
                setDocumentPageIndex(0);
                setInputText('');
                setPendingExtraction(null);
                setIsEditingOCR(false);
                onClearCustomForm?.();
              }}
              className="min-h-[48px] px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              انتخاب فرم دیگر
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: FORM COMPANION EXPERIENCE (Mobile First Tabbed or Desktop Dual Panel)
  const existingAnswer = answers[currentQ.fieldKey];
  const answeredCount = Object.keys(answers).length;
  const answeredPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isDari = userLanguage === 'dari';
  const displayTitle = isDari ? (selectedFormObj?.titleDari || selectedFormObj?.titleFa) : selectedFormObj?.titleFa;
  const simpleGuidance = currentQ ? getSuperSimpleQuestionGuidance(currentQ, isDari) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-28 md:pb-6">
      {/* Top Header Navigation & Status Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xs flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              setSelectedFormId(null);
              setDocumentPageIndex(0);
              setInputText('');
              setPendingExtraction(null);
              setIsEditingOCR(false);
              onClearCustomForm?.();
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-slate-200 font-bold flex items-center gap-1.5 font-farsi transition border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>تغییر فرم</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded shadow-2xs">
                {selectedFormObj?.code || 'FORM'}
              </span>
              <h2 className="font-bold text-xs sm:text-base text-white font-farsi dir-rtl line-clamp-1">
                {displayTitle || selectedFormObj?.titleEn}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 font-farsi dir-rtl hidden sm:block">
              تکمیل فرم کاغذی با دستیار هوشمند و راهنمای فارسی
            </p>
          </div>
        </div>

        {/* Primary Action (Answer Sheet) & Secondary "More" Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReviewMode(true)}
            className="min-h-[44px] px-3 sm:px-4 py-2 bg-[#005EB8] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold font-farsi transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden xs:inline">برگه پاسخ‌ها</span>
            <span className="xs:hidden">پاسخ‌ها</span>
          </button>

          {/* Secondary Actions Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setShowMoreMenu((prev) => !prev)}
              className="min-h-[44px] w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition cursor-pointer"
              title="امکانات و تنظیمات بیشتر / More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute left-0 top-12 z-50 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-2 font-farsi dir-rtl space-y-1 text-xs">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-300 font-mono flex items-center justify-between">
                  <span>پیشرفت تکمیل:</span>
                  <span className="text-slate-200 font-bold">{answeredCount} از {questions.length} ({answeredPercent}%)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirmModal(true);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-rose-950/80 text-rose-300 flex items-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>شروع دوباره و پاک کردن پاسخ‌ها</span>
                </button>
                {selectedFormObj?.officialSourceUrl && (
                  <a
                    href={selectedFormObj.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition"
                    onClick={() => setShowMoreMenu(false)}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>لینک رسمی فرم در GOV.UK / NHS</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Advisory / Restored Answers Strip (At most one banner visible) */}
      {showRestoredBanner && answeredCount > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white flex flex-wrap items-center justify-between gap-2.5 font-farsi dir-rtl shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white">
                پاسخ‌های قبلی شما بازیابی شدند.
              </span>
              <span className="text-[11px] text-slate-400 block sm:inline sm:mr-2 font-mono">
                ({answeredCount} پاسخ ذخیره‌شده)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mr-auto">
            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
              <span>شروع دوباره</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRestoredBanner(false)}
              className="min-h-[44px] w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 cursor-pointer"
              title="بستن پیام"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NARROW SCREEN TWO-BUTTON SWITCH (Document / Questions) - STICKY */}
      <div className="md:hidden sticky top-[108px] sm:top-[120px] z-20 bg-slate-950/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-md font-farsi dir-rtl">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setNarrowScreenTab('document')}
            className={`min-h-[48px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              narrowScreenTab === 'document'
                ? 'bg-teal-600 text-white border border-teal-500 shadow-md shadow-teal-900/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/90 border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📄 سند رسمی (Document)</span>
          </button>

          <button
            type="button"
            onClick={() => setNarrowScreenTab('questions')}
            className={`min-h-[48px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              narrowScreenTab === 'questions'
                ? 'bg-teal-600 text-white border border-teal-500 shadow-md shadow-teal-900/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 bg-slate-900/90 border border-slate-800'
            }`}
          >
            <SquarePen className="w-4 h-4" />
            <span>📝 سوالات و راهنما (Questions)</span>
          </button>
        </div>
      </div>

      {/* NARROW SCREEN SINGLE-PANEL VIEW (Shows ONLY ONE at a time) */}
      <div className="md:hidden">
        {/* VIEW A: DOCUMENT PANEL */}
        {narrowScreenTab === 'document' && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-2xl text-xs text-slate-300 font-farsi dir-rtl flex items-center gap-2 border border-slate-800">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {customPages && customPages.length > 0
                  ? 'برگه آپلود شده شما. سوالات را در زبانه «سوالات و راهنما» پاسخ دهید.'
                  : 'این سند رسمی دولت بریتانیا/NHS است. پاسخ‌ها را روی فرم کاغذی خود بنویسید.'}
              </span>
            </div>

            {customPages && customPages.length > 0 ? (
              <div className="space-y-3">
                {customPages.length > 1 && (
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-2xl border border-slate-800 font-farsi dir-rtl text-xs text-white">
                    <button
                      type="button"
                      onClick={() => setDocumentPageIndex((prev) => Math.max(0, prev - 1))}
                      disabled={documentPageIndex === 0}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>صفحه قبل</span>
                    </button>
                    <span className="font-mono font-bold text-slate-200">
                      صفحه {documentPageIndex + 1} از {customPages.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDocumentPageIndex((prev) => Math.min(customPages.length - 1, prev + 1))}
                      disabled={documentPageIndex === customPages.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>صفحه بعد</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {(() => {
                  const currentPageObj = customPages[documentPageIndex] || customPages[0];
                  const dataUrl = currentPageObj?.dataUrl || '';
                  const fileNameLower = (currentPageObj?.fileName || '').toLowerCase();
                  const isDocx = currentPageObj?.fileType === 'docx' || fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc') || dataUrl.startsWith('data:text/html');
                  const isPdf = currentPageObj?.fileType === 'pdf' || dataUrl.startsWith('data:application/pdf') || fileNameLower.endsWith('.pdf');

                  if (isDocx) {
                    let html = currentPageObj?.htmlContent || '';
                    if (!html && dataUrl.startsWith('data:text/html')) {
                      try {
                        html = decodeURIComponent(dataUrl.replace(/^data:text\/html;charset=utf-8,/, ''));
                      } catch (_) {}
                    }

                    return (
                      <div className="w-full min-h-[400px] max-h-[600px] overflow-y-auto bg-white text-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-300 shadow-md text-left dir-ltr">
                        <div className="flex items-center justify-between border-b pb-2 mb-3 text-xs font-mono text-slate-600">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-slate-600" /> Word / DOCX Document
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                            {currentPageObj?.fileName || 'Document.docx'}
                          </span>
                        </div>
                        {html ? (
                          <div
                            className="prose prose-slate max-w-none text-slate-900 space-y-2 font-sans text-xs sm:text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: html }}
                          />
                        ) : (
                          <div className="p-6 text-center text-slate-500 font-farsi">
                            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-80" />
                            <p className="font-bold text-slate-800 text-xs">محتوای سند Word بارگذاری شد.</p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (isPdf) {
                    return (
                      <iframe
                        src={dataUrl}
                        className="w-full h-[500px] rounded-2xl border border-slate-700 bg-white shadow-md"
                        title="Uploaded PDF Document Page"
                      />
                    );
                  }

                  return (
                    <img
                      src={dataUrl}
                      alt="Uploaded Paper Form"
                      className="w-full object-contain rounded-2xl border border-slate-700 shadow-md max-h-[500px]"
                    />
                  );
                })()}
              </div>
            ) : selectedFormObj ? (
              <OfficialPdfViewer
                pdfPath={selectedFormObj.pdfPath}
                titleEn={selectedFormObj.titleEn}
                titleFa={displayTitle}
                officialSourceUrl={selectedFormObj.officialSourceUrl}
                pageCount={selectedFormObj.pageCount}
                currentPageIndex={documentPageIndex}
                onSelectPage={(pIdx) => setDocumentPageIndex(pIdx)}
              />
            ) : null}
          </div>
        )}

        {/* VIEW B: QUESTIONS & GUIDANCE PANEL */}
        {narrowScreenTab === 'questions' && (
          <div className="space-y-4 font-farsi dir-rtl">
            {/* Progress Header & Thin Progress Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <span>سوال {currentQuestionIndex + 1} از {questions.length}</span>
                </span>
                <span className="text-slate-400 font-mono text-xs">
                  {answeredPercent}% تکمیل ({answeredCount} از {questions.length} پاسخ)
                </span>
              </div>

              {/* Thin Progress Bar based on actual answered questions */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#005EB8] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${answeredPercent}%` }}
                />
              </div>
            </div>

            {/* Screen-Filling Question Card */}
            <FormQuestionCard
              currentQ={currentQ}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              userLanguage={userLanguage}
              answers={answers}
              setAnswers={setAnswers}
              inputText={inputText}
              setInputText={setInputText}
              isProcessing={isProcessing}
              processingFieldKey={processingFieldKey}
              aiCallError={aiCallError}
              setAiCallError={setAiCallError}
              processUserAnswer={processUserAnswer}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              copiedKey={copiedKey}
              handleCopyText={handleCopyText}
              handlePrevQuestion={handlePrevQuestion}
              handleNextQuestion={handleNextQuestion}
              handleToggleCheckboxOption={handleToggleCheckboxOption}
              showDontUnderstand={showDontUnderstand}
              setShowDontUnderstand={setShowDontUnderstand}
              onPlayAudio={onPlayAudio}
            />

            {/* Mobile AI Form Assistant Panel Directly Below Current Question */}
            <FormAssistantPanel
              currentQ={currentQ}
              userLanguage={userLanguage}
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              isChatProcessing={isChatProcessing}
              handleSendChatMessage={handleSendChatMessage}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              onPlayAudio={onPlayAudio}
            />
          </div>
        )}
      </div>

      {/* DESKTOP / TABLET DUAL PANEL GRID (Visible on md: and above) */}
      <div className="hidden md:grid md:grid-cols-12 gap-5 items-start relative">
        
        {/* LEFT PANEL (COL 1-6): OFFICIAL PDF VIEWER OR CUSTOM UPLOAD CANVAS */}
        <div className="md:col-span-6 bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3 text-white flex flex-col">
          {customPages && customPages.length > 0 ? (
            /* Uploaded User Photo/PDF Canvas */
            <div className="relative space-y-3">
              {(() => {
                const currentPageObj = customPages[documentPageIndex] || customPages[0];
                const dataUrl = currentPageObj?.dataUrl || '';
                const fileNameLower = (currentPageObj?.fileName || '').toLowerCase();
                const isDocx = currentPageObj?.fileType === 'docx' || fileNameLower.endsWith('.docx') || fileNameLower.endsWith('.doc') || dataUrl.startsWith('data:text/html');
                const isPdf = currentPageObj?.fileType === 'pdf' || dataUrl.startsWith('data:application/pdf') || fileNameLower.endsWith('.pdf');

                if (isDocx) {
                  let html = currentPageObj?.htmlContent || '';
                  if (!html && dataUrl.startsWith('data:text/html')) {
                    try {
                      html = decodeURIComponent(dataUrl.replace(/^data:text\/html;charset=utf-8,/, ''));
                    } catch (_) {}
                  }

                  return (
                    <div className="w-full min-h-[550px] max-h-[700px] overflow-y-auto bg-white text-slate-900 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xl text-left dir-ltr">
                      <div className="flex items-center justify-between border-b pb-3 mb-4 text-xs font-mono text-slate-600">
                        <span className="font-bold text-blue-700 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" /> Word / DOCX Document
                        </span>
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {currentPageObj?.fileName || 'Document.docx'}
                        </span>
                      </div>
                      {html ? (
                        <div
                          className="prose prose-slate max-w-none text-slate-900 space-y-3 font-sans text-sm sm:text-base leading-relaxed [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_p]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-slate-100"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      ) : (
                        <div className="p-8 text-center text-slate-500 font-farsi">
                          <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-80" />
                          <p className="font-bold text-slate-800">محتوای سند Word بارگذاری گردید.</p>
                          <p className="text-xs text-slate-500 mt-1">برای پاسخگویی و راهنمایی گام‌به‌گام، روی سوالات در پنل سمت راست کلیک کنید.</p>
                        </div>
                      )}
                    </div>
                  );
                }

                if (isPdf) {
                  return (
                    <iframe
                      src={dataUrl}
                      className="w-full h-[620px] rounded-xl border border-slate-700 bg-white shadow-lg"
                      title="Uploaded PDF Document Page"
                    />
                  );
                }

                return (
                  <img
                    src={dataUrl}
                    alt="Uploaded Paper Form"
                    className="w-full object-contain rounded-xl border border-slate-700 shadow-lg"
                  />
                );
              })()}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-300 font-farsi dir-rtl">
                  📍 روی سوالات کلیک کنید تا متون و بخش‌های آن را مشاهده کنید.
                </p>
              </div>
            </div>
          ) : selectedFormObj ? (
            <OfficialPdfViewer
              pdfPath={selectedFormObj.pdfPath}
              titleEn={selectedFormObj.titleEn}
              titleFa={displayTitle}
              officialSourceUrl={selectedFormObj.officialSourceUrl}
              pageCount={selectedFormObj.pageCount}
              currentPageIndex={documentPageIndex}
              onSelectPage={(pIdx) => setDocumentPageIndex(pIdx)}
            />
          ) : null}

          <div className="p-2.5 bg-slate-800/80 rounded-2xl text-[11px] text-slate-300 flex items-center gap-2 font-farsi dir-rtl shrink-0">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>فایل اصلی سند فوق قابل تغییر توسط هوش مصنوعی نیست. سوالات را در پنل روبرو پاسخ دهید.</span>
          </div>
        </div>

        {/* RIGHT PANEL (DESKTOP/TABLET): STICKY QUESTIONS & ASSISTANT SIDEPANEL */}
        <div className="md:col-span-6 space-y-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1 scrollbar-thin transition-all">
          
          {/* Card 1: Question Navigator & Active Question Card & Shared Answer Block */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-md space-y-4 text-white">
            
            {/* Progress Header & Collapsible Question List on Desktop */}
            <div className="space-y-3 border-b border-slate-800 pb-3 font-farsi dir-rtl">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg">
                    {currentQ.questionCode || `Q${currentQ.number}`}
                  </span>
                  <span className="text-xs text-slate-300 font-farsi">
                    بخش: {currentQ.section}
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  {currentQuestionIndex + 1} / {questions.length} ({answeredPercent}% تکمیل)
                </span>
              </div>

              {/* Thin Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#005EB8] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${answeredPercent}%` }}
                />
              </div>
            </div>

            {/* Shared Question Card Component on Desktop/Tablet */}
            <FormQuestionCard
              currentQ={currentQ}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              userLanguage={userLanguage}
              answers={answers}
              setAnswers={setAnswers}
              inputText={inputText}
              setInputText={setInputText}
              isProcessing={isProcessing}
              processingFieldKey={processingFieldKey}
              aiCallError={aiCallError}
              setAiCallError={setAiCallError}
              processUserAnswer={processUserAnswer}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              copiedKey={copiedKey}
              handleCopyText={handleCopyText}
              handlePrevQuestion={handlePrevQuestion}
              handleNextQuestion={handleNextQuestion}
              handleToggleCheckboxOption={handleToggleCheckboxOption}
              showDontUnderstand={showDontUnderstand}
              setShowDontUnderstand={setShowDontUnderstand}
              onPlayAudio={onPlayAudio}
            />
          </div>

          {/* Card 2: AI Form Assistant Panel - Placed directly under current question */}
          <FormAssistantPanel
            currentQ={currentQ}
            userLanguage={userLanguage}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            isChatProcessing={isChatProcessing}
            handleSendChatMessage={handleSendChatMessage}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            onPlayAudio={onPlayAudio}
          />
        </div>

      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-800 shadow-2xl font-farsi dir-rtl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  شروع دوباره فرم و پاک کردن پاسخ‌ها
                </h3>
                <p className="text-xs text-slate-400 font-mono">Clear Saved Answers</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              آیا مطمئن هستید که می‌خواهید تمام پاسخ‌های ذخیره‌شده برای این فرم را پاک کنید؟ با تأیید شما، تمام خانه‌ها خالی شده و از سوال اول شروع خواهید کرد.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="min-h-[48px] py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition border border-slate-700 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleClearFormAnswers}
                className="min-h-[48px] py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>بله، پاک شود</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
