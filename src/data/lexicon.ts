export interface UKAsylumTerm {
  farsi: string;
  dari: string;
  english: string;
  category: 'Home Office & Legal' | 'Financial & Welfare' | 'NHS Healthcare' | 'Housing & Daily';
  explanation: string;
}

export const UK_ASYLUM_LEXICON: UKAsylumTerm[] = [
  {
    english: 'ARC (Application Registration Card)',
    farsi: 'کارت شناسایی پناهجویی (ای‌آر‌سی)',
    dari: 'کارت ای‌آر‌سی (شناخت‌کارت پناهجویی)',
    category: 'Home Office & Legal',
    explanation: 'Plastic smartcard issued to asylum seekers by the UK Home Office verifying their asylum claim and entitlement to services.',
  },
  {
    english: 'Substantive Asylum Interview',
    farsi: 'مصاحبه اصلی پناهندگی (بیگ اینترویو)',
    dari: 'مصاحبه کلان پناهندگی هوم آفیس',
    category: 'Home Office & Legal',
    explanation: 'The in-depth Home Office interview where the claimant explains why they fear returning to their home country.',
  },
  {
    english: 'Screening Interview',
    farsi: 'مصاحبه مقدماتی / غربالگری اولیه',
    dari: 'مصاحبه مقدماتی ثبت نام',
    category: 'Home Office & Legal',
    explanation: 'Initial short interview at the Asylum Intake Unit (e.g. Croydon) to gather basic biometric and route data.',
  },
  {
    english: 'Section 95 Support',
    farsi: 'کمک‌هزینه پناهندگی سکشن ۹۵',
    dari: 'پیسه هفتگی و مسکن سکشن ۹۵',
    category: 'Financial & Welfare',
    explanation: 'Financial support and accommodation provided to destitute asylum seekers awaiting their asylum decision.',
  },
  {
    english: 'ASPEN Card',
    farsi: 'کارت پرداخت آسپن',
    dari: 'کارت خرید آسپین',
    category: 'Financial & Welfare',
    explanation: 'A debit card through which weekly cash allowances from the UK Home Office are automatically disbursed.',
  },
  {
    english: 'Section 4 Support',
    farsi: 'کمک‌هزینه سکشن ۴ (برای پناهجویان رد شده)',
    dari: 'پشتیبانی سکشن ۴ برای موارد ویژه',
    category: 'Financial & Welfare',
    explanation: 'Hardship support for refused asylum seekers taking reasonable steps to leave or unable to leave due to medical barriers.',
  },
  {
    english: 'Legal Aid Solicitor',
    farsi: 'وکیل حقوقی رایگان (دولتی)',
    dari: 'وکیل تسخیری / وکیل قانونی رایگان',
    category: 'Home Office & Legal',
    explanation: 'Free qualified legal representation for asylum claims funded by the UK government for those who cannot afford a private lawyer.',
  },
  {
    english: 'Immigration Bail / Reporting Conditions',
    farsi: 'امضای هوم آفیس / بیلی حضور هفتگی',
    dari: 'حضور و امضا کردن در هوم آفیس (بیلی)',
    category: 'Home Office & Legal',
    explanation: 'Mandatory requirement for asylum seekers to report periodically to a Home Office reporting centre or police station.',
  },
  {
    english: 'GP (General Practitioner) Registration',
    farsi: 'ثبت‌نام در پزشک عمومی / درمانگاه محلی',
    dari: 'راجستر شدن در کلینیک داکتر عمومی',
    category: 'NHS Healthcare',
    explanation: 'Primary care doctor in the UK National Health Service (NHS). Free for all asylum seekers regardless of immigration status.',
  },
  {
    english: 'HC2 Certificate',
    farsi: 'فرم اچ‌سی‌تو (معافیت هزینه دارو و دندانپزشکی)',
    dari: 'سند معافیت مصرف ادویه و داکتر دندان',
    category: 'NHS Healthcare',
    explanation: 'A certificate entitling full help with NHS health costs, free prescription medicines, eye tests, and dental treatment.',
  },
  {
    english: 'Dispersal Accommodation',
    farsi: 'مسکن انتقالی پناهندگی در شهر دیگر',
    dari: 'جای بودوباش انتقالی پناهندگی',
    category: 'Housing & Daily',
    explanation: 'Longer-term housing provided by Home Office housing contractors (e.g. Serco, Mears, Clearsprings) outside London/South East.',
  },
  {
    english: 'Migrant Help',
    farsi: 'مایگرنت هلپ (سازمان مشاوره و پشتیبانی)',
    dari: 'نهاد مایگرنت هلپ',
    category: 'Housing & Daily',
    explanation: 'The official free helpline (0808 8010 503) contracted by the Home Office to advise on asylum support and report housing faults.',
  },
];
