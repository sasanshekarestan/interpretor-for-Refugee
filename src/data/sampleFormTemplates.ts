export interface SampleFormPage {
  pageNumber: number;
  title: string;
  headerText: string;
  departmentLogo: string;
  sections: {
    title: string;
    fields: {
      fieldKey: string;
      labelEn: string;
      boxLabel: string;
      fieldNumber: number;
      placeholderText: string;
      explanationFa: string;
      ukConceptNote?: string;
    }[];
  }[];
}

export const SAMPLE_FORM_DOCUMENTS: Record<string, {
  title: string;
  formCode: string;
  issuingAuthority: string;
  pages: SampleFormPage[];
}> = {
  arc_replacement: {
    title: 'Application for Replacement Application Registration Card (ARC)',
    formCode: 'HO-ARC-REP-v2026.1',
    issuingAuthority: 'Home Office - UK Visas & Immigration',
    pages: [
      {
        pageNumber: 1,
        title: 'Section 1 & 2: Personal Details & Case Identification',
        headerText: 'UK VISAS & IMMIGRATION - ASYLUM REGISTRATION CARD REPLACEMENT',
        departmentLogo: 'UK Home Office',
        sections: [
          {
            title: 'Section 1: Applicant Information',
            fields: [
              {
                fieldKey: 'full_name',
                labelEn: '1. Full Name (as recorded on Home Office file)',
                boxLabel: 'Box 1.1 - Full Name',
                fieldNumber: 1,
                placeholderText: 'SURNAME, First Name(s)',
                explanationFa: 'نام و نام خانوادگی کامل خود را مطابق با مدارک هوم آفیس وارد کنید.',
              },
              {
                fieldKey: 'ho_ref',
                labelEn: '2. Home Office Reference Number / Port Reference',
                boxLabel: 'Box 1.2 - HO Reference No.',
                fieldNumber: 2,
                placeholderText: 'e.g. 01234567 or A1234567',
                explanationFa: 'شماره پرونده ۹ رقمی یا مرجع پناهندگی هوم آفیس که بالای نامه‌ها نوشته می‌شود.',
                ukConceptNote: 'In the UK, your Home Office Reference Number is your unique 9-digit asylum case identifier. It connects all your records, legal aid, and accommodation.',
              },
              {
                fieldKey: 'dob',
                labelEn: '3. Date of Birth (DD/MM/YYYY)',
                boxLabel: 'Box 1.3 - Date of Birth',
                fieldNumber: 3,
                placeholderText: 'DD / MM / YYYY',
                explanationFa: 'تاریخ تولد میلادی به صورت روز/ماه/سال.',
              },
            ],
          },
          {
            title: 'Section 2: Incident & Police Report',
            fields: [
              {
                fieldKey: 'reason_loss',
                labelEn: '4. Reason for ARC Replacement',
                boxLabel: 'Box 2.1 - Reason (Lost / Stolen / Damaged)',
                fieldNumber: 4,
                placeholderText: 'Specify Lost, Stolen, Damaged, or Expired',
                explanationFa: 'دلیل نیاز به کارت جدید (گم شده، دزدیده شده، آسیب دیده یا منقضی شده).',
              },
              {
                fieldKey: 'police_ref',
                labelEn: '5. Police Incident / CAD Number (if reported)',
                boxLabel: 'Box 2.2 - Police CAD / Ref No.',
                fieldNumber: 5,
                placeholderText: 'e.g. CAD-12345/22 or N/A',
                explanationFa: 'شماره کدی که هنگام گزارش به پلیس دریافت کرده‌اید.',
                ukConceptNote: 'In the UK, when you report stolen property or lost identity cards to the police, they issue a Computer Aided Despatch (CAD) or Incident Reference Number. This proves to the Home Office that the loss was officially logged.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Section 3 & 4: UK Accommodation & Declaration',
        headerText: 'UK VISAS & IMMIGRATION - PAGE 2 OF 2',
        departmentLogo: 'UK Home Office',
        sections: [
          {
            title: 'Section 3: Current Accommodation Address',
            fields: [
              {
                fieldKey: 'current_address',
                labelEn: '6. Full UK Accommodation Address & Postcode',
                boxLabel: 'Box 3.1 - Address & Postcode',
                fieldNumber: 6,
                placeholderText: 'House/Hotel Name, Room No, Street, City, Postcode',
                explanationFa: 'آدرس کامل محل سکونت فعلی به همراه کد پستی ۶ تا ۷ رقمی بریتانیا.',
              },
              {
                fieldKey: 'asylum_grounds',
                labelEn: '7. Reason why you cannot return to country of origin',
                boxLabel: 'Box 3.2 - Asylum Grounds Statement',
                fieldNumber: 7,
                placeholderText: 'Personal statement on asylum grounds',
                explanationFa: 'توضیحات کوتاه درباره دلایل پناهندگی و عدم امکان بازگشت.',
                ukConceptNote: 'This field asks for your personal asylum grounds. We translate and structure your exact words neutrally. For formal legal strategy, consult a UK Immigration Solicitor.',
              },
              {
                fieldKey: 'contact_detail',
                labelEn: '8. UK Mobile Telephone Number & Email Address',
                boxLabel: 'Box 4.1 - Contact Phone / Email',
                fieldNumber: 8,
                placeholderText: '07xxx xxxxxx / email@example.com',
                explanationFa: 'شماره موبایل فعال در بریتانیا یا ایمیل جهت هماهنگی تحویل کارت.',
              },
            ],
          },
        ],
      },
    ],
  },

  nhs_hc1: {
    title: 'NHS HC1 Claim for Help with Health Costs (Official 20-Page Form)',
    formCode: 'NHSBSA-HC1-Aug2023-v2026',
    issuingAuthority: 'NHS Business Services Authority - Low Income Scheme',
    pages: [
      {
        pageNumber: 1,
        title: 'Cover: Low Income Scheme Overview (Page 1)',
        headerText: 'NHS BUSINESS SERVICES AUTHORITY - HELP WITH HEALTH COSTS (HC1)',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Page 1: Low Income Scheme Overview',
            fields: [
              {
                fieldKey: 'hc1_guidance_read',
                labelEn: 'HC1 Overview: Help with prescriptions, dental, sight tests, glasses, wigs & hospital travel.',
                boxLabel: 'Page 1 Overview',
                fieldNumber: 0,
                placeholderText: 'Read Page 1 Overview before proceeding',
                explanationFa: 'صفحه اول فرم HC1: اطلاعات کلی درباره معافیت هزینه‌های درمانی (دارو، دندانپزشکی، عینک، کلاه گیس و سفر درمانی).',
                ukConceptNote: 'If you receive Section 95 asylum support or Universal Credit with net earnings below £435/month, you may already have full exemption. HC1 is for low-income applicants with savings under £16,000.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Page A: Some Notes to Help You (Page 2)',
        headerText: 'NHS HC1 FORM - PAGE A: GUIDANCE NOTES',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Page A: Notes on How to Claim',
            fields: [
              {
                fieldKey: 'hc1_guidance_read',
                labelEn: 'Page A: How to make your claim & claiming on behalf of someone else',
                boxLabel: 'Page A Notes',
                fieldNumber: 0,
                placeholderText: 'Guidance on completing the form and target timelines',
                explanationFa: 'راهنمای نحوه تکمیل فرم و تکمیل آن توسط نماینده قانونی.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 3,
        title: 'Page B: How We Assess Your Claim (Page 3)',
        headerText: 'NHS HC1 FORM - PAGE B: ASSESSMENT RULES',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Page B: Income vs Requirements Assessment',
            fields: [
              {
                fieldKey: 'hc1_guidance_read',
                labelEn: 'Page B: Calculation rules for household income and living requirements',
                boxLabel: 'Page B Notes',
                fieldNumber: 0,
                placeholderText: 'Explanation of assessment calculations',
                explanationFa: 'نحوه محاسبه درآمد خانوار در برابر هزینه‌های ضروری زندگی.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 4,
        title: 'Page C: Help, Advice and Refunds (Page 4)',
        headerText: 'NHS HC1 FORM - PAGE C: REFUND CLAIMS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Page C: Claiming Back Money Paid',
            fields: [
              {
                fieldKey: 'hc1_refund_ticks',
                labelEn: 'Page C: How to claim refunds using forms FP57 or HC5 within 3 months',
                boxLabel: 'Page C Notes',
                fieldNumber: 1,
                placeholderText: 'Information on claiming back costs paid in the last 3 months',
                explanationFa: 'راهنمای دریافت پس پول هزینه‌های پرداختی ۳ ماه اخیر با فرم FP57 یا HC5.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 5,
        title: 'Part 1: About You and Your Partner (Page 5)',
        headerText: 'NHS HC1 FORM - PART 1: PERSONAL DETAILS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 1: Personal Details & Refund Claims',
            fields: [
              {
                fieldKey: 'hc1_part1_details',
                labelEn: '1.1 Refund Ticks, 1.2 Partner Status & 1.3 Full Personal Details (Name, DOB, 10-digit NHS No, Address)',
                boxLabel: 'Part 1 (1.1 - 1.3)',
                fieldNumber: 1,
                placeholderText: 'SURNAME, First Name, DOB, 10-digit NHS No, UK Address & Postcode, Phone & Email',
                explanationFa: 'مشخصات کامل متقاضی و همسر شامل نام، تاریخ تولد، شماره ۱۰ رقمی NHS و آدرس.',
                ukConceptNote: 'Your 10-digit NHS Number is printed on your GP card or medical letters.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 6,
        title: 'Part 2: Children and Qualifying Young People (Page 6)',
        headerText: 'NHS HC1 FORM - PART 2: CHILDREN & DEPENDENTS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 2: Children & Young People',
            fields: [
              {
                fieldKey: 'hc1_part2_children',
                labelEn: '2.1 Children under 16 or 16-19 in full-time education',
                boxLabel: 'Part 2 (2.1)',
                fieldNumber: 2,
                placeholderText: 'Full Names, Dates of Birth & Relationship to applicant',
                explanationFa: 'مشخصات فرزندان زیر ۱۶ سال یا ۱۶ تا ۱۹ سال که در حال تحصیل تمام وقت هستند.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 7,
        title: 'Part 3: Other People Living in Your Home (Page 7)',
        headerText: 'NHS HC1 FORM - PART 3: OTHER RESIDENTS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 3: Person 1 to Person 4 Details',
            fields: [
              {
                fieldKey: 'hc1_part3_residents',
                labelEn: '3.1 Other adults living with you (Names, Ages, Benefits, Work hours & Income)',
                boxLabel: 'Part 3 (3.1)',
                fieldNumber: 3,
                placeholderText: 'Names, Ages, Benefits, Work hours & Income of other household adults',
                explanationFa: 'مشخصات سایر بزرگسالانی که با شما در یک خانه زندگی می‌کنند.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 8,
        title: 'Part 3 (cont.): Couples & Boarders (Page 8)',
        headerText: 'NHS HC1 FORM - PART 3: COUPLES & BOARDERS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 3: Couple Status & Lodgers',
            fields: [
              {
                fieldKey: 'hc1_part3_residents',
                labelEn: '3.2 Couple status of other residents & 3.3 Boarders, lodgers or subtenants',
                boxLabel: 'Part 3 (3.2 & 3.3)',
                fieldNumber: 3,
                placeholderText: 'Details of lodgers, boarders, or subtenants paying rent to you',
                explanationFa: 'اطلاعات مستاجرین یا پانسیونرهایی که به شما اجاره می‌دهند.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 9,
        title: 'Part 4: About Property, Savings and Other Money (Page 9)',
        headerText: 'NHS HC1 FORM - PART 4: SAVINGS & PROPERTY',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 4: Savings & Land/Property',
            fields: [
              {
                fieldKey: 'hc1_part4_savings',
                labelEn: '4.1 Bank Accounts, Savings, Shares (< £16,000) & 4.2 Property owned',
                boxLabel: 'Part 4 (4.1 & 4.2)',
                fieldNumber: 4,
                placeholderText: 'Bank balances, Premium bonds, ISAs, Land or second property',
                explanationFa: 'میزان موجودی حساب بانکی و پس‌اندازها (باید کمتر از ۱۶,۰۰۰ پوند باشد).',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 10,
        title: 'Part 5: About Your Income & Benefits (Page 10)',
        headerText: 'NHS HC1 FORM - PART 5: BENEFITS & INCOME',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 5: Social Security Benefits',
            fields: [
              {
                fieldKey: 'hc1_part5_income',
                labelEn: '5.1 Benefits Table (Universal Credit, Section 95 Asylum Support, JSA, ESA, Pension) & 5.2 Other Income',
                boxLabel: 'Part 5 (5.1 & 5.2)',
                fieldNumber: 5,
                placeholderText: 'Specify benefit names (Asylum S95 / UC / PIP) and weekly/monthly amounts',
                explanationFa: 'مزایای دولتی دریافتی (پناهندگی سکشن ۹۵، یونیورسال کریدیت، PIP و غیره).',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 11,
        title: 'Part 5 (cont.): Disability Allowances & Carers (Page 11)',
        headerText: 'NHS HC1 FORM - PART 5: DISABILITY & CARERS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 5: PIP, DLA & Carer Allowances',
            fields: [
              {
                fieldKey: 'hc1_part5_income',
                labelEn: '5.3 Attendance Allowance, 5.4 DLA, 5.5 PIP, 5.6 Sick notes, 5.8 Carer Allowance',
                boxLabel: 'Part 5 (5.3 - 5.9)',
                fieldNumber: 5,
                placeholderText: 'PIP mobility/care rate, Carer Allowance payments',
                explanationFa: 'مزایای معلولیت PIP، DLA و حق مراقبت Carer Allowance.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 12,
        title: 'Part 6: About Work (Page 12)',
        headerText: 'NHS HC1 FORM - PART 6: WORK & EMPLOYMENT',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 6: Job & Earnings Details',
            fields: [
              {
                fieldKey: 'hc1_part6_work',
                labelEn: '6.1 Job status, 6.2 Employed / Self-employed, weekly hours & pay frequency, 6.3 Pension',
                boxLabel: 'Part 6 (6.1 - 6.3)',
                fieldNumber: 6,
                placeholderText: 'Job title, hours worked, weekly pay, zero-hours contract status',
                explanationFa: 'اطلاعات شغل، ساعات کار و نوع قرارداد کاری.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 13,
        title: 'Part 6 (cont.): Employer Sick Notes & Trainees (Page 13)',
        headerText: 'NHS HC1 FORM - PART 6: SICK NOTES & TRAINEES',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 6: Sick Pay & Training Schemes',
            fields: [
              {
                fieldKey: 'hc1_part6_work',
                labelEn: '6.4 Employer sick notes & 6.5 Training scheme / Trainee details',
                boxLabel: 'Part 6 (6.4 & 6.5)',
                fieldNumber: 6,
                placeholderText: 'Statutory Sick Pay (SSP) or trainee allowance',
                explanationFa: 'گواهی مرخصی استعلاجی و یا دوره‌های کارآموزی.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 14,
        title: 'Part 7: About Where You Live (Page 14)',
        headerText: 'NHS HC1 FORM - PART 7: RENT & ACCOMMODATION',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 7: Rent & Included Bills',
            fields: [
              {
                fieldKey: 'hc1_part7_housing',
                labelEn: '7.1 Hospital, 7.2 Live with parents, 7.3 Joint owner, 7.4 Rent paid & included bills (heating/water)',
                boxLabel: 'Part 7 (7.1 - 7.4)',
                fieldNumber: 7,
                placeholderText: 'Rent amount, Housing Benefit deductions, heating/hot water included',
                explanationFa: 'هزینه اجاره خانه و اینکه آیا قبوض گرمایش و آب روی اجاره محاسبه شده‌اند.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 15,
        title: 'Part 7 (cont.): Council Tax, Mortgage & Care Homes (Page 15)',
        headerText: 'NHS HC1 FORM - PART 7: COUNCIL TAX & MORTGAGE',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 7: Council Tax, Home Owners & Care',
            fields: [
              {
                fieldKey: 'hc1_part7_housing',
                labelEn: '7.5 Council Tax, 7.6 Own home, 7.7 Mortgage, 7.8 Ground rent, 7.11 Care home accommodation',
                boxLabel: 'Part 7 (7.5 - 7.12)',
                fieldNumber: 7,
                placeholderText: 'Council Tax payments, mortgage details, service charges',
                explanationFa: 'مالیات شورای شهر (Council Tax) یا اقساط وام مسکن.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 16,
        title: 'Part 8: People in Education (Page 16)',
        headerText: 'NHS HC1 FORM - PART 8: EDUCATION DETAILS',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 8: College / University & Tuition',
            fields: [
              {
                fieldKey: 'hc1_part8_education',
                labelEn: '8.1 College/University name & exact 3-term dates, 8.2 Overseas student, 8.3 Tuition fees',
                boxLabel: 'Part 8 (8.1 - 8.3)',
                fieldNumber: 8,
                placeholderText: 'University name, exact term 1, 2 & 3 dates, Student Finance awards',
                explanationFa: 'نام دانشگاه/کالج و تاریخ‌های دقیق ۳ ترم تحصیلی.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 17,
        title: 'Part 8 (cont.): Student Finance & Grants (Page 17)',
        headerText: 'NHS HC1 FORM - PART 8: STUDENT FINANCE',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 8: Student Loans, Bursaries & Support',
            fields: [
              {
                fieldKey: 'hc1_part8_education',
                labelEn: '8.4 Financial support applications & 8.5 Source of money (SFE loan, Bursaries, Parents)',
                boxLabel: 'Part 8 (8.4 & 8.5)',
                fieldNumber: 8,
                placeholderText: 'Student Finance England/Wales/SAAS loan breakdown',
                explanationFa: 'میزان دریافت وام تحصیلی یا بورس‌های دانشجویی.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 18,
        title: 'Part 8 (cont.): Student Accommodation & Summer Rent (Page 18)',
        headerText: 'NHS HC1 FORM - PART 8: STUDENT RENT',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 8: Living Costs & Summer Term',
            fields: [
              {
                fieldKey: 'hc1_part8_education',
                labelEn: '8.6 Living with parents, 8.7 Student rent paid during term, 8.8 Return date after summer',
                boxLabel: 'Part 8 (8.6 - 8.8)',
                fieldNumber: 8,
                placeholderText: 'Term-time student housing rent and summer dates',
                explanationFa: 'اجاره خوابگاه یا خانه دانشجویی در طول ترم.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 19,
        title: 'Part 9: Other Information & Checklist (Page 19)',
        headerText: 'NHS HC1 FORM - PART 9: OTHER INFO & CHECKLIST',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 9: Extra Circumstances & Checklist',
            fields: [
              {
                fieldKey: 'hc1_part9_checklist',
                labelEn: 'Part 9: Extra notes (living expenses if no income) & attached evidence checklist',
                boxLabel: 'Part 9 Checklist',
                fieldNumber: 9,
                placeholderText: 'Additional circumstance notes and mandatory evidence checkboxes',
                explanationFa: 'توضیحات تکمیلی و علامت‌زدن فیش‌های حقوقی و مدارک پیوست‌شده.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 20,
        title: 'Part 10: Declaration & Signature (Page 20)',
        headerText: 'NHS HC1 FORM - PART 10: DECLARATION',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Part 10: Official Declaration & Signatures',
            fields: [
              {
                fieldKey: 'hc1_part10_declaration',
                labelEn: 'Part 10: Declaration statement, Box 10a (Applicant signature & date) or Box 10b (Representative)',
                boxLabel: 'Box 10a / 10b Signature',
                fieldNumber: 10,
                placeholderText: 'Signature in Box 10a or 10b, Date DD/MM/YYYY, Representative details',
                explanationFa: 'امضا و تاریخ نهایی در کادر 10a (متقاضی) یا کادر 10b (نماینده قانونی).',
              },
            ],
          },
        ],
      },
    ],
  },

  section95_coc: {
    title: 'Section 95 Change of Circumstances Form',
    formCode: 'HO-S95-COC-2026',
    issuingAuthority: 'Home Office - Asylum Support',
    pages: [
      {
        pageNumber: 1,
        title: 'Section 1 & 2: Case Details & Type of Change',
        headerText: 'HOME OFFICE ASYLUM SUPPORT - CHANGE OF CIRCUMSTANCES',
        departmentLogo: 'UK Home Office',
        sections: [
          {
            title: 'Section 1: Applicant Information',
            fields: [
              {
                fieldKey: 's95_name_nass',
                labelEn: '1. Full Name & NASS Reference Number',
                boxLabel: 'Box 1 - Name & NASS Ref',
                fieldNumber: 1,
                placeholderText: 'Full Name / NASS Ref: 19/04/XXXXX',
                explanationFa: 'نام کامل و شماره مرجع حمایت پناهندگی (NASS Ref) که روی کارت ASPEN است.',
                ukConceptNote: 'A NASS Reference Number is assigned by the National Asylum Support Service. Format is usually YY/MM/XXXXX.',
              },
              {
                fieldKey: 'type_of_change',
                labelEn: '2. Type of Change being Reported',
                boxLabel: 'Box 2 - Type of Change',
                fieldNumber: 2,
                placeholderText: 'Address move / Newborn child / Income change',
                explanationFa: 'دلیل تغییر شرایط (انتقال آدرس، تولد فرزند، تغییر درآمد).',
              },
              {
                fieldKey: 'prev_address',
                labelEn: '3. Previous Accommodation Address',
                boxLabel: 'Box 3 - Previous Address',
                fieldNumber: 3,
                placeholderText: 'Previous Hotel/House Address & Postcode',
                explanationFa: 'آدرس قبلی که در آن ساکن بوده‌اید.',
              },
              {
                fieldKey: 'new_address',
                labelEn: '4. New Accommodation Address & Postcode',
                boxLabel: 'Box 4 - New Address',
                fieldNumber: 4,
                placeholderText: 'New House/Flat Address & Postcode',
                explanationFa: 'آدرس جدید محل سکونت به همراه کد پستی.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Section 3 & 4: ASPEN Card & Evidence Documents',
        headerText: 'HOME OFFICE ASYLUM SUPPORT - PAGE 2',
        departmentLogo: 'UK Home Office',
        sections: [
          {
            title: 'Section 3: ASPEN Card & Family Details',
            fields: [
              {
                fieldKey: 'move_date',
                labelEn: '5. Date of Move / Date of Change',
                boxLabel: 'Box 5 - Date of Move',
                fieldNumber: 5,
                placeholderText: 'DD / MM / YYYY',
                explanationFa: 'تاریخ دقیق نقل مکان یا وقوع تغییر به میلادی.',
              },
              {
                fieldKey: 'newborn_dependents',
                labelEn: '6. Newborn Child or New Family Member Details',
                boxLabel: 'Box 6 - New Family Member',
                fieldNumber: 6,
                placeholderText: 'Child Full Name, DOB, MATB1 birth proof',
                explanationFa: 'اطلاعات نوزاد تازه متولد شده یا عضو جدید خانواده.',
                ukConceptNote: 'A MATB1 form or Birth Certificate from the NHS maternity unit is required by the Home Office to add a newborn baby to your Section 95 asylum support.',
              },
              {
                fieldKey: 'aspen_card_request',
                labelEn: '7. ASPEN Card Relocation / Delivery Request',
                boxLabel: 'Box 7 - ASPEN Card Delivery',
                fieldNumber: 7,
                placeholderText: 'Request card post to new address',
                explanationFa: 'درخواست ارسال یا فعال‌سازی کارت پرداخت ASPEN به آدرس جدید.',
              },
              {
                fieldKey: 'evidence_attached',
                labelEn: '8. Evidence Documents Attached',
                boxLabel: 'Box 8 - Supporting Documents',
                fieldNumber: 8,
                placeholderText: 'Tenancy agreement / Birth cert / Eviction notice',
                explanationFa: 'مدارک و اسناد ضمیمه شده (مانند گواهی تولد نوزاد یا برگه جابه‌جایی).',
              },
              {
                fieldKey: 's95_declaration',
                labelEn: '9. Declaration & Contact Number',
                boxLabel: 'Box 9 - Declaration & Phone',
                fieldNumber: 9,
                placeholderText: '07xxx xxxxxx / Confirmed correct',
                explanationFa: 'شماره تماس جهت پیگیری و تاییدیه صحه بر اطلاعات.',
              },
            ],
          },
        ],
      },
    ],
  },

  gp_registration: {
    title: 'GMS1 Family Doctor (GP) Registration Form',
    formCode: 'NHS-GMS1-v2026',
    issuingAuthority: 'NHS Primary Care Services',
    pages: [
      {
        pageNumber: 1,
        title: 'Section 1: Patient Information & NHS History',
        headerText: 'NHS - APPLICATION FOR GP SURGERY REGISTRATION (GMS1)',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Section 1: Patient Details',
            fields: [
              {
                fieldKey: 'gp_full_name',
                labelEn: '1. Patient Full Name & Title (Mr/Mrs/Miss/Ms)',
                boxLabel: 'Box 1 - Full Name & Title',
                fieldNumber: 1,
                placeholderText: 'Title, SURNAME, First Name(s)',
                explanationFa: 'نام، نام خانوادگی و عنوان شما (آقا/خانم).',
              },
              {
                fieldKey: 'gp_dob_pob',
                labelEn: '2. Date of Birth & Town / Country of Birth',
                boxLabel: 'Box 2 - DOB & Birth Place',
                fieldNumber: 2,
                placeholderText: 'DD/MM/YYYY - Town, Country (e.g. Tehran, Iran / Kabul, Afghanistan)',
                explanationFa: 'تاریخ تولد به میلادی و شهر و کشور محل تولد.',
              },
              {
                fieldKey: 'gp_nhs_number',
                labelEn: '3. 10-digit NHS Number (if previously registered)',
                boxLabel: 'Box 3 - NHS Number',
                fieldNumber: 3,
                placeholderText: '10-digit number e.g. 123 456 7890 or First UK Reg',
                explanationFa: 'شماره ۱۰ رقمی ان‌اچ‌اس در صورت ثبت‌نام قبلی در درمانگاه.',
              },
              {
                fieldKey: 'gp_current_address',
                labelEn: '4. Current Address in GP Surgery Catchment Area',
                boxLabel: 'Box 4 - Current Address & Postcode',
                fieldNumber: 4,
                placeholderText: 'UK House No, Street, City, Postcode',
                explanationFa: 'آدرس کامل محل سکونت در محدوده جغرافیایی مطب پزشک.',
                ukConceptNote: 'Every NHS GP surgery serves a designated geographic "Catchment Area". You have the right to register with any GP surgery within your local catchment area regardless of immigration status.',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Section 2: Emergency Contact & Medical History',
        headerText: 'NHS GMS1 FORM - PAGE 2',
        departmentLogo: 'NHS',
        sections: [
          {
            title: 'Section 2: Emergency Contact & Medical Conditions',
            fields: [
              {
                fieldKey: 'gp_prev_surgery',
                labelEn: '5. Previous UK GP Surgery Name & Address (if any)',
                boxLabel: 'Box 5 - Previous GP Surgery',
                fieldNumber: 5,
                placeholderText: 'Name of previous doctor surgery or First Arrival in UK',
                explanationFa: 'نام و آدرس مطب یا درمانگاه قبلی شما در بریتانیا (در صورت وجود).',
              },
              {
                fieldKey: 'gp_next_of_kin',
                labelEn: '6. Emergency Contact / Next of Kin Name & Phone',
                boxLabel: 'Box 6 - Next of Kin Contact',
                fieldNumber: 6,
                placeholderText: 'Name, Relationship (Friend/Spouse/Caseworker), Phone',
                explanationFa: 'نام و شماره تلفن شخص نزدیک یا مددکار برای موارد اضطراری.',
                ukConceptNote: 'In the UK health system, "Next of Kin" is your primary emergency contact (spouse, relative, trusted friend, or caseworker) that doctors contact in medical emergencies.',
              },
              {
                fieldKey: 'gp_medical_notes',
                labelEn: '7. Regular Medications & Medical Conditions',
                boxLabel: 'Box 7 - Medical Conditions & Meds',
                fieldNumber: 7,
                placeholderText: 'Diabetes, Blood pressure, Asthma, Regular Prescriptions',
                explanationFa: 'داروهای مصرفی روزانه یا بیماری‌های زمینه‌ای (دیابت، فشار خون، آسم...).',
              },
              {
                fieldKey: 'gp_signature_date',
                labelEn: '8. Signature & Date',
                boxLabel: 'Box 8 - Patient Signature & Date',
                fieldNumber: 8,
                placeholderText: 'Patient Signature / Date DD/MM/YYYY',
                explanationFa: 'امضا و تاریخ روز ثبت‌نام.',
              },
            ],
          },
        ],
      },
    ],
  },

  council_housing: {
    title: 'Council Housing & Homelessness Assistance Inquiry',
    formCode: 'LAD-HOUSING-INQ-2026',
    issuingAuthority: 'Local City Council Housing Department',
    pages: [
      {
        pageNumber: 1,
        title: 'Section 1 & 2: Personal Details & Eviction Notice',
        headerText: 'LOCAL CITY COUNCIL - HOUSING & HOMELESSNESS ADVICE',
        departmentLogo: 'Local Council',
        sections: [
          {
            title: 'Section 1: Applicant Details & Urgency',
            fields: [
              {
                fieldKey: 'ch_full_name',
                labelEn: '1. Applicant Full Name & National Insurance / HO Ref',
                boxLabel: 'Box 1 - Full Name & Ref',
                fieldNumber: 1,
                placeholderText: 'Full Name / HO Ref or NINO',
                explanationFa: 'نام کامل و شماره مرجع هوم آفیس یا اینشورنس.',
              },
              {
                fieldKey: 'ch_housing_crisis',
                labelEn: '2. Current Housing Crisis & NASS Eviction Notice Status',
                boxLabel: 'Box 2 - Housing Emergency Reason',
                fieldNumber: 2,
                placeholderText: 'e.g. 28-day NASS Notice to Quit after Refugee Status',
                explanationFa: 'علت بحران مسکن (مانند دریافت نامه تخلیه ۲۸ روزه پناهندگی از هوم آفیس).',
                ukConceptNote: 'When you are granted Refugee Status in the UK, you receive a 28-day Notice to Quit from NASS asylum accommodation. You must inform the local council housing team immediately to avoid homelessness.',
              },
              {
                fieldKey: 'ch_eviction_deadline',
                labelEn: '3. Notice Expiry / Eviction Date',
                boxLabel: 'Box 3 - Eviction Deadline Date',
                fieldNumber: 3,
                placeholderText: 'DD / MM / YYYY (e.g. 15th September)',
                explanationFa: 'تاریخ مهلت نهایی تخلیه هتل یا خانه پناهندگی.',
              },
              {
                fieldKey: 'ch_household_members',
                labelEn: '4. Household Members (Adults & Children)',
                boxLabel: 'Box 4 - Household Composition',
                fieldNumber: 4,
                placeholderText: 'Number of adults, number of children under 18',
                explanationFa: 'تعداد اعضای خانواده (بزرگسالان و کودکان زیر ۱۸ سال).',
              },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        title: 'Section 3 & 4: Medical Needs & Local Connection',
        headerText: 'LOCAL CITY COUNCIL HOUSING - PAGE 2',
        departmentLogo: 'Local Council',
        sections: [
          {
            title: 'Section 3: Medical Needs & Local Connection',
            fields: [
              {
                fieldKey: 'ch_medical_needs',
                labelEn: '5. Medical Mobility / Disability Requirements',
                boxLabel: 'Box 5 - Medical & Access Needs',
                fieldNumber: 5,
                placeholderText: 'Wheelchair access, Ground floor required, Pregnancy',
                explanationFa: 'نیازمندی‌های پزشکی مسکن (طبقه همکف، ویلچر، بارداری).',
                ukConceptNote: 'In UK council housing assessments, priority is given to households with medical vulnerabilities, mobility needs, or expectant mothers.',
              },
              {
                fieldKey: 'ch_local_connection',
                labelEn: '6. Local Connection Rationale (Why this council area?)',
                boxLabel: 'Box 6 - Local Connection Reason',
                fieldNumber: 6,
                placeholderText: 'Child school, GP registration, NASS accommodation location',
                explanationFa: 'دلیل ارتباط شما با این شهرداری (مدرسه فرزندان، پزشک جی‌پی، محل هتل پناهجویی).',
                ukConceptNote: 'UK councils require a "Local Connection" (living in the area during asylum, children in local schools, or close family) to accept housing duty.',
              },
              {
                fieldKey: 'ch_contact_phone',
                labelEn: '7. Direct Contact Telephone Number',
                boxLabel: 'Box 7 - Contact Phone',
                fieldNumber: 7,
                placeholderText: '07xxx xxxxxx (Active UK number for Housing Officer)',
                explanationFa: 'شماره تلفن مستقیم جهت تماس فوری مأمور مسکن شهرداری.',
              },
              {
                fieldKey: 'ch_declaration',
                labelEn: '8. Declaration & Consent to Share Data',
                boxLabel: 'Box 8 - Declaration Consent',
                fieldNumber: 8,
                placeholderText: 'Confirmed and agreed',
                explanationFa: 'رضایت‌نامه اشتراک اطلاعات با سازمان‌های حمایتی.',
              },
            ],
          },
        ],
      },
    ],
  },
};
