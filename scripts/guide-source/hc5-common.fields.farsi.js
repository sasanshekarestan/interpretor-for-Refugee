/**
 * What each box on an HC5 refund form is asking for, in plain Persian.
 *
 * The four HC5 forms have 359 boxes between them, and almost none of them are
 * different from each other: "Surname", "Sort code 1", "Group 3 check box 4 -
 * Income support" recur across all four with only the noun in the middle of
 * the form changing. So the Persian is written once per kind of box here and
 * matched across every form, which is cheaper to write and impossible to let
 * drift apart.
 *
 * Rules followed throughout, the same ones the assistant is held to:
 *  - never say what a person should answer about their own circumstances;
 *  - never state anything the form does not itself say;
 *  - examples show the FORMAT only and are obviously invented.
 *
 * A box that matches nothing here is simply not cached, and the app explains
 * it on demand as before. That is the right outcome for the boxes whose
 * internal names are too vague to be sure of - HC5(O) in particular names half
 * its tick boxes "Check Box3" through "Check Box18", and a confident guess
 * about which of those is the war pension box would be worse than a pause.
 */

/** The office-only boxes. Naming them stops a person filling them in. */
const OFFICE = {
  labelFa: 'فقط برای اداره',
  meaningFa: 'این کادر مال کارمند اداره است.',
  whatToWriteFa: 'چیزی ننویسید. این قسمت را اداره پر می‌کند.',
};

const money = (what) => ({
  labelFa: what,
  meaningFa: `${what}، به پوند.`,
  whatToWriteFa: 'مبلغ را با پوند و پنس بنویسید، همان‌طور که روی رسید است.',
  exampleAnswer: 'مثال: 25.80',
});

const datePart = (part, what) => ({
  labelFa: `${what} — ${part}`,
  meaningFa: `${part} از ${what}. تاریخ میلادی است، نه شمسی.`,
  whatToWriteFa:
    part === 'سال'
      ? 'چهار رقم سال میلادی.'
      : 'دو رقم. اگر عدد یک‌رقمی است، اول آن صفر بگذارید.',
  exampleAnswer: part === 'سال' ? 'مثال: 2026' : 'مثال: 03',
});

/**
 * @param {object} form
 * @param {string} form.paidFor  what the money was paid for, mid-sentence
 * @param {string} form.who      how the form describes the patient
 */
