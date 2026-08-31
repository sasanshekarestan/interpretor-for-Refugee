/**
 * What each box on HC1 is asking for, in plain Persian.
 *
 * HC1 has over five hundred boxes, but only a few dozen kinds of box: the same
 * "surname", "date of birth", "how much do you get" repeated down seven rows
 * and across two columns. So the Persian is written once per kind here and
 * expanded across every box that matches, which is both cheaper and more
 * consistent than describing each box separately.
 *
 * Rules followed throughout, the same ones the assistant is held to:
 *  - never say what a person should answer about their own circumstances;
 *  - never state anything the form does not itself say;
 *  - examples show the FORMAT only and are obviously invented.
 *
 * A box that matches nothing here is simply not cached, and the app explains
 * it on demand as before. That is the right outcome for the handful of boxes
 * whose internal names are too vague to be sure of.
 */

/** "row 3" / "Row 3" -> ۳, so the Persian can say which line is meant. */
const persianDigits = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const rowOf = (name) => {
  const m = name.match(/\brow\s*(\d+)/i);
  return m ? ` (ردیف ${persianDigits(m[1])})` : '';
};
const personOf = (name) => {
  const m = name.match(/\bP(\d)\b/i);
  return m ? ` (نفر ${persianDigits(m[1])})` : '';
};
/** Whose column this box sits in. HC1 asks almost everything twice. */
const whose = (name) =>
  /partner|prtner/i.test(name) ? ' — ستون شریک زندگی شما' : /\byou\b|your\b/i.test(name) ? ' — ستون خودتان' : '';

const ROWS = (name) => rowOf(name) + personOf(name);