export const hc5Fields = ({ paidFor, who, extra = [] }) => {
  const patterns = [
    // Boxes only one of the four forms has, matched before the shared list.
    ...extra,

    // ---- office use, first so nothing else claims them ------------------
    [/caseworker|our reference|office check|date received|authorisation|official use|payment (amount|date)|^notes$|office address|partial amount|step \d|confirm check box|p1 refund/i, OFFICE],

    // ---- Part 1: who the patient is -------------------------------------
    [/^(g2 - |p2 )?surname$/i, {
      labelFa: 'نام خانوادگی (Surname)',
      meaningFa: `نام خانوادگی کسی که ${who}.`,
      whatToWriteFa: 'همان‌طور که در مدارک رسمی شما نوشته شده، با حروف بزرگ انگلیسی.',
      exampleAnswer: 'مثال: AHMADI',
    }],
    [/^(p2 - )?forename|^other names$|^forename$/i, {
      labelFa: 'نام (Forename / Other names)',
      meaningFa: `نام کوچک کسی که ${who}. اگر نام میانی دارید، اینجا می‌آید.`,
      whatToWriteFa: 'با حروف بزرگ انگلیسی، همان‌طور که در مدارک شما نوشته شده.',
      exampleAnswer: 'مثال: ALI REZA',
    }],
    [/title *mr/i, {
      labelFa: 'عنوان (Title)',
      meaningFa: 'Mr برای آقا، Mrs برای خانم متأهل، Miss برای خانم مجرد، Ms بدون اشاره به وضعیت تأهل، یا هر عنوان دیگری.',
      whatToWriteFa: 'یکی از این‌ها را بنویسید. اگر هیچ‌کدام را نمی‌خواهید، Ms رایج‌ترین انتخاب بی‌طرف است.',
      exampleAnswer: 'مثال: Mr',
    }],
    [/male check|female check|^sex/i, {
      labelFa: 'جنسیت (Sex)',
      meaningFa: 'فرم فقط دو کادر دارد: Male یعنی مرد، Female یعنی زن.',
      whatToWriteFa: 'یکی را تیک بزنید.',
    }],
    [/nhs number/i, {
      labelFa: 'شمارهٔ NHS',
      meaningFa: 'یک شمارهٔ ده‌رقمی که وقتی نزد پزشک عمومی ثبت‌نام می‌کنید به شما داده می‌شود. بالای نامه‌های درمانگاه و بیمارستان نوشته شده.',
      whatToWriteFa: 'اگر ندارید یا پیدایش نمی‌کنید، این کادر را خالی بگذارید یا N/A بنویسید.',
      exampleAnswer: 'مثال: 123 456 7890',
    }],
    [/national insurance|nat insurance/i, {
      labelFa: 'شمارهٔ بیمهٔ ملی (National Insurance number)',
      meaningFa: 'شماره‌ای با دو حرف، شش رقم و یک حرف آخر. روی کارت بیمهٔ ملی، فیش حقوقی یا نامه‌های ادارهٔ کار (DWP) نوشته شده.',
      whatToWriteFa: 'کادرها هر کدام یک بخش از شماره را می‌گیرند. اگر ندارید، خالی بگذارید.',
      exampleAnswer: 'مثال: QQ 12 34 56 C',
    }],
    [/date of birth.*day|^date of birth - day|day.*date of birth|date of birth1/i, datePart('روز', 'تاریخ تولد')],
    [/date of birth.*month|date of birth2/i, datePart('ماه', 'تاریخ تولد')],
    [/date of birth.*year|date of birth3/i, datePart('سال', 'تاریخ تولد')],

    // ---- addresses and contact ------------------------------------------
    [/^(part \d - |p\d |declaration |4b |5b |g3 )?address\s*\d*$/i, {
      labelFa: 'آدرس',
      meaningFa: 'آدرس محل زندگی، با شمارهٔ خانه و نام خیابان و شهر.',
      whatToWriteFa: 'به انگلیسی و با حروف بزرگ بنویسید.',
      exampleAnswer: 'مثال: 25 PARK LANE, MANCHESTER',
    }],
    [/post ?code|pcode/i, {
      labelFa: 'کد پستی (Postcode)',
      meaningFa: 'کد پستی بریتانیا، شش یا هفت کاراکتر با یک فاصله در میان.',
      whatToWriteFa: 'با حروف بزرگ. روی نامه‌هایی که به دستتان می‌رسد نوشته شده.',
      exampleAnswer: 'مثال: M14 5TP',
    }],
    [/email/i, {
      labelFa: 'ایمیل',
      meaningFa: 'برای وقتی که لازم شود دربارهٔ همین درخواست با شما تماس بگیرند.',
      whatToWriteFa: 'اگر ایمیل ندارید، خالی بگذارید.',
    }],
    [/telephone|phone number/i, {
      labelFa: 'شمارهٔ تلفن',
      meaningFa: 'شماره‌ای که در ساعات روز در دسترس باشد.',
      whatToWriteFa: 'شمارهٔ موبایل بریتانیا کافی است.',
      exampleAnswer: 'مثال: 07700 900123',
    }],
    [/name if different from patient/i, {
      labelFa: 'نام، اگر با نام بیمار فرق دارد',
      meaningFa: 'اگر باید دربارهٔ این درخواست با شخص دیگری تماس بگیرند، نام او.',
      whatToWriteFa: 'اگر خودتان بیمار هستید، خالی بگذارید یا N/A بنویسید.',
    }],

    // ---- Part 2: what was paid ------------------------------------------
    [/amount paid|charges paid|refund amount|i wish to claim a refund|visit amount|payment of/i, money(`مبلغی که برای ${paidFor} پرداخته‌اید`)],
    [/escort amount/i, {
      labelFa: 'مبلغ همراه (escort)',
      meaningFa: 'اگر کسی مجبور بوده به عنوان همراه با شما بیاید، مبلغی که او برای همان سفر پرداخته.',
      whatToWriteFa: 'اگر همراهی نداشته‌اید، خالی بگذارید.',
      exampleAnswer: 'مثال: 8.20',
    }],
    [/treatment start date.*day/i, datePart('روز', 'تاریخ شروع درمان')],
    [/treatment start date.*month/i, datePart('ماه', 'تاریخ شروع درمان')],
    [/treatment start date.*year/i, datePart('سال', 'تاریخ شروع درمان')],
    [/treatment end date.*day/i, datePart('روز', 'تاریخ پایان درمان')],
    [/treatment end date.*month/i, datePart('ماه', 'تاریخ پایان درمان')],
    [/treatment end date.*year/i, datePart('سال', 'تاریخ پایان درمان')],
    [/^date \d - day$|^paid on1$|travel costs date - day/i, datePart('روز', 'تاریخ پرداخت')],
    [/^date \d - month$|^paid on2$|travel costs date - month/i, datePart('ماه', 'تاریخ پرداخت')],
    [/^date \d - year$|^paid on3$|travel costs date - year/i, datePart('سال', 'تاریخ پرداخت')],
    [/integrated care board/i, {
      labelFa: 'نام Integrated Care Board منطقهٔ شما',
      meaningFa: 'ICB سازمان NHS منطقه‌ای است که آدرس شما در آن قرار دارد.',
      whatToWriteFa: 'اگر نمی‌دانید کدام است، از پذیرش درمانگاه یا بیمارستان بپرسید.',
    }],
    [/who referred you|referred by/i, {
      labelFa: 'نام کسی که شما را ارجاع داده',
      meaningFa: 'نام پزشک، دندان‌پزشک یا اپتومتریستی که شما را برای این درمان فرستاده.',
      whatToWriteFa: 'در نامهٔ ارجاع (referral letter) نوشته شده.',
    }],
    [/treatment address|p2\. address/i, {
      labelFa: 'آدرس محل درمان',
      meaningFa: 'آدرس بیمارستان، مطب یا جایی که درمان شده‌اید.',
      whatToWriteFa: 'روی نامهٔ نوبت یا نامهٔ ارجاع شما نوشته شده.',
    }],
    [/^p2 - name$/i, {
      labelFa: 'نام محل درمان',
      meaningFa: 'نام مطب، عینک‌فروشی یا سازمانی که درمان یا وسیله را داده.',
      whatToWriteFa: 'روی رسید یا نامهٔ ارجاع شما نوشته شده.',
    }],
    [/department attended/i, {
      labelFa: 'بخشی که به آن مراجعه کرده‌اید',
      meaningFa: 'بخش بیمارستان، مثل چشم‌پزشکی یا ارتوپدی.',
      whatToWriteFa: 'در نامهٔ نوبت شما نوشته شده.',
    }],
    [/treatment reference number/i, {
      labelFa: 'شمارهٔ پروندهٔ درمان',
      meaningFa: 'شماره‌ای که بیمارستان به درمان شما داده.',
      whatToWriteFa: 'روی نامهٔ نوبت یا نامهٔ ارجاع نوشته شده. اگر پیدایش نمی‌کنید، از محل درمان بپرسید.',
    }],

    // ---- Part 3: where the money goes -----------------------------------
    [/name.*account holder|names of account holders/i, {
      labelFa: 'نام صاحب حساب',
      meaningFa: 'نام کسی که حساب به نام اوست، همان‌طور که بانک آن را ثبت کرده.',
      whatToWriteFa: 'اگر حساب مشترک است، هر دو نام.',
    }],
    [/full name of bank/i, {
      labelFa: 'نام بانک',
      meaningFa: 'نام کامل بانک یا building society یا هر مؤسسه‌ای که حساب در آن است.',
      exampleAnswer: 'مثال: BARCLAYS BANK',
      whatToWriteFa: 'روی کارت بانکی یا صورتحساب شما نوشته شده.',
    }],
    [/sort ?code/i, {
      labelFa: 'sort code',
      meaningFa: 'شمارهٔ شش‌رقمی شعبهٔ بانک، که در سه جفت نوشته می‌شود. با شمارهٔ حساب فرق دارد.',
      whatToWriteFa: 'روی کارت بانکی یا در اپلیکیشن بانک هست. هر کادر دو رقم می‌گیرد.',
      exampleAnswer: 'مثال: 20 45 89',
    }],
    [/account number/i, {
      labelFa: 'شمارهٔ حساب',
      meaningFa: 'شمارهٔ حساب بانکی، معمولاً هشت رقم.',
      whatToWriteFa: 'روی کارت بانکی یا در اپلیکیشن بانک هست.',
      exampleAnswer: 'مثال: 12345678',
    }],
    [/roll or reference|building society ref/i, {
      labelFa: 'شمارهٔ roll یا reference',
      meaningFa: 'بعضی حساب‌های building society یک شمارهٔ اضافه دارند به اسم roll number.',
      whatToWriteFa: 'خود فرم می‌گوید اگر مطمئن نیستید حسابتان چنین شماره‌ای دارد یا نه، از building society بپرسید. حساب بانک معمولی این را ندارد.',
    }],

    // ---- Part 4: why you are entitled -----------------------------------
    [/group 1 check|^group 1$/i, {
      labelFa: 'گروه ۱ — مستمری جانبازی',
      meaningFa: 'برای کسی که مستمری جانبازی (War Pension) یا پرداخت Armed Forces Compensation Scheme می‌گرفته و برای همان ناتوانی پذیرفته‌شده درمان می‌شده.',
      whatToWriteFa: 'اگر به شما مربوط نیست، تیک نزنید.',
    }],
    [/hc2.*hc3|certificate hc2/i, {
      labelFa: 'گروه ۲ — گواهی HC2 یا HC3',
      meaningFa: 'HC2 گواهی معافیت کامل از هزینه‌های درمانی است و HC3 معافیت جزئی. اگر نامتان روی یکی از این‌ها بوده، این گروه به شما مربوط است.',
      whatToWriteFa: 'شمارهٔ گواهی را در کادر No. بنویسید.',
    }],
    [/^cert (no|number)$|hc2 \/ hc3 cert/i, {
      labelFa: 'شمارهٔ گواهی',
      meaningFa: 'شمارهٔ همان گواهی که تیک زده‌اید.',
      whatToWriteFa: 'روی خود گواهی نوشته شده.',
    }],
    [/pregnant check|maternity exemption/i, {
      labelFa: 'بارداری یا زایمان در ۱۲ ماه گذشته',
      meaningFa: 'اگر باردار بوده‌اید یا در ۱۲ ماه گذشته بچه به دنیا آورده‌اید، درمان دندان NHS برایتان رایگان است.',
      whatToWriteFa: 'شمارهٔ گواهی معافیت بارداری را بنویسید. خود فرم می‌گوید اگر گواهی ندارید، کپی MATB1 یا شناسنامهٔ نوزاد را بفرستید.',
    }],
    [/under 18 years of age/i, {
      labelFa: 'زیر ۱۸ سال',
      meaningFa: 'اگر روز اول درمان زیر ۱۸ سال داشته‌اید.',
      whatToWriteFa: 'فقط تیک بزنید.',
    }],
    [/18 years old and in qualifying/i, {
      labelFa: '۱۸ ساله و در تحصیل تمام‌وقت',
      meaningFa: 'اگر ۱۸ ساله بوده‌اید و در تحصیل تمام‌وقتِ واجد شرایط.',
      whatToWriteFa: 'خود فرم می‌گوید نامه‌ای از محل تحصیلتان را همراه فرم بفرستید.',
    }],
    [/universal credit|check box 3 - uc/i, {
      labelFa: 'Universal Credit',
      meaningFa: 'خود فرم شرطش را نوشته: در آخرین دورهٔ کامل ارزیابی پیش از پرداخت، درآمد خالص شما ۴۳۵ پوند یا کمتر بوده باشد، یا ۹۳۵ پوند یا کمتر اگر عنصر فرزند داشته‌اید یا توان کاری محدود.',
      whatToWriteFa: 'اگر مطمئن نیستید، شرط‌ها در www.nhsbsa.nhs.uk/uc نوشته شده.',
    }],
    [/group 3 check box 1$/i, {
      labelFa: 'گروه ۳ — یکی از کمک‌هزینه‌ها',
      meaningFa: 'این کادر اصلی گروه ۳ است: اینکه روز پرداخت، یکی از کمک‌هزینه‌های زیر را می‌گرفته‌اید.',
      whatToWriteFa: 'این را تیک بزنید و بعد کادر خودِ آن کمک‌هزینه را هم تیک بزنید.',
    }],
    [/group 3 check box 2$/i, {
      labelFa: 'گروه ۳ — شریک زندگی یا فرزند تحت تکفل',
      meaningFa: 'اگر خودتان کمک‌هزینه را نمی‌گیرید ولی شریک زندگی، یا فرزند یا جوان زیر ۲۰ سالِ تحت تکفلِ کسی هستید که آن را می‌گیرد.',
      whatToWriteFa: 'در این حالت نام و تاریخ تولد یا شمارهٔ بیمهٔ ملی آن شخص را هم می‌خواهد.',
    }],
    [/income support/i, {
      labelFa: 'Income Support',
      meaningFa: 'یکی از کمک‌هزینه‌هایی که با آن این پول به شما برمی‌گردد.',
      whatToWriteFa: 'اگر این را می‌گیرید تیک بزنید. نام دقیق کمک‌هزینه در نامه‌های DWP نوشته شده.',
    }],
    [/jobseeker/i, {
      labelFa: "income-based Jobseeker's Allowance",
      meaningFa: 'فقط نوع income-based آن حساب می‌شود، نه نوع contribution-based.',
      whatToWriteFa: 'نوع دقیق آن در نامه‌های DWP نوشته شده. اگر مطمئن نیستید، پیش از امضا بپرسید.',
    }],
    [/employment and support/i, {
      labelFa: 'income-related Employment and Support Allowance',
      meaningFa: 'فقط نوع income-related آن حساب می‌شود، نه نوع contribution-based.',
      whatToWriteFa: 'نوع دقیق آن در نامه‌های DWP نوشته شده.',
    }],
    [/pension credit/i, {
      labelFa: 'Pension Credit Guarantee Credit',
      meaningFa: 'بخش Guarantee Credit از Pension Credit. بخش Savings Credit به تنهایی حساب نمی‌شود.',
      whatToWriteFa: 'در نامهٔ Pension Service نوشته شده کدام بخش را می‌گیرید.',
    }],
    [/not in groups 1 to 3|group 4 check/i, {
      labelFa: 'گروه ۴ — درآمد کم',
      meaningFa: 'برای کسی که در هیچ‌کدام از گروه‌های ۱ تا ۳ نیست ولی درآمدش کم است.',
      whatToWriteFa: 'در این حالت باید فرم HC1 طرح کمک به کم‌درآمدها را هم پر کنید و همراه این فرم بفرستید.',
    }],
    [/hc1 form/i, {
      labelFa: 'شمارهٔ مرجع HC1',
      meaningFa: 'اگر درخواست HC1 را آنلاین داده‌اید، شمارهٔ مرجعی که به شما داده‌اند.',
      whatToWriteFa: 'اگر HC1 نداده‌اید یا کاغذی فرستاده‌اید، خالی بگذارید.',
    }],
    [/group 3 name|^name$/i, {
      labelFa: 'نام کسی که کمک‌هزینه را می‌گیرد',
      meaningFa: 'فقط اگر نام روی کمک‌هزینه با نام بیمار فرق دارد.',
      whatToWriteFa: 'اگر خودتان همان شخص هستید، خالی بگذارید.',
    }],

    // ---- the declaration -------------------------------------------------
    [/signature|signture/i, {
      labelFa: 'امضا',
      meaningFa: 'کادر A برای وقتی است که درخواست خودتان است؛ کادر B برای وقتی که برای شخص دیگری درخواست می‌دهید. فقط یکی را امضا کنید.',
      whatToWriteFa: 'امضای دست‌نویس. خود فرم می‌گوید کسی که نمی‌تواند امضا کند می‌تواند علامت بگذارد.',
    }],
    [/name in capitals/i, {
      labelFa: 'نام با حروف بزرگ',
      meaningFa: 'نام کسی که امضا کرده، خوانا و با حروف بزرگ انگلیسی.',
      exampleAnswer: 'مثال: ALI AHMADI',
      whatToWriteFa: 'اگر خودتان بیمار هستید، همان نام Part 1.',
    }],
    [/relation to patient/i, {
      labelFa: 'نسبت شما با بیمار',
      meaningFa: 'فقط اگر برای شخص دیگری درخواست می‌دهید.',
      whatToWriteFa: 'به انگلیسی، مثل mother، son، friend یا support worker.',
    }],
    [/5[ab] - date|4[ab] signature date|part 5 - signature|p[24] date (day|month|year)|p3 date (day|month|year)/i, {
      labelFa: 'تاریخ امضا',
      meaningFa: 'روزی که فرم را امضا می‌کنید، به میلادی.',
      whatToWriteFa: 'روز، ماه و سال میلادی.',
      exampleAnswer: 'مثال: 21 06 2026',
    }],
  ];

  return (name) => {
    const text = String(name || '');
    for (const [pattern, guide] of patterns) {
      if (pattern.test(text)) return guide;
    }
    return null;
  };
};