const patterns = [
  // ---- Part 1.1: which refund is being claimed -------------------------
  [
    /1\.1.*prescription/i,
    {
      labelFa: 'بازپرداخت هزینهٔ نسخه',
      meaningFa:
        'این کادر مربوط به پس گرفتن پولی است که بابت نسخه و داروی NHS پرداخته‌اید. تیک زدن آن یعنی می‌خواهید این پول را پس بگیرید.',
      whatToWriteFa: 'فقط یک تیک. اگر بابت دارو پول داده‌اید و می‌خواهید پس بگیرید، تیک بزنید؛ وگرنه خالی بگذارید.',
      cautionFa:
        'برای پس گرفتن پول دارو باید رسید FP57 را ضمیمه کنید. این رسید را باید همان لحظهٔ پرداخت از داروخانه بگیرید — بعداً نمی‌دهند.',
    },
  ],
  [
    /1\.1.*dental/i,
    {
      labelFa: 'بازپرداخت هزینهٔ دندان‌پزشکی',
      meaningFa: 'این کادر مربوط به پس گرفتن پولی است که بابت درمان دندان در NHS پرداخته‌اید.',
      whatToWriteFa: 'فقط یک تیک، اگر می‌خواهید این پول را پس بگیرید.',
      cautionFa: 'برای بازپرداخت به رسید و فرم HC5 نیاز دارید، و مهلتش سه ماه از روز پرداخت است.',
    },
  ],
  [
    /1\.1.*sight test/i,
    {
      labelFa: 'بازپرداخت هزینهٔ تست چشم',
      meaningFa: 'این کادر مربوط به پس گرفتن پولی است که بابت معاینهٔ چشم پرداخته‌اید.',
      whatToWriteFa: 'فقط یک تیک، اگر می‌خواهید این پول را پس بگیرید.',
      cautionFa: 'مهلت بازپرداخت تست چشم سه ماه از تاریخ خودِ تست است.',
    },
  ],
  [
    /1\.1.*(glasses|contact len)/i,
    {
      labelFa: 'بازپرداخت هزینهٔ عینک یا لنز',
      meaningFa: 'این کادر مربوط به پس گرفتن پولی است که بابت عینک یا لنز تماسی پرداخته‌اید.',
      whatToWriteFa: 'فقط یک تیک، اگر می‌خواهید این پول را پس بگیرید.',
      cautionFa: 'برای عینک و لنز، علاوه بر رسید و فرم HC5، نسخهٔ چشم‌پزشکی‌تان را هم لازم دارند.',
    },
  ],
  [
    /1\.1.*wig/i,
    {
      labelFa: 'بازپرداخت هزینهٔ کلاه‌گیس یا پوشش پارچه‌ای',
      meaningFa: 'این کادر مربوط به پس گرفتن پولی است که بابت کلاه‌گیس یا پوشش‌های پارچه‌ای پزشکی NHS پرداخته‌اید.',
      whatToWriteFa: 'فقط یک تیک، اگر می‌خواهید این پول را پس بگیرید.',
    },
  ],
  [
    /1\.1.*travel/i,
    {
      labelFa: 'بازپرداخت هزینهٔ رفت‌وآمد درمان',
      meaningFa:
        'این کادر مربوط به پس گرفتن پول رفت‌وآمدی است که برای درمان NHS پرداخته‌اید — به شرطی که پزشک، دندان‌پزشک یا اپتومتریست شما را معرفی کرده باشد.',
      whatToWriteFa: 'فقط یک تیک، اگر می‌خواهید این پول را پس بگیرید.',
    },
  ],

  // ---- Part 1.2 / 1.3: you and your partner ----------------------------
  [
    /1\.2.*partner\s*no/i,
    {
      labelFa: 'شریک زندگی ندارم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید شریک زندگی (partner) ندارید. در این فرم partner یعنی کسی که با او مثل یک زوج زندگی می‌کنید، چه ازدواج کرده باشید چه نه.',
      whatToWriteFa: 'فقط یک تیک. بعد از آن، فقط به سؤال‌هایی جواب بدهید که به خودتان مربوط است.',
    },
  ],
  [
    /1\.2.*partner\s*yes/i,
    {
      labelFa: 'شریک زندگی دارم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید شریک زندگی (partner) دارید. در این فرم partner یعنی کسی که با او مثل یک زوج زندگی می‌کنید، چه ازدواج کرده باشید چه نه، هم‌جنس یا غیرهم‌جنس.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa:
        'اگر این را تیک بزنید، از اینجا به بعد باید دربارهٔ درآمد و پس‌انداز هر دوی خودتان هم جواب بدهید، نه فقط خودتان.',
    },
  ],
  [
    /surname|family name/i,
    (name) => ({
      labelFa: `نام خانوادگی${ROWS(name)}${whose(name)}`,
      meaningFa: 'نام خانوادگی، همان‌طور که در مدارک رسمی نوشته شده.',
      whatToWriteFa: 'نام خانوادگی را با حروف بزرگ انگلیسی بنویسید. فرم می‌گوید همه چیز را BLOCK CAPITALS بنویسید.',
      exampleAnswer: 'AHMADI',
    }),
  ],
  [
    /first name/i,
    (name) => ({
      labelFa: `نام${ROWS(name)}${whose(name)}`,
      meaningFa: 'نام کوچک، همان‌طور که در مدارک رسمی نوشته شده.',
      whatToWriteFa: 'نام کوچک را با حروف بزرگ انگلیسی بنویسید.',
      exampleAnswer: 'MARYAM',
    }),
  ],
  [
    /title\s*-\s*mr/i,
    (name) => ({
      labelFa: `عنوان${whose(name)}`,
      meaningFa: 'عنوانی که پیش از نام می‌آید: Mr برای آقا، Mrs برای خانم متأهل، Miss برای خانم مجرد، Ms بدون اشاره به وضع تأهل.',
      whatToWriteFa: 'یکی از این‌ها را بنویسید، یا اگر عنوان دیگری دارید خودش را بنویسید.',
      exampleAnswer: 'Ms',
    }),
  ],
  [
    /dob\s*day/i,
    (name) => ({
      labelFa: `روز تولد${ROWS(name)}${whose(name)}`,
      meaningFa: 'روزِ تاریخ تولد. تاریخ در بریتانیا به میلادی نوشته می‌شود.',
      whatToWriteFa: 'فقط روز، با دو رقم.',
      exampleAnswer: '15',
      cautionFa: 'تاریخ را میلادی بنویسید، نه شمسی.',
    }),
  ],
  [
    /dob\s*month/i,
    (name) => ({
      labelFa: `ماه تولد${ROWS(name)}${whose(name)}`,
      meaningFa: 'ماهِ تاریخ تولد، به میلادی.',
      whatToWriteFa: 'فقط ماه، با دو رقم.',
      exampleAnswer: '08',
      cautionFa: 'تاریخ را میلادی بنویسید، نه شمسی.',
    }),
  ],
  [
    /dob\s*year/i,
    (name) => ({
      labelFa: `سال تولد${ROWS(name)}${whose(name)}`,
      meaningFa: 'سالِ تاریخ تولد، به میلادی و با چهار رقم.',
      whatToWriteFa: 'فقط سال، با چهار رقم.',
      exampleAnswer: '1994',
      cautionFa: 'تاریخ را میلادی بنویسید، نه شمسی.',
    }),
  ],
  [
    /nhs number/i,
    (name) => ({
      labelFa: `شمارهٔ NHS${whose(name)}`,
      meaningFa:
        'شمارهٔ NHS شمارهٔ ده‌رقمی شماست در سامانهٔ درمان بریتانیا. روی نامه‌های NHS و در اپلیکیشن NHS نوشته شده. اینجا آن را در سه قسمت می‌نویسند: ۳ رقم، بعد ۳ رقم، بعد ۴ رقم.',
      whatToWriteFa: 'قسمت مربوط به همین کادر از شمارهٔ ده‌رقمی را بنویسید.',
      exampleAnswer: '485 777 3456',
      cautionFa: 'اگر شمارهٔ NHS ندارید یا نمی‌دانید، این قسمت را خالی بگذارید — نبودنش جلوی درخواست شما را نمی‌گیرد.',
    }),
  ],
  [
    /1\.3 address and postcode/i,
    {
      labelFa: 'آدرس و کدپستی',
      meaningFa: 'آدرس جایی که الان در بریتانیا زندگی می‌کنید، همراه با کدپستی.',
      whatToWriteFa: 'آدرس کامل با حروف بزرگ انگلیسی، و کدپستی در آخر.',
      exampleAnswer: '12 GREEN ROAD, LEEDS, LS1 4AB',
      cautionFa: 'جواب اداره به همین آدرس پست می‌شود، پس مطمئن شوید درست است.',
    },
  ],
  [
    /e-?mail/i,
    {
      labelFa: 'ایمیل',
      meaningFa: 'نشانی ایمیل شما، اگر دارید.',
      whatToWriteFa: 'نشانی ایمیلتان. اگر ایمیل ندارید، خالی بگذارید.',
      exampleAnswer: 'name@example.com',
    },
  ],
  [
    /mobile number/i,
    {
      labelFa: 'شمارهٔ موبایل',
      meaningFa: 'شمارهٔ تلفن همراه شما، اگر دارید.',
      whatToWriteFa: 'شمارهٔ موبایلتان.',
      exampleAnswer: '07700 900123',
    },
  ],
  [
    /phone number/i,
    {
      labelFa: 'شمارهٔ تلفن',
      meaningFa: 'شمارهٔ تلفنی که بشود با شما تماس گرفت، همراه با کد شهر.',
      whatToWriteFa: 'شمارهٔ تلفن با کد شهر.',
      exampleAnswer: '0113 496 0000',
    },
  ],
  [
    /preferred method of communication/i,
    {
      labelFa: 'راه ترجیحی تماس',
      meaningFa: 'اداره می‌پرسد اگر لازم شد دربارهٔ درخواست شما تماس بگیرند، ترجیح می‌دهید از چه راهی باشد.',
      whatToWriteFa: 'یکی را بنویسید: نامه، تلفن، ایمیل یا پیامک.',
      exampleAnswer: 'Email',
    },
  ],

  // ---- Part 2: children ------------------------------------------------
  [
    /2\.1.*children no/i,
    {
      labelFa: 'بچه‌ای ندارم که با من زندگی کند',
      meaningFa:
        'با تیک زدن این کادر می‌گویید بچه یا جوانی که با شما زندگی کند و خرجش با شما باشد ندارید.',
      whatToWriteFa: 'فقط یک تیک. بعد مستقیم بروید به Part 3.',
    },
  ],
  [
    /2\.1.*children yes/i,
    {
      labelFa: 'بچه دارم که با من زندگی می‌کند',
      meaningFa:
        'با تیک زدن این کادر می‌گویید بچه یا جوانی دارید که با شما زندگی می‌کند و خرجش با شماست. فرم بچه‌های زیر ۱۶ سال، و جوانان ۱۶ تا ۱۹ ساله را که تمام‌وقت درس می‌خوانند یا در دورهٔ کارآموزی تأییدشده‌اند حساب می‌کند.',
      whatToWriteFa: 'فقط یک تیک، و بعد جدول زیرش را پر کنید.',
      cautionFa:
        'کسانی که فقط پیش شما پانسیون‌اند یا بچهٔ تحت سرپرستی موقت (foster) هستند اینجا حساب نمی‌شوند — آن‌ها را در Part 3 بنویسید.',
    },
  ],
  [
    /relationship to you/i,
    (name) => ({
      labelFa: `نسبت با شما${ROWS(name)}`,
      meaningFa: 'این شخص چه نسبتی با شما دارد.',
      whatToWriteFa: 'نسبت را به انگلیسی و با یک کلمه بنویسید.',
      exampleAnswer: 'Son / Daughter / Brother',
    }),
  ],

  // ---- Part 3: other people in the home --------------------------------
  [
    /3\.1 does anyone else live with you no/i,
    {
      labelFa: 'کس دیگری با من زندگی نمی‌کند',
      meaningFa: 'با تیک زدن این کادر می‌گویید غیر از کسانی که در بخش‌های ۱ و ۲ نوشته‌اید، کس دیگری در خانهٔ شما زندگی نمی‌کند.',
      whatToWriteFa: 'فقط یک تیک. بعد بروید به سؤال ۳.۳.',
    },
  ],
  [
    /3\.1 does anyone else live with you yes/i,
    {
      labelFa: 'کس دیگری با من زندگی می‌کند',
      meaningFa:
        'با تیک زدن این کادر می‌گویید کسان دیگری در خانهٔ شما زندگی می‌کنند — مثلاً فامیل یا دوستان. اداره این را می‌پرسد تا هزینهٔ مسکن شما را درست حساب کند.',
      whatToWriteFa: 'فقط یک تیک، و بعد جدول زیرش را برای هر نفر پر کنید.',
      cautionFa:
        'صاحب‌خانه، هم‌مالک و — اگر در خانهٔ سالمندان هستید — بقیهٔ ساکنان را اینجا ننویسید. فرم می‌گوید آن‌ها حساب نمی‌شوند.',
    },
  ],
  [
    /3\.1 p\d age|^3\.1.*\bage\b/i,
    (name) => ({
      labelFa: `سن${personOf(name)}`,
      meaningFa: 'سن این شخص، به سال.',
      whatToWriteFa: 'فقط عدد سن.',
      exampleAnswer: '34',
    }),
  ],
  [
    /3\.1 - p\d income|3\.1.*income$/i,
    (name) => ({
      labelFa: `پول هفتگی این شخص${personOf(name)}`,
      meaningFa:
        'اگر این شخص کار می‌کند، اداره می‌پرسد هر هفته چقدر پول به دستش می‌رسد — درآمد پیش از کسر مالیات و بیمهٔ ملی، به‌علاوهٔ هر پول دیگری که می‌گیرد.',
      whatToWriteFa: 'مبلغ هفتگی به پوند.',
      exampleAnswer: '£180',
      cautionFa:
        'فرم می‌گوید مجبور نیستید این را بگویید؛ ولی اگر درآمد آن شخص کم است، گفتنش ممکن است به نفع شما باشد. Attendance Allowance، DLA و PIP او را در این مبلغ نیاورید.',
    }),
  ],
  // The tick grid in 3.1: thirteen statements, repeated for four people. The
  // form's own box names number them R1-R13 down the printed column, except
  // that rows 3 and 4 were both named R3 by whoever made the PDF - so that one
  // entry has to cover both, and says so rather than guessing.
  [
    /3\.1 check box - p\d r(\d+)/i,
    (name) => {
      const row = Number(name.match(/r(\d+)/i)[1]);
      const rows = {
        1: ['در دورهٔ کارآموزی جوانان است', 'یعنی این شخص در یک دورهٔ youth training شرکت می‌کند.'],
        2: ['دانشجوی تمام‌وقت است', 'یعنی این شخص تمام‌وقت درس می‌خواند.'],
        3: [
          'Income Support یا Pension Credit می‌گیرد',
          'این کادر یکی از این دو سطر است — Income Support یا Pension Credit. فرم برای هر دو یک اسم گذاشته، پس نوشتهٔ کنار خودِ کادر روی کاغذ را نگاه کنید تا ببینید کدام است.',
        ],
        5: [
          'Universal Credit بدون درآمد کاری می‌گیرد',
          'یعنی این شخص Universal Credit می‌گیرد و هیچ درآمدی از کار ندارد.',
        ],
        6: ['Jobseeker’s Allowance می‌گیرد', 'یعنی این شخص income-based Jobseeker’s Allowance می‌گیرد.'],
        7: [
          'Employment and Support Allowance می‌گیرد',
          'یعنی این شخص income-related Employment and Support Allowance می‌گیرد و در گروه work-related activity یا گروه support قرار داده نشده.',
        ],
        8: [
          'بخش daily living از PIP را می‌گیرد',
          'یعنی این شخص بخش «زندگی روزمره» از Personal Independence Payment را می‌گیرد.',
        ],
        9: [
          'بخش مراقبت DLA با نرخ متوسط یا بالا می‌گیرد',
          'یعنی این شخص بخش مراقبت (care component) از Disability Living Allowance را با نرخ متوسط یا بالا می‌گیرد.',
        ],
        10: ['Attendance Allowance می‌گیرد', 'یعنی این شخص Attendance Allowance می‌گیرد.'],
        11: [
          'کم‌بینای شدید یا نابیناست',
          'یعنی این شخص کم‌بینایی شدید دارد یا به عنوان نابینا ثبت شده است.',
        ],
        12: [
          'Armed forces independence payment می‌گیرد',
          'یعنی این شخص Armed forces independence payment می‌گیرد.',
        ],
        13: ['از کار درآمد دارد', 'یعنی این شخص از کار پول در می‌آورد.'],
      };
      const entry = rows[row];
      if (!entry) return null;
      return {
        labelFa: `${entry[0]}${personOf(name)}`,
        meaningFa: `${entry[1]} این ستون از کادرها دربارهٔ کسانی است که با شما در خانه زندگی می‌کنند، نه دربارهٔ خودتان.`,
        whatToWriteFa: 'اگر این جمله دربارهٔ آن شخص درست است تیک بزنید، وگرنه خالی بگذارید.',
      };
    },
  ],
  [
    /3\.1 check box - p\d (yes|no)/i,
    (name) => ({
      labelFa: `۱۶ ساعت یا بیشتر کار می‌کند؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${personOf(name)}`,
      meaningFa:
        'اداره می‌پرسد این شخص به‌طور متوسط هفته‌ای ۱۶ ساعت یا بیشتر کار می‌کند یا نه.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /3\.2 - (no|yes)$/i,
    (name) => ({
      labelFa: /yes/i.test(name) ? 'بله، دو نفرشان زوج‌اند' : 'خیر، هیچ‌کدام زوج نیستند',
      meaningFa:
        'این سؤال می‌پرسد آیا بین کسانی که در سؤال ۳.۱ نام برده‌اید، دو نفر با هم مثل یک زوج زندگی می‌کنند — چه ازدواج کرده باشند چه نه.',
      whatToWriteFa: /yes/i.test(name) ? 'یک تیک، و بعد در ردیف‌های زیرش بنویسید چه کسی partner چه کسی است.' : 'فقط یک تیک.',
    }),
  ],
  [
    /3\.2 - (name|is partner of)/i,
    (name) => ({
      labelFa: `اسم${rowOf(name)}`,
      meaningFa: 'این ردیف می‌گوید کدام دو نفر از ساکنان خانهٔ شما با هم یک زوج هستند: «(اسم) شریک زندگی (اسم) است».',
      whatToWriteFa: 'اسم آن شخص را در این کادر بنویسید.',
      exampleAnswer: 'SARA KARIMI',
    }),
  ],
  [
    /3\.3 do you\/partner have boarders - no/i,
    {
      labelFa: 'پانسیون یا مستأجر ندارم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید کسی به عنوان پانسیون، مستأجر اتاق یا مستأجر فرعی (boarder، lodger، subtenant) با شما زندگی نمی‌کند.',
      whatToWriteFa: 'فقط یک تیک. بعد بروید به Part 4.',
    },
  ],
  [
    /3\.3 do you\/partner have boarders - yes/i,
    {
      labelFa: 'پانسیون یا مستأجر دارم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید کسی به عنوان پانسیون، مستأجر اتاق یا مستأجر فرعی با شما زندگی می‌کند و به شما پول می‌دهد.',
      whatToWriteFa: 'فقط یک تیک، و بعد جدول زیرش را پر کنید.',
      cautionFa: 'کسانی را که عضو خانوادهٔ خودتان‌اند اینجا ننویسید — آن‌ها در سؤال ۳.۱ می‌آیند.',
    },
  ],
  [
    /3\.3 name p\d/i,
    (name) => ({
      labelFa: `اسم پانسیون یا مستأجر${personOf(name)}`,
      meaningFa: 'اسم کسی که به عنوان پانسیون یا مستأجر پیش شما زندگی می‌کند.',
      whatToWriteFa: 'نام و نام خانوادگی آن شخص.',
      exampleAnswer: 'JOHN SMITH',
    }),
  ],
  [
    /3\.3 - how much do they pay/i,
    (name) => ({
      labelFa: `مبلغی که می‌پردازد${personOf(name)}`,
      meaningFa: 'چقدر پول به شما می‌دهد.',
      whatToWriteFa: 'مبلغ به پوند. در کادر «every» کنارش هم بنویسید هر چند وقت یک بار.',
      exampleAnswer: '£90',
    }),
  ],
  [
    /frequency of pay/i,
    (name) => ({
      labelFa: `هر چند وقت یک بار${personOf(name)}`,
      meaningFa: 'این کادر بعد از کلمهٔ «every» می‌آید و می‌پرسد آن مبلغ هر چند وقت یک بار پرداخت می‌شود.',
      whatToWriteFa: 'دوره را به انگلیسی بنویسید.',
      exampleAnswer: 'week / month',
    }),
  ],
  [
    /3\.3 - does it include heating/i,
    (name) => ({
      labelFa: /yes/i.test(name) ? 'بله، شامل گرمایش است' : 'خیر، شامل گرمایش نیست',
      meaningFa: 'اداره می‌پرسد پولی که این شخص به شما می‌دهد شامل هزینهٔ گرمایش هم هست یا نه.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /3\.3 - does it include meals/i,
    (name) => ({
      labelFa: /yes/i.test(name) ? 'بله، شامل غذا است' : 'خیر، شامل غذا نیست',
      meaningFa: 'اداره می‌پرسد پولی که این شخص به شما می‌دهد شامل غذا هم هست یا نه.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],

  // ---- Part 4: savings and property ------------------------------------
  [
    /4\.1 - savings\? no/i,
    {
      labelFa: 'پس‌انداز نداریم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید نه شما و نه شریک زندگی‌تان پس‌انداز یا پول دیگری ندارید — نه در بریتانیا و نه در کشور دیگری.',
      whatToWriteFa: 'فقط یک تیک.',
    },
  ],
  [
    /4\.1 - savings\? yes/i,
    {
      labelFa: 'پس‌انداز داریم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید شما یا شریک زندگی‌تان پس‌انداز، سرمایه‌گذاری یا پول دیگری دارید — چه در بریتانیا چه در کشوری دیگر.',
      whatToWriteFa: 'فقط یک تیک، و بعد پایین‌تر بنویسید چه نوعی و چقدر.',
      cautionFa:
        'اگر شریک زندگی دارید، فرم می‌گوید مجموع پس‌انداز هر دوی شما را بنویسید. اگر روی هم بیش از ۱۶٬۰۰۰ پوند باشد، این کمک تعلق نمی‌گیرد.',
    },
  ],
  [
    /4\.1.*money in acc/i,
    {
      labelFa: 'پول در حساب‌های بانکی',
      meaningFa:
        'پولی که در حساب بانک، building society یا پست‌بانک دارید — هم حساب جاری و هم حساب پس‌انداز.',
      whatToWriteFa: 'مجموع کل پول همهٔ حساب‌ها. اگر مبلغ را نمی‌دانید، فرم می‌گوید آخرین صورتحسابتان را نگاه کنید.',
      exampleAnswer: '£1,250',
    },
  ],
  [
    /premium bonds/i,
    {
      labelFa: 'Premium Bonds',
      meaningFa: 'Premium Bonds یک نوع پس‌انداز دولتی بریتانیاست که به جای سود، قرعه‌کشی ماهانه دارد.',
      whatToWriteFa: 'ارزش اسمی (face value) آن‌ها را بنویسید — یعنی مبلغی که خریده‌اید.',
      exampleAnswer: '£500',
    },
  ],
  [
    /income or capital bonds/i,
    {
      labelFa: 'Income یا Capital Bonds',
      meaningFa: 'این‌ها هم نوعی پس‌انداز دولتی بریتانیا هستند.',
      whatToWriteFa: 'ارزش اسمی (face value) آن‌ها را بنویسید.',
      exampleAnswer: '£300',
    },
  ],
  [
    /shares company name/i,
    (name) => ({
      labelFa: `نام شرکت و نوع سهام${rowOf(name)}`,
      meaningFa: 'اگر سهام دارید، اداره می‌پرسد سهام کدام شرکت است و چه نوعی.',
      whatToWriteFa: 'نام شرکت و نوع سهام را بنویسید.',
      exampleAnswer: 'BP plc - ordinary shares',
    }),
  ],
  [
    /number of shares held/i,
    (name) => ({
      labelFa: `تعداد سهام${rowOf(name)}`,
      meaningFa: 'چند سهم از آن شرکت دارید.',
      whatToWriteFa: 'فقط عدد.',
      exampleAnswer: '200',
    }),
  ],
  [
    /national savings certificates/i,
    {
      labelFa: 'National Savings Certificates',
      meaningFa: 'گواهی پس‌انداز ملی، یک نوع پس‌انداز دولتی بریتانیا.',
      whatToWriteFa: 'تیک بزنید که دارید، و پایین‌تر بنویسید امروز دقیقاً چقدر می‌ارزند.',
    },
  ],
  [
    /how much are they worth/i,
    (name) => ({
      labelFa: `ارزش امروز${rowOf(name)}`,
      meaningFa: 'اداره می‌خواهد بداند این پس‌انداز امروز دقیقاً چقدر می‌ارزد، نه وقتی که خریدید.',
      whatToWriteFa: 'مبلغ به پوند.',
      exampleAnswer: '£750',
    }),
  ],
  [
    /unit trusts/i,
    {
      labelFa: 'unit trusts، PEP و ISA',
      meaningFa:
        'این‌ها انواع سرمایه‌گذاری در بریتانیا هستند. ISA رایج‌ترینشان است — یک حساب پس‌انداز یا سرمایه‌گذاری بدون مالیات.',
      whatToWriteFa: 'ارزش امروزشان را بنویسید، بعد از کم کردن هزینهٔ فروش.',
      exampleAnswer: '£2,000',
    },
  ],
  [
    /a\w{0,2} other money/i,
    {
      labelFa: 'هر پول دیگر',
      meaningFa: 'هر پولی که در دسته‌های بالا نگنجید — مثلاً پول نقدی که در خانه دارید.',
      whatToWriteFa: 'مبلغ به پوند.',
      exampleAnswer: '£150',
    },
  ],
  [
    /4\.2 check box own land no/i,
    {
      labelFa: 'ملک یا زمین نداریم',
      meaningFa: 'با تیک زدن این کادر می‌گویید نه شما و نه شریک زندگی‌تان ملک یا زمینی ندارید.',
      whatToWriteFa: 'فقط یک تیک.',
    },
  ],
  [
    /4\.2 check box own land yes/i,
    {
      labelFa: 'ملک یا زمین داریم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید شما یا شریک زندگی‌تان ملک یا زمینی دارید — در بریتانیا یا در کشوری دیگر.',
      whatToWriteFa: 'فقط یک تیک، و بعد آدرس، ارزش و بدهی آن را بنویسید.',
      cautionFa: 'خانه‌ای که خودتان در آن زندگی می‌کنید حساب نمی‌شود؛ فرم می‌گوید آن را ننویسید.',
    },
  ],
  [
    /4\.2 address of property/i,
    {
      labelFa: 'آدرس ملک یا زمین',
      meaningFa: 'آدرس ملکی که دارید و در آن زندگی نمی‌کنید. می‌تواند در کشور دیگری باشد.',
      whatToWriteFa: 'آدرس کامل، همراه با نام کشور اگر خارج از بریتانیاست.',
    },
  ],
  [
    /4\.2 - what is the value/i,
    {
      labelFa: 'ارزش ملک یا زمین',
      meaningFa: 'اداره می‌پرسد این ملک یا زمین چقدر می‌ارزد.',
      whatToWriteFa: 'مبلغ به پوند.',
      exampleAnswer: '£40,000',
    },
  ],
  [
    /4\.2 - how much if anything is still owed/i,
    {
      labelFa: 'بدهی باقی‌مانده روی ملک',
      meaningFa: 'اگر بابت این ملک هنوز وام یا بدهی دارید، اداره می‌پرسد چقدر باقی مانده.',
      whatToWriteFa: 'مبلغ به پوند. اگر بدهی ندارید، صفر یا «none» بنویسید.',
      exampleAnswer: '£0',
    },
  ],

  // ---- Part 5: benefits and other income --------------------------------
  [
    /5\.1 name of benefit/i,
    (name) => ({
      labelFa: `نام کمک‌هزینه${rowOf(name)}`,
      meaningFa:
        'اسم کمک‌هزینه یا مستمری‌ای که می‌گیرید. فرم می‌گوید هر کدام را در یک ردیف جدا بنویسید، حتی اگر با هم پرداخت می‌شوند.',
      whatToWriteFa: 'اسم انگلیسی همان‌طور که در نامهٔ اداره نوشته شده.',
      exampleAnswer: 'Universal Credit',
      cautionFa:
        'Attendance Allowance، Disability Living Allowance و Personal Independence Payment را اینجا ننویسید — آن‌ها را در سؤال‌های ۵.۳ تا ۵.۵ می‌پرسند. Local Housing Allowance و Council Tax Reduction را هم اصلاً ننویسید.',
    }),
  ],
  [
    /5\.2 type of benefit/i,
    (name) => ({
      labelFa: `نوع درآمد${rowOf(name)}`,
      meaningFa:
        'نوع درآمد دیگری که می‌گیرید و از تأمین اجتماعی نیست — مثلاً Child Tax Credit، مستمری خصوصی، پول از یک خیریه، پول از صندوق امانی، نفقه یا کوپن.',
      whatToWriteFa: 'نوع درآمد را بنویسید.',
      exampleAnswer: 'Child Tax Credit',
      cautionFa: 'درآمد کار را اینجا ننویسید — آن در Part 6 می‌آید. درآمد دانشجویی هم در Part 8 می‌آید.',
    }),
  ],
  [
    /who is it for/i,
    (name) => ({
      labelFa: `برای کیست${rowOf(name)}`,
      meaningFa: 'اداره می‌پرسد این پول برای کیست: شما، شریک زندگی‌تان، یا یکی از بچه‌ها.',
      whatToWriteFa: 'بنویسید مال کیست.',
      exampleAnswer: 'Me / My partner',
    }),
  ],
  [
    /how much do you get/i,
    (name) => ({
      labelFa: `مبلغ${rowOf(name)}`,
      meaningFa: 'چقدر پول می‌گیرید. فرم می‌گوید مبلغ‌ها را دقیق بنویسید تا کمکی که حقتان است به شما برسد.',
      whatToWriteFa: 'مبلغ به پوند. در کادر «every» کنارش بنویسید هر چند وقت یک بار.',
      exampleAnswer: '£368.74',
    }),
  ],
  [
    /5\.[12].*frequency of payment/i,
    (name) => ({
      labelFa: `هر چند وقت یک بار${rowOf(name)}`,
      meaningFa: 'این کادر بعد از کلمهٔ «every» می‌آید و می‌پرسد آن مبلغ هر چند وقت یک بار پرداخت می‌شود.',
      whatToWriteFa: 'دوره را به انگلیسی بنویسید.',
      exampleAnswer: 'week / 4 weeks / month',
    }),
  ],
  [
    /do you\/partner get social sec benefits.*no/i,
    {
      labelFa: 'کمک‌هزینه یا مستمری نمی‌گیریم',
      meaningFa: 'با تیک زدن این کادر می‌گویید نه شما و نه شریک زندگی‌تان هیچ کمک‌هزینه یا مستمری دولتی نمی‌گیرید.',
      whatToWriteFa: 'فقط یک تیک.',
    },
  ],
  [
    /do you\/partner get social sec benefits.*yes/i,
    {
      labelFa: 'کمک‌هزینه یا مستمری می‌گیریم',
      meaningFa:
        'با تیک زدن این کادر می‌گویید شما یا شریک زندگی‌تان کمک‌هزینه یا مستمری دولتی می‌گیرید، و در جدول زیرش هر کدام را جدا می‌نویسید.',
      whatToWriteFa: 'فقط یک تیک، و بعد جدول را پر کنید.',
      cautionFa: 'اگر Universal Credit می‌گیرید، فرم می‌گوید کپی همهٔ صفحات آخرین statement خود را ضمیمه کنید.',
    },
  ],
  [
    /5\.2 check box other income no/i,
    {
      labelFa: 'درآمد دیگری نداریم',
      meaningFa: 'با تیک زدن این کادر می‌گویید غیر از آنچه نوشته‌اید، درآمد دیگری ندارید.',
      whatToWriteFa: 'فقط یک تیک.',
    },
  ],
  [
    /5\.2 check box other income yes/i,
    {
      labelFa: 'درآمد دیگری داریم',
      meaningFa: 'با تیک زدن این کادر می‌گویید درآمد دیگری هم دارید که از تأمین اجتماعی نیست.',
      whatToWriteFa: 'فقط یک تیک، و بعد جدول را پر کنید.',
    },
  ],
  [
    /5\.3.*attendance allowance/i,
    (name) => ({
      labelFa: `Attendance Allowance${/yes/i.test(name) ? ' — بله' : ' — خیر'}${whose(name)}`,
      meaningFa:
        'Attendance Allowance کمک‌هزینه‌ای است برای افراد در سن بازنشستگی که به خاطر بیماری یا معلولیت به مراقبت نیاز دارند.',
      whatToWriteFa: /yes/i.test(name)
        ? 'یک تیک، و بعد تیک بزنید نرخش بالا (High) است یا پایین (Low).'
        : 'فقط یک تیک.',
    }),
  ],
  [
    /5\.3 check box - (high|low) rate/i,
    (name) => ({
      labelFa: `نرخ ${/high/i.test(name) ? 'بالا' : 'پایین'}${whose(name)}`,
      meaningFa: 'Attendance Allowance دو نرخ دارد. در نامهٔ اداره نوشته شده کدام نرخ به شما تعلق گرفته.',
      whatToWriteFa: 'همان نرخی را تیک بزنید که در نامه‌تان نوشته شده.',
    }),
  ],
  [
    /5\.4.*living allowance/i,
    (name) => ({
      labelFa: `Disability Living Allowance${/yes/i.test(name) ? ' — بله' : ' — خیر'}${whose(name)}`,
      meaningFa:
        'Disability Living Allowance (DLA) کمک‌هزینهٔ معلولیت است. دو بخش دارد: بخش مراقبت (Care) و بخش تحرک (Mobility).',
      whatToWriteFa: /yes/i.test(name) ? 'یک تیک، و بعد نرخ هر بخشی که می‌گیرید را تیک بزنید.' : 'فقط یک تیک.',
    }),
  ],
  [
    /5\.4.*care component/i,
    (name) => ({
      labelFa: `بخش مراقبت — نرخ ${/high/i.test(name) ? 'بالا' : /middle/i.test(name) ? 'متوسط' : 'پایین'}${whose(name)}`,
      meaningFa: 'بخش مراقبت (Care component) از DLA سه نرخ دارد: بالا، متوسط و پایین.',
      whatToWriteFa: 'همان نرخی را تیک بزنید که در نامهٔ اداره نوشته شده.',
    }),
  ],
  [
    /5\.4.*mobility component/i,
    (name) => ({
      labelFa: `بخش تحرک — نرخ ${/high/i.test(name) ? 'بالا' : 'پایین'}${whose(name)}`,
      meaningFa: 'بخش تحرک (Mobility component) از DLA دو نرخ دارد: بالا و پایین.',
      whatToWriteFa: 'همان نرخی را تیک بزنید که در نامهٔ اداره نوشته شده.',
    }),
  ],

  [
    /5\.5.*(do you|does your partner) get pip/i,
    (name) => ({
      labelFa: `Personal Independence Payment${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'Personal Independence Payment (PIP) کمک‌هزینه‌ای است برای افراد زیر سن بازنشستگی که به خاطر بیماری طولانی یا معلولیت در زندگی روزمره یا در رفت‌وآمد مشکل دارند. Armed forces independence payment هم در همین سؤال می‌آید.',
      whatToWriteFa: /yes/i.test(name) ? 'یک تیک، و بعد نرخ هر بخشی که می‌گیرید را تیک بزنید.' : 'فقط یک تیک.',
    }),
  ],
  [
    /5\.5.*daily living component (standard|enanced|enhanced)/i,
    (name) => ({
      labelFa: `بخش زندگی روزمره — نرخ ${/stand/i.test(name) ? 'استاندارد' : 'ارتقایافته'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'بخش «زندگی روزمره» (daily living) از PIP دو نرخ دارد: standard و enhanced. در نامهٔ اداره نوشته شده کدام به شما تعلق گرفته.',
      whatToWriteFa: 'همان نرخی را تیک بزنید که در نامه‌تان نوشته شده.',
    }),
  ],
  [
    /5\.5.*(daily )?mobility component (standard|enanced|enhanced)/i,
    (name) => ({
      labelFa: `بخش تحرک — نرخ ${/stand/i.test(name) ? 'استاندارد' : 'ارتقایافته'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'بخش «تحرک» (mobility) از PIP دو نرخ دارد: standard و enhanced. در نامهٔ اداره نوشته شده کدام به شما تعلق گرفته.',
      whatToWriteFa: 'همان نرخی را تیک بزنید که در نامه‌تان نوشته شده.',
    }),
  ],
  [
    /armed forces independent payment/i,
    (name) => ({
      labelFa: `Armed forces independence payment${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'این کمک‌هزینه‌ای است برای کسانی که در خدمت نیروهای مسلح بریتانیا آسیب جدی دیده‌اند. در همین سؤال کنار PIP آمده.',
      whatToWriteFa: 'اگر این را می‌گیرید تیک بزنید.',
    }),
  ],
  [
    /sending sick notes to your local social sec office/i,
    (name) => ({
      labelFa: `گواهی بیماری برای ادارهٔ تأمین اجتماعی${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا الان برای ادارهٔ تأمین اجتماعی محل یا کارفرمایتان گواهی بیماری (sick note) می‌فرستید.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، بگویید از کی شروع کرده‌اید.',
    }),
  ],
  [
    /when did you start sending (over a year|less than a year)/i,
    (name) => ({
      labelFa: `${/over a year/i.test(name) ? 'بیش از یک سال پیش' : 'کمتر از یک سال پیش'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد از چه زمانی گواهی بیماری می‌فرستید.',
      whatToWriteFa: /over a year/i.test(name)
        ? 'فقط یک تیک.'
        : 'یک تیک، و بعد تاریخ دقیق شروع را در کادرهای کنارش بنویسید.',
    }),
  ],
  [
    /5\.\d+ date (day|month|year)/i,
    (name) => ({
      labelFa: `تاریخ — ${/day/i.test(name) ? 'روز' : /month/i.test(name) ? 'ماه' : 'سال'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'تاریخی که این سؤال از شما خواسته.',
      whatToWriteFa: /year/i.test(name) ? 'سال با چهار رقم.' : 'با دو رقم.',
      exampleAnswer: /year/i.test(name) ? '2026' : '04',
      cautionFa: 'تاریخ را میلادی بنویسید، نه شمسی.',
    }),
  ],
  [
    /looking after someone/i,
    (name) => ({
      labelFa: `از کسی مراقبت می‌کنید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا از کسی مراقبت می‌کنید ولی Carer’s Allowance به شما نمی‌دهند چون کمک‌هزینهٔ دیگری می‌گیرید. فرم توضیح داده که Carer’s Allowance به کسی می‌دهند که از یک فرد با معلولیت شدید مراقبت می‌کند، و اسم قدیمی‌اش Invalid Care Allowance بود.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /others receive carer'?s allowance/i,
    (name) => ({
      labelFa: `کس دیگری برای مراقبت از شما کمک‌هزینه می‌گیرد؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا کسی غیر از شما و شریک زندگی‌تان، برای مراقبت از یکی از شما، Carer’s Allowance یا بخش carer از Universal Credit می‌گیرد.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /^4\.1 shares$/i,
    {
      labelFa: 'سهام',
      meaningFa: 'این کادر را تیک می‌زنید تا بگویید سهام دارید.',
      whatToWriteFa: 'یک تیک، و بعد در جدول زیرش نام شرکت، نوع سهام و تعداد سهام را بنویسید.',
    },
  ],

  // ---- Part 6: work -----------------------------------------------------
  [
    /6\.1 - (do you|does your partner) have a job/i,
    (name) => ({
      labelFa: `کار دارید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد الان بابت کاری پول می‌گیرید یا نه. فرم می‌گوید همه چیز حساب می‌شود: کار برای کارفرما، خویش‌فرمایی، کار داوطلبانه‌ای که پول دارد، دورهٔ کارآموزی، کار تمام‌وقت و پاره‌وقت، دائم و موقت، اضافه‌کاری و انعام.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /6\.1 what is (your|your partners) job/i,
    (name) => ({
      labelFa: `شغل${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد شغلتان چیست.',
      whatToWriteFa: 'عنوان شغل را به انگلیسی و کوتاه بنویسید.',
      exampleAnswer: 'Care assistant',
    }),
  ],
  [
    /6\.1 how many hours/i,
    (name) => ({
      labelFa: `ساعت کار در هفته${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد معمولاً هفته‌ای چند ساعت کار می‌کنید.',
      whatToWriteFa: 'فقط عدد ساعت.',
      exampleAnswer: '20',
    }),
  ],
  [
    /6\.2a - employed/i,
    (name) => ({
      labelFa: `کارمند (Employed)${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'Employed یعنی برای یک کارفرما کار می‌کنید و او به شما حقوق می‌دهد.',
      whatToWriteFa: 'اگر درست است تیک بزنید. می‌شود هم Employed باشید و هم Self-employed.',
    }),
  ],
  [
    /6\.2a - self employed/i,
    (name) => ({
      labelFa: `خویش‌فرما (Self-employed)${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'Self-employed یعنی برای خودتان کار می‌کنید، نه برای یک کارفرما.',
      whatToWriteFa: 'اگر درست است تیک بزنید.',
      cautionFa:
        'اگر این را تیک بزنید، فرم می‌گوید کپی حساب‌های سال مالی گذشته را بفرستید. فرم‌های self-assessment ادارهٔ مالیات را قبول نمی‌کنند.',
    }),
  ],
  [
    /6\.2a every week/i,
    (name) => ({
      labelFa: `هفتگی حقوق می‌گیرم${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'یعنی هر هفته حقوق می‌گیرید.',
      whatToWriteFa: 'یک تیک، و چهار فیش حقوقی آخر را ضمیمه کنید.',
    }),
  ],
  [
    /6\.2a every two weeks/i,
    (name) => ({
      labelFa: `هر دو هفته حقوق می‌گیرم${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'یعنی هر دو هفته یک بار حقوق می‌گیرید.',
      whatToWriteFa: 'یک تیک، و چهار فیش حقوقی آخر را ضمیمه کنید.',
    }),
  ],
  [
    /6\.2a every four weeks/i,
    (name) => ({
      labelFa: `هر چهار هفته حقوق می‌گیرم${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'یعنی هر چهار هفته یک بار حقوق می‌گیرید.',
      whatToWriteFa: 'یک تیک، و دو فیش حقوقی آخر را ضمیمه کنید.',
    }),
  ],
  [
    /6\.2a every month/i,
    (name) => ({
      labelFa: `ماهانه حقوق می‌گیرم${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'یعنی هر ماه حقوق می‌گیرید.',
      whatToWriteFa: 'یک تیک، و دو فیش حقوقی آخر را ضمیمه کنید.',
    }),
  ],
  [
    /6\.2a zero hour/i,
    (name) => ({
      labelFa: `قرارداد صفر ساعت${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'قرارداد صفر ساعت (zero hours contract) یعنی ساعت کار ثابتی تضمین نشده. فرم می‌گوید این کادر را وقتی هم بزنید که هر هفته کار نمی‌کنید یا درآمدتان هفته به هفته فرق می‌کند.',
      whatToWriteFa: 'یک تیک، و پنج فیش حقوقی آخر را ضمیمه کنید.',
    }),
  ],
  [
    /6\.3 - (do you|does your partner) pay towards personal pension/i,
    (name) => ({
      labelFa: `مستمری شخصی${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا پولی بابت یک مستمری شخصی (personal pension) می‌پردازید — یعنی مستمری‌ای که خودتان باز کرده‌اید، نه مستمری محل کار.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa: 'آنچه به مستمری محل کار می‌دهید اینجا نمی‌آید؛ فرم می‌گوید آن در فیش حقوقی دیده می‌شود.',
    }),
  ],
  [
    /6\.3 how much do you pay/i,
    (name) => ({
      labelFa: `مبلغ مستمری شخصی${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'چقدر بابت مستمری شخصی می‌پردازید.',
      whatToWriteFa: 'مبلغ به پوند، و در کادر «every» کنارش دوره‌اش.',
      exampleAnswer: '£50',
    }),
  ],
  [
    /6\.4 sending sick notes/i,
    (name) => ({
      labelFa: `گواهی بیماری برای کارفرما${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا الان برای کارفرمایتان گواهی بیماری (sick note) می‌فرستید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa:
        'اگر گواهی بیماری را برای ادارهٔ تأمین اجتماعی محل می‌فرستید و نه کارفرما، فرم می‌گوید آن را اینجا ننویسید — جوابش در سؤال ۵.۶ است.',
    }),
  ],
  [
    /6\.4 date sent in (day|month|year)/i,
    (name) => ({
      labelFa: `تاریخ شروع فرستادن گواهی — ${/day/i.test(name) ? 'روز' : /month/i.test(name) ? 'ماه' : 'سال'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد از چه تاریخی شروع کرده‌اید گواهی بیماری بفرستید.',
      whatToWriteFa: /year/i.test(name) ? 'سال با چهار رقم.' : 'با دو رقم.',
      exampleAnswer: /year/i.test(name) ? '2025' : '03',
      cautionFa: 'تاریخ را میلادی بنویسید، نه شمسی.',
    }),
  ],
  [
    /6\.4 - period payslips cover/i,
    (name) => ({
      labelFa: `دورهٔ فیش حقوقی${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد آخرین فیش حقوقی‌تان مربوط به چه بازه‌ای است.',
      whatToWriteFa: 'دوره را بنویسید.',
      exampleAnswer: 'One week / One month',
    }),
  ],
  [
    /6\.5 - recieving training scheme/i,
    (name) => ({
      labelFa: `دورهٔ کارآموزی${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد آیا در یک دورهٔ کارآموزی (training scheme) هستید.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /6\.5 name of scheme/i,
    (name) => ({
      labelFa: `نام دورهٔ کارآموزی${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اسم دورهٔ کارآموزی‌ای که در آن هستید.',
      whatToWriteFa: 'اسم دوره را همان‌طور که مرکز آموزش می‌نویسد.',
    }),
  ],
  [
    /6\.5a traniee|6\.5a trainee/i,
    (name) => ({
      labelFa: `کارآموز (Trainee)${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'یعنی پول شما را به عنوان کارآموز می‌دهند، نه به عنوان کارمند.',
      whatToWriteFa: 'یک تیک. فرم می‌گوید نامه‌ای از مرکز آموزشتان بفرستید که مبلغ کمک‌هزینه را نشان بدهد.',
    }),
  ],
  [
    /6\.5a employee/i,
    (name) => ({
      labelFa: `کارمند (Employee)${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'یعنی در دورهٔ کارآموزی، پول شما را به عنوان کارمند می‌دهند.',
      whatToWriteFa: 'یک تیک. بعد بروید به سؤال ۶.۲a و فیش‌های حقوقی خواسته‌شده را بفرستید.',
    }),
  ],

  // ---- Part 7: where you live ------------------------------------------
  [
    /7\.1 - name of person in hospital/i,
    {
      labelFa: 'اسم فرد بستری در بیمارستان',
      meaningFa: 'اگر شما یا شریک زندگی‌تان در بیمارستان بستری هستید، اداره اسم آن شخص را می‌خواهد.',
      whatToWriteFa: 'نام و نام خانوادگی آن شخص.',
    },
  ],
  [
    /7\.1 - date they went to the hospital/i,
    {
      labelFa: 'تاریخ بستری شدن',
      meaningFa: 'اداره می‌پرسد آن شخص از چه تاریخی در بیمارستان بستری شده.',
      whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
      exampleAnswer: '15/08/2026',
    },
  ],
  [
    /7\.1 live in hospital/i,
    (name) => ({
      labelFa: `در بیمارستان بستری${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا شما یا شریک زندگی‌تان در بیمارستان بستری هستید.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، اسم آن شخص و تاریخ بستری شدن را بنویسید.',
    }),
  ],
  [
    /do you or partner pay ct/i,
    (name) => ({
      labelFa: `Council Tax می‌پردازید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa:
        'Council Tax مالیاتی است که ساکنان هر خانه به شهرداری می‌پردازند. اداره می‌پرسد آیا پرداختش به عهدهٔ شما یا شریک زندگی‌تان است.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، بنویسید امسال چقدر باید بپردازید.',
      cautionFa: 'فرم می‌گوید Council Tax ملکی را که در Part 4 نوشته‌اید اینجا نیاورید.',
    }),
  ],
  [
    /7\.4 - every \(frequency\)/i,
    {
      labelFa: 'هر چند وقت یک بار اجاره می‌دهید',
      meaningFa: 'این کادر بعد از کلمهٔ «every» می‌آید و می‌پرسد آن مبلغ اجاره هر چند وقت یک بار پرداخت می‌شود.',
      whatToWriteFa: 'دوره را به انگلیسی بنویسید.',
      exampleAnswer: 'week / month',
    },
  ],
  [
    /7\.2 - do you or partner live with parents/i,
    (name) => ({
      labelFa: `زندگی در خانهٔ خانواده یا دوستان${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa:
        'اداره می‌پرسد آیا شما یا شریک زندگی‌تان در خانهٔ پدر و مادر، فامیل یا دوستانتان زندگی می‌کنید. فرم می‌گوید اگر در بیمارستان بستری‌اید ولی معمولاً آنجا زندگی می‌کنید، Yes بزنید.',
      whatToWriteFa: 'فقط یک تیک. اگر Yes بزنید، بروید به Part 8.',
    }),
  ],
  [
    /7\.3 are you or partner joint owner or tenant/i,
    (name) => ({
      labelFa: `مالک یا مستأجر مشترک${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa:
        'اداره می‌پرسد آیا این خانه را با کس دیگری مشترکاً مالک هستید یا مشترکاً اجاره کرده‌اید.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /7\.3 who with/i,
    {
      labelFa: 'با چه کسی',
      meaningFa: 'اداره می‌پرسد این خانه را با چه کسی مشترکاً مالک هستید یا اجاره کرده‌اید.',
      whatToWriteFa: 'نام آن شخص.',
    },
  ],
  [
    /7\.3 relationship/i,
    {
      labelFa: 'نسبت آن شخص با شما',
      meaningFa: 'اداره می‌پرسد آن شخص چه نسبتی با شما یا شریک زندگی‌تان دارد.',
      whatToWriteFa: 'نسبت را با یک کلمهٔ انگلیسی بنویسید.',
      exampleAnswer: 'Brother / Friend',
    },
  ],
  [
    /7\.4 do you pay rent/i,
    (name) => ({
      labelFa: `اجاره می‌پردازید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا بابت جایی که زندگی می‌کنید اجاره می‌دهید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa:
        'دو استثنا در فرم نوشته شده: اگر پول را به پدر و مادر، فامیل یا دوستانتان می‌دهید، No بزنید؛ و اگر دانشجو هستید هم No بزنید، چون اجارهٔ دانشجویی را در Part 8 می‌پرسند.',
    }),
  ],
  [
    /7\.4 - how much do you pay/i,
    {
      labelFa: 'مبلغ اجاره',
      meaningFa: 'اداره می‌پرسد چقدر اجاره می‌دهید.',
      whatToWriteFa: 'مبلغ به پوند، و در کادر «every» کنارش دوره‌اش.',
      exampleAnswer: '£650',
      cautionFa:
        'فرم می‌گوید Housing Benefit و local housing allowance را کم کنید، ولی بخش مسکن Universal Credit را کم نکنید. آب‌بها، Council Tax و بدهی معوقه را هم اضافه نکنید.',
    },
  ],
  [
    /7\.4 check box - (heating|lighting|cooking|hot water)/i,
    (name) => {
      const which = /heating/i.test(name)
        ? 'گرمایش'
        : /lighting/i.test(name)
        ? 'روشنایی'
        : /cooking/i.test(name)
        ? 'پخت‌وپز'
        : 'آب گرم';
      return {
        labelFa: `اجاره شامل ${which} است`,
        meaningFa: `اداره می‌پرسد آیا هزینهٔ ${which} داخل اجارهٔ شماست.`,
        whatToWriteFa: `اگر ${which} داخل اجاره است و مبلغش را نمی‌دانید، این کادر را تیک بزنید.`,
        cautionFa:
          'اگر مبلغش را می‌دانید، فرم می‌گوید خودتان آن را از اجاره کم کنید و این کادر را خالی بگذارید.',
      };
    },
  ],
  [
    /7\.4 do you just have one room/i,
    (name) => ({
      labelFa: `فقط یک اتاق${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا فقط یک اتاق در اختیار دارید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa: 'فرم می‌گوید اتاق‌هایی را که با کسانی خارج از خانوادهٔ خودتان مشترکید حساب نکنید.',
    }),
  ],
  [
    /7\.4 does your rent include any means?/i,
    (name) => ({
      labelFa: `اجاره شامل غذا${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا اجاره‌ای که می‌دهید شامل وعده‌های غذایی هم می‌شود.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، تعداد وعده‌ها را در کادرهای زیرش بنویسید.',
    }),
  ],
  [
    /7\.4 (breakfasts|midday|evening) per week per person/i,
    (name) => {
      const meal = /breakfast/i.test(name) ? 'صبحانه' : /midday/i.test(name) ? 'ناهار' : 'شام';
      return {
        labelFa: `تعداد ${meal} در هفته برای هر نفر`,
        meaningFa: `اداره می‌پرسد هر هفته چند ${meal} داخل اجاره حساب می‌شود، برای هر نفر.`,
        whatToWriteFa: 'فقط عدد.',
        exampleAnswer: '7',
      };
    },
  ],
  [
    /7\.10 name of disabled person/i,
    {
      labelFa: 'اسم فرد دارای معلولیت',
      meaningFa:
        'این سؤال دربارهٔ وامی است که برای مناسب‌سازی خانه برای نیازهای یک فرد دارای معلولیت گرفته‌اید. اداره اسم آن شخص را می‌خواهد.',
      whatToWriteFa: 'نام و نام خانوادگی آن شخص.',
      cautionFa:
        'فرم می‌گوید اگر آن شخص بزرگسال است و بیش از ۱۶٬۰۰۰ پوند پس‌انداز یا ملک دارد، به این سؤال No بدهید.',
    },
  ],
  [
    /7\.9 what is this paid for/i,
    {
      labelFa: 'این پول بابت چیست',
      meaningFa: 'اداره می‌پرسد این مبلغ را بابت چه چیزی می‌پردازید.',
      whatToWriteFa: 'با چند کلمهٔ انگلیسی بنویسید بابت چیست.',
    },
  ],
  [
    /^7\.\d+ how much do you pay$|^7\.5 amount$/i,
    {
      labelFa: 'مبلغی که می‌پردازید',
      meaningFa: 'اداره می‌پرسد بابت این مورد چقدر باید بپردازید.',
      whatToWriteFa: 'مبلغ به پوند. اگر کنارش کادر «Every» هست، دوره‌اش را هم بنویسید.',
      exampleAnswer: '£420',
      cautionFa:
        'در این بخش فرم چند بار تأکید کرده که بدهی معوقه (arrears) و پولی که داوطلبانه اضافه می‌پردازید را حساب نکنید.',
    },
  ],
  [
    /^7\.\d+ duration$/i,
    {
      labelFa: 'هر چند وقت یک بار',
      meaningFa: 'این کادر بعد از کلمهٔ «Every» می‌آید و می‌پرسد آن مبلغ هر چند وقت یک بار پرداخت می‌شود.',
      whatToWriteFa: 'دوره را به انگلیسی بنویسید.',
      exampleAnswer: 'month / year',
    },
  ],

  [
    /local sec office said you are not capable of working/i,
    (name) => ({
      labelFa: `اداره گفته توان کار ندارید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا ادارهٔ تأمین اجتماعی محل به شما گفته که توان کار کردن ندارید و دیگر لازم نیست گواهی بیماری بفرستید.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، تاریخی که این را به شما گفته‌اند بنویسید.',
    }),
  ],
  [
    /7\.6 - check box (no|yes) do you or partner own home/i,
    (name) => ({
      labelFa: `مالک خانهٔ خودتان هستید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا شما یا شریک زندگی‌تان مالک خانه‌ای هستید که در آن زندگی می‌کنید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa:
        'فرم می‌گوید اگر وام مسکن دارید باز هم Yes بزنید، و اگر بخشی از خانه را اجاره و بخشی را مالکید هم Yes بزنید.',
    }),
  ],

  // ---- Part 8: education ------------------------------------------------
  [
    /8\.1[ab] (check box )?(no|yes)$/i,
    (name) => ({
      labelFa: `در حال تحصیل${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/8\.1b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد آیا در حال تحصیل هستید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa: 'فرم می‌گوید فقط وقتی Yes بزنید که دوره‌تان واقعاً شروع شده باشد. اگر No بزنید، بروید به Part 9.',
    }),
  ],
  [
    /8\.1[ab] name of school/i,
    {
      labelFa: 'نام مدرسه، کالج یا دانشگاه',
      meaningFa: 'اسم جایی که در آن درس می‌خوانید.',
      whatToWriteFa: 'اسم کامل و رسمی مؤسسه.',
    },
  ],
  [
    /8\.1[ab] qualification/i,
    (name) => ({
      labelFa: `مدرک و نوع دوره${/partner/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌خواهد بداند چه مدرکی می‌گیرید، دوره تمام‌وقت است یا پاره‌وقت، و کارشناسی (undergraduate) است یا تحصیلات تکمیلی (postgraduate).',
      whatToWriteFa: 'هر سه را در همین کادر بنویسید.',
      exampleAnswer: 'BSc Nursing, full-time, undergraduate',
    }),
  ],
  [
    /8\.1[ab] term (\d) (start|end) dates/i,
    (name) => {
      const m = name.match(/term (\d) (start|end)/i);
      const term = m ? persianDigits(m[1]) : '';
      const which = m && /start/i.test(m[2]) ? 'شروع' : 'پایان';
      return {
        labelFa: `تاریخ ${which} ترم ${term}`,
        meaningFa: `اداره تاریخ دقیق ${which} ترم ${term} سال تحصیلی جاری را می‌خواهد.`,
        whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
        exampleAnswer: '29/09/2026',
        cautionFa:
          'فرم می‌گوید تاریخ semester را قبول نمی‌کنند و اگر تاریخ‌های دقیق را ندهید کارتان دیر می‌افتد. اگر نمی‌دانید، از کالج یا دانشگاهتان بپرسید.',
      };
    },
  ],
  [
    /8\.1[ab] next year start date/i,
    {
      labelFa: 'تاریخ شروع سال تحصیلی بعد',
      meaningFa: 'اداره می‌پرسد سال تحصیلی بعدی شما از چه تاریخی شروع می‌شود.',
      whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
      exampleAnswer: '28/09/2027',
    },
  ],

  // Part 8 numbers its boxes 8.Na for you and 8.Nb for your partner.
  [
    /8\.2[ab] check box (no|yes)/i,
    (name) => ({
      labelFa: `دانشجوی خارجی${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/8\.2b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا دانشجوی خارجی (overseas student) هستید — یعنی برای تحصیل از کشور دیگری آمده‌اید.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، بنویسید وقتی دانشجو نیستید معمولاً در کدام کشور زندگی می‌کنید.',
    }),
  ],
  [
    /8\.2[ab] normal country of residence/i,
    (name) => ({
      labelFa: `کشور محل زندگی${/8\.2b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد وقتی دانشجو نیستید، معمولاً در کدام کشور زندگی می‌کنید.',
      whatToWriteFa: 'نام کشور، به انگلیسی.',
    }),
  ],
  [
    /8\.3[ab] check box (no|yes)/i,
    (name) => ({
      labelFa: `شهریه را اداره می‌پردازد؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/8\.3b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا شهریهٔ شما را یکی از این سازمان‌ها می‌پردازد: Student Finance England (SFE)، Student Finance Wales (SFW)، Student Awards Agency for Scotland (SAAS) یا NHS.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، تیک بزنید کدام‌یک.',
    }),
  ],
  [
    /8\.3[ab] (check box )?(sfe|sfw|saas|nhs)\b/i,
    (name) => {
      const body = /sfe/i.test(name)
        ? ['SFE', 'Student Finance England — نهاد کمک مالی دانشجویی در انگلستان.']
        : /sfw/i.test(name)
        ? ['SFW', 'Student Finance Wales — نهاد کمک مالی دانشجویی در ولز.']
        : /saas/i.test(name)
        ? ['SAAS', 'Student Awards Agency for Scotland — نهاد کمک مالی دانشجویی در اسکاتلند.']
        : ['NHS', 'NHS — برای بعضی رشته‌های درمانی، شهریه را خود NHS می‌پردازد.'];
      return {
        labelFa: `${body[0]}${/8\.3b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
        meaningFa: body[1],
        whatToWriteFa: 'اگر شهریهٔ شما را همین نهاد می‌پردازد، تیک بزنید.',
      };
    },
  ],
  [
    /8\.3[ab] who pays/i,
    (name) => ({
      labelFa: `چه کسی شهریه را می‌پردازد${/8\.3b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد شهریهٔ شما را کدام نهاد می‌پردازد.',
      whatToWriteFa: 'یکی از SFE، SFW، SAAS یا NHS را تیک بزنید.',
    }),
  ],
  [
    /8\.4[ab] (no|yes)$/i,
    (name) => ({
      labelFa: `درخواست کمک مالی داده‌اید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}${/8\.4b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa:
        'اداره می‌پرسد آیا به SFE، SFW، SAAS یا NHS برای کمک مالی درخواست داده‌اید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa: 'فرم می‌گوید حتی اگر درخواست دادید و پولی به شما ندادند، باز هم Yes بزنید.',
    }),
  ],
  [
    /8\.4[ab] (tuition fee|loan support|grant support)/i,
    (name) => {
      const body = /tuition/i.test(name)
        ? ['کمک بابت شهریه', 'یعنی برای پرداخت شهریهٔ دوره‌تان درخواست کمک داده‌اید.']
        : /loan/i.test(name)
        ? ['وام', 'یعنی درخواست وام دانشجویی داده‌اید — پولی که باید بعداً پس بدهید.']
        : ['کمک بلاعوض', 'یعنی درخواست grant داده‌اید — پولی که پس دادن ندارد.'];
      return {
        labelFa: `${body[0]}${/8\.4b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
        meaningFa: body[1],
        whatToWriteFa: 'هر نوعی که برایش درخواست داده‌اید تیک بزنید. می‌شود بیش از یکی باشد.',
      };
    },
  ],
  [
    /8\.5[ab] (student finance support|nhs bursary|hei funding|other scholarship|grant or loan)/i,
    (name) => {
      const body = /student finance support/i.test(name)
        ? [
            'کمک از SFE، SFW یا SAAS',
            'کمک مالی از نهاد دانشجویی انگلستان، ولز یا اسکاتلند — می‌تواند وام یا maintenance grant باشد.',
            'باید «Student Finance Breakdown» را ضمیمه کنید. فرم می‌گوید schedule of payments را قبول نمی‌کنند.',
          ]
        : /nhs bursary/i.test(name)
        ? ['NHS Bursary', 'کمک‌هزینهٔ NHS برای دانشجویان بعضی رشته‌های درمانی.', 'نامهٔ تأیید مبلغ را ضمیمه کنید.']
        : /hei funding/i.test(name)
        ? [
            'بورس از خود دانشگاه',
            'بورسی که خود دانشگاه یا مؤسسهٔ آموزش عالی (HEI) به شما می‌دهد — مثلاً چون بیشترین شهریه را می‌پردازید و درآمد خانوارتان کم است.',
            'نامهٔ تأیید مبلغ را ضمیمه کنید.',
          ]
        : /other scholarship/i.test(name)
        ? ['بورس یا جایزهٔ دیگر', 'هر بورس، حمایت مالی یا جایزهٔ دیگری که می‌گیرید.', 'نامهٔ تأیید مبلغ را ضمیمه کنید.']
        : [
            'کمک‌هزینه یا وام از خارج',
            'کمک‌هزینه یا وامی که از خارج از بریتانیا می‌گیرید.',
            'نامهٔ تأیید را ضمیمه کنید. فرم می‌گوید اگر به انگلیسی نیست، ترجمه‌اش کنید.',
          ];
      return {
        labelFa: `${body[0]}${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
        meaningFa: body[1],
        whatToWriteFa: 'اگر این پول را می‌گیرید تیک بزنید. می‌شود بیش از یکی را تیک زد.',
        cautionFa: body[2],
      };
    },
  ],
  [
    /8\.5[ab] money from parents/i,
    (name) => ({
      labelFa: `پول از پدر و مادر${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'پولی که پدر و مادرتان برای اجاره و خرج زندگی به شما می‌دهند.',
      whatToWriteFa: 'یک تیک، و بعد مبلغ و دوره‌اش را بنویسید.',
      cautionFa: 'فرم می‌گوید پولی را که برای شهریه می‌گیرید در این مبلغ نیاورید. و می‌خواهد دقیق باشد.',
    }),
  ],
  [
    /8\.5[ab] other money/i,
    (name) => ({
      labelFa: `هر پول دیگر${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'هر پول دیگری که در دوران تحصیل با آن زندگی می‌کنید و در دسته‌های بالا نیامده.',
      whatToWriteFa: 'یک تیک، و بعد مبلغ و دوره‌اش را بنویسید.',
      cautionFa: 'فرم می‌گوید پول شهریه را در این مبلغ نیاورید. درآمد کار هم در Part 6 می‌آید، نه اینجا.',
    }),
  ],
  [
    /8\.5[ab] amount from (parents|other)/i,
    (name) => ({
      labelFa: `مبلغ${/parents/i.test(name) ? ' — از پدر و مادر' : ' — از منبع دیگر'}${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'چقدر پول می‌گیرید.',
      whatToWriteFa: 'مبلغ به پوند، و در کادر «Every» کنارش دوره‌اش.',
      exampleAnswer: '£200',
    }),
  ],
  [
    /8\.5[ab] duration of pay/i,
    (name) => ({
      labelFa: `هر چند وقت یک بار${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'این کادر بعد از کلمهٔ «Every» می‌آید و می‌پرسد آن پول هر چند وقت یک بار به شما می‌رسد.',
      whatToWriteFa: 'دوره را به انگلیسی بنویسید.',
      exampleAnswer: 'month / term',
    }),
  ],
  [
    /8\.5[ab] who pays this/i,
    (name) => ({
      labelFa: `چه کسی این پول را می‌دهد${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد این پول را چه کسی به شما می‌دهد.',
      whatToWriteFa: 'نام آن شخص.',
    }),
  ],
  [
    /8\.5[ab] relationship/i,
    (name) => ({
      labelFa: `نسبت او با شما${/8\.5b/i.test(name) ? ' — شریک زندگی' : ' — خودتان'}`,
      meaningFa: 'اداره می‌پرسد کسی که این پول را می‌دهد چه نسبتی با شما دارد.',
      whatToWriteFa: 'نسبت را با یک کلمهٔ انگلیسی بنویسید.',
      exampleAnswer: 'Father / Uncle',
    }),
  ],
  [
    /^8\.6 (no|yes)$/i,
    (name) => ({
      labelFa: `در ترم پیش خانواده زندگی می‌کنید؟${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا در طول ترم پیش پدر و مادرتان زندگی می‌کنید.',
      whatToWriteFa: 'فقط یک تیک.',
    }),
  ],
  [
    /^8\.7 (no|yes)$/i,
    (name) => ({
      labelFa: `اجارهٔ محل زندگی${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa:
        'اداره می‌پرسد آیا بابت جایی که به عنوان دانشجو زندگی می‌کنید اجاره می‌دهید — مثلاً خوابگاه (halls of residence) یا خانه‌ای از صاحب‌خانهٔ خصوصی.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa: 'فرم می‌گوید اگر پول را به پدر و مادر، فامیل یا دوستانتان می‌دهید، No بزنید و بروید به Part 9.',
    }),
  ],
  [
    /^8\.7 (start|end) date$/i,
    (name) => ({
      labelFa: `تاریخ ${/start/i.test(name) ? 'شروع' : 'پایان'} دورهٔ پرداخت`,
      meaningFa:
        'اداره تاریخ شروع و پایان دوره‌ای را می‌خواهد که موظف به پرداخت این هزینهٔ مسکن هستید.',
      whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
      exampleAnswer: '01/09/2026',
      cautionFa: 'فرم می‌گوید این تاریخ‌ها ممکن است از سال تحصیلی شما بلندتر باشد.',
    }),
  ],
  [
    /8\.7 amount you pay for total period/i,
    {
      labelFa: 'مبلغ کل همان دوره',
      meaningFa:
        'اداره مبلغ کل آن دوره را می‌خواهد، نه مبلغ هفتگی یا ماهانه. فرم خودش سه مثال زده: اگر هفته‌ای ۵۰ پوند برای ۴۰ هفته داده‌اید بنویسید ۲۰۰۰ پوند؛ اگر ماهی ۲۰۰ پوند برای ۱۰ ماه داده‌اید بنویسید ۲۰۰۰ پوند؛ اگر هر ترم ۶۰۰ پوند داده‌اید بنویسید ۱۸۰۰ پوند.',
      whatToWriteFa: 'یک مبلغ کل به پوند.',
      exampleAnswer: '£2,000',
    },
  ],
  [
    /8\.7 (term|holidays) (heating|lighting|cooking|hot water)/i,
    (name) => {
      const when = /term/i.test(name) ? 'در طول ترم' : 'در تعطیلات';
      const which = /heating/i.test(name)
        ? 'گرمایش'
        : /lighting/i.test(name)
        ? 'روشنایی'
        : /cooking/i.test(name)
        ? 'پخت‌وپز'
        : 'آب گرم';
      return {
        labelFa: `${which} داخل اجاره — ${when}`,
        meaningFa: `اداره می‌پرسد آیا هزینهٔ ${which} ${when} داخل اجارهٔ شماست.`,
        whatToWriteFa: `اگر ${which} داخل اجاره است و مبلغش را نمی‌دانید، تیک بزنید.`,
        cautionFa: 'اگر مبلغش را می‌دانید، فرم می‌گوید خودتان آن را از اجاره کم کنید و این کادر را خالی بگذارید.',
      };
    },
  ],
  [
    /8\.7 (no|yes) - one room/i,
    (name) => ({
      labelFa: `فقط یک اتاق${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا فقط یک اتاق در اختیار دارید.',
      whatToWriteFa: 'فقط یک تیک.',
      cautionFa: 'فرم می‌گوید اتاق‌هایی را که با کسانی خارج از خانوادهٔ خودتان مشترکید حساب نکنید.',
    }),
  ],
  [
    /8\.7 (no|yes) - include meals/i,
    (name) => ({
      labelFa: `اجاره شامل غذا${/yes/i.test(name) ? ' — بله' : ' — خیر'}`,
      meaningFa: 'اداره می‌پرسد آیا اجاره‌ای که می‌دهید شامل وعده‌های غذایی هم می‌شود.',
      whatToWriteFa: 'فقط یک تیک. اگر بله، تعداد وعده‌ها را در کادرهای ترم و تعطیلات بنویسید.',
    }),
  ],
  [
    /8\.7 (term|holidays) (breakfasts|midday meals|evening meals)/i,
    (name) => {
      const when = /term/i.test(name) ? 'در طول ترم' : 'در تعطیلات';
      const meal = /breakfast/i.test(name) ? 'صبحانه' : /midday/i.test(name) ? 'ناهار' : 'شام';
      return {
        labelFa: `تعداد ${meal} در هفته — ${when}`,
        meaningFa: `اداره می‌پرسد ${when} هر هفته چند ${meal} داخل اجاره حساب می‌شود، برای هر نفر.`,
        whatToWriteFa: 'فقط عدد.',
        exampleAnswer: '7',
      };
    },
  ],
  [
    /8\.8 date of return/i,
    {
      labelFa: 'تاریخ بازگشت به خوابگاه',
      meaningFa:
        'اداره می‌پرسد بعد از تعطیلات تابستان چه تاریخی به خوابگاه یا خانهٔ دانشجویی‌تان برگشتید یا برمی‌گردید.',
      whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
      exampleAnswer: '20/09/2026',
    },
  ],

  // ---- Part 9 and Part 10 ----------------------------------------------
  [
    /9 - additional information/i,
    {
      labelFa: 'اطلاعات دیگر',
      meaningFa:
        'این جای خالی بزرگ برای هر چیزی است که فکر می‌کنید اداره باید بداند و جایش در بقیهٔ فرم نبود. اگر جواب‌های قبلی جا نشد، ادامه‌شان را هم همین‌جا بنویسید.',
      whatToWriteFa:
        'فرم خودش چند مثال داده: اگر هیچ درآمدی ننوشته‌اید بنویسید با چه چیزی زندگی می‌کنید؛ اگر ماشین Motability دارید؛ اگر کم‌بینای شدید یا نابینا هستید؛ یا اگر می‌دانید کمک‌هزینه‌تان قرار است زیاد شود.',
    },
  ],
  [
    /9 - answered all questions/i,
    {
      labelFa: 'به همهٔ سؤال‌ها جواب داده‌ام',
      meaningFa: 'یکی از پنج کادر فهرست کنترل آخر فرم است، برای این که خودتان مطمئن شوید چیزی جا نمانده.',
      whatToWriteFa: 'اگر به همهٔ سؤال‌هایی که به شما مربوط می‌شد جواب داده‌اید، تیک بزنید.',
    },
  ],
  [
    /9 attached photos/i,
    {
      labelFa: 'کپی فیش‌های حقوقی را ضمیمه کرده‌ام',
      meaningFa: 'یکی از کادرهای فهرست کنترل: کپی فیش‌های حقوقی که Part 6 خواسته بود.',
      whatToWriteFa: 'اگر به شما مربوط است و ضمیمه کرده‌اید، تیک بزنید.',
      cautionFa: 'فرم می‌گوید نفرستادن مدارک، رسیدگی به درخواست شما را عقب می‌اندازد.',
    },
  ],
  [
    /attached student awards/i,
    {
      labelFa: 'نامه‌های کمک‌هزینهٔ دانشجویی را ضمیمه کرده‌ام',
      meaningFa: 'یکی از کادرهای فهرست کنترل: نامه‌های تأیید کمک‌هزینهٔ دانشجویی که Part 8 خواسته بود.',
      whatToWriteFa: 'اگر به شما مربوط است و ضمیمه کرده‌اید، تیک بزنید.',
    },
  ],
  [
    /given dates of terms/i,
    {
      labelFa: 'تاریخ ترم‌ها را نوشته‌ام',
      meaningFa: 'یکی از کادرهای فهرست کنترل: تاریخ دقیق ترم‌ها که Part 8 خواسته بود.',
      whatToWriteFa: 'اگر به شما مربوط است و نوشته‌اید، تیک بزنید.',
    },
  ],
  [
    /9 signed declaration/i,
    {
      labelFa: 'اظهارنامه را امضا کرده‌ام',
      meaningFa: 'آخرین کادر فهرست کنترل.',
      whatToWriteFa: 'اگر Part 10 را امضا و تاریخ زده‌اید، تیک بزنید.',
      cautionFa: 'فرم هشدار داده: درخواست شما بدون امضا و تاریخ معتبر نیست.',
    },
  ],
  [
    /10a date of signature/i,
    {
      labelFa: 'تاریخ امضا — کادر 10a',
      meaningFa: 'کادر 10a برای کسی است که برای خودش درخواست می‌دهد. اینجا تاریخ روزی که امضا می‌کنید را می‌نویسید.',
      whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
      exampleAnswer: '31/08/2026',
      cautionFa: 'فرم هشدار داده: درخواست بدون امضا و تاریخ معتبر نیست.',
    },
  ],
  [
    /10b date of signature/i,
    {
      labelFa: 'تاریخ امضا — کادر 10b',
      meaningFa:
        'کادر 10b فقط برای کسی است که به جای شخص دیگری فرم را امضا می‌کند، چون مسئول امور مالی اوست.',
      whatToWriteFa: 'تاریخ را میلادی و به شکل روز/ماه/سال بنویسید.',
      exampleAnswer: '31/08/2026',
    },
  ],
  [
    /10b your name/i,
    {
      labelFa: 'نام شما — کادر 10b',
      meaningFa:
        'اگر به جای شخص دیگری این فرم را امضا می‌کنید، اینجا نام خودتان می‌آید، نه نام کسی که درخواست برای اوست.',
      whatToWriteFa: 'نام و نام خانوادگی خودتان، با حروف بزرگ انگلیسی.',
      cautionFa:
        'فرم می‌گوید کادر 10b فقط وقتی است که شما مسئول امور مالی آن شخص هستید، چون او مشکل یادگیری یا شرایطی دارد که نمی‌گذارد کارهای خودش را اداره کند. در غیر این صورت خودِ او باید کادر 10a را امضا کند.',
    },
  ],
  [
    /10b your address and postcode/i,
    {
      labelFa: 'آدرس شما — کادر 10b',
      meaningFa: 'آدرس و کدپستی خودتان، یعنی کسی که به جای دیگری امضا می‌کند.',
      whatToWriteFa: 'آدرس کامل و کدپستی، با حروف بزرگ انگلیسی.',
    },
  ],
  [
    /10b your relationship to the person in part 1/i,
    {
      labelFa: 'نسبت شما با آن شخص — کادر 10b',
      meaningFa: 'اداره می‌پرسد شما چه نسبتی با کسی دارید که در Part 1 نامش نوشته شده.',
      whatToWriteFa: 'نسبت را با یک کلمهٔ انگلیسی بنویسید.',
      exampleAnswer: 'Daughter / Support worker',
    },
  ],
];

/** The first pattern that matches wins, so specific rules come before general. */
export const explainField = (name) => {
  for (const [test, build] of patterns) {
    if (test.test(name)) return typeof build === 'function' ? build(name) : build;
  }
  return null;
};

export default explainField;
