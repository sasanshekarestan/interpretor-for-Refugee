/**
 * What each page of an HC5 refund form says, in plain Persian.
 *
 * There are four HC5 forms and they are the same form with a different noun in
 * it: dental HC5(D), optical HC5(O), travel HC5(T), wigs and fabric supports
 * HC5(W). Part 1 is who the patient is, Part 2 is what was paid, Part 3 is
 * where the money should go, Part 4 is why you are entitled to it, and then a
 * declaration. So the Persian is written once here and the parts that really
 * differ are passed in, which is both less to check and impossible to let
 * drift apart.
 *
 * Written by hand from each form's own printed text. Nothing here tells a
 * person what to answer about their own circumstances: it says what the page
 * is asking and what they have to do with it.
 *
 * Two layouts, because the NHS did not make them the same:
 *   'do' - HC5(D) and HC5(O): five parts, declaration alone on page 4
 *   'tw' - HC5(T) and HC5(W): four parts, declaration begins on page 3 and an
 *          official-use section fills page 4
 *
 * One thing every one of them says, and it is the thing that decides whether
 * the form is worth filling in at all: it must reach them within three months
 * of the day the charge was paid. That is repeated on the page where a person
 * will actually be reading.
 */

/** The five benefits in Group 3, which are identical across all four forms. */
const GROUP_3_BENEFITS = `• Universal Credit، به شرط آنکه در آخرین دورهٔ کامل ارزیابی پیش از پرداخت، درآمد خالص شما ۴۳۵ پوند یا کمتر بوده باشد (۹۳۵ پوند یا کمتر اگر عنصر فرزند داشته‌اید یا توان کاری محدود)
• Income Support
• income-based Jobseeker's Allowance
• income-related Employment and Support Allowance
• Pension Credit Guarantee Credit`;

const PART_4 = (noun, extras, addresses) => `این صفحه «Part 4 - Reason for claim» است: دلیل اینکه چرا این پول به شما برمی‌گردد. یکی از چهار گروه را علامت می‌زنید، و ملاک، وضعیت شما در روزی است که ${noun} را پرداختید.

گروه ۱. مستمری جانبازی (War Pension) یا پرداخت Armed Forces Compensation Scheme می‌گرفتید و برای همان ناتوانی پذیرفته‌شده درمان می‌شدید. شمارهٔ آن را می‌خواهد.

گروه ۲. نامتان روی گواهی HC2 یا HC3 بوده. شمارهٔ گواهی را می‌خواهد.${extras}

گروه ۳. یکی از این کمک‌هزینه‌ها را می‌گرفتید. شریک زندگی و فرزند یا جوان زیر ۲۰ سالِ تحت تکفلِ کسی که آن را می‌گیرد هم مشمول است. اگر نام روی کمک‌هزینه با نام بیمار فرق دارد، نام و تاریخ تولد یا شمارهٔ بیمهٔ ملی آن شخص را می‌خواهد.

${GROUP_3_BENEFITS}

گروه ۴. در هیچ‌کدام از گروه‌های ۱ تا ۳ نیستید ولی درآمدتان کم است. در این حالت باید فرم HC1 طرح کمک به کم‌درآمدها (NHS Low Income Scheme) را هم پر کنید؛ آنلاین در www.nhsbsa.nhs.uk/hc1 یا با تلفن ۰۳۰۰ ۱۲۳ ۰۸۴۹ فرم کاغذی بگیرید. اگر آنلاین درخواست داده‌اید، شمارهٔ مرجع آن را در همین صفحه بنویسید.

${addresses}`;

const PART_1 = (who) => `این صفحه با «Part 1 - Patient's details» شروع می‌شود: مشخصات بیمار. بیمار همان کسی است که ${who}. اگر دارید برای شخص دیگری فرم را پر می‌کنید، مشخصات او را اینجا می‌نویسید، نه مشخصات خودتان.

از شما می‌خواهد: نام خانوادگی، نام، عنوان (Mr/Mrs/Miss/Ms یا غیره)، جنسیت، تاریخ تولد به ترتیب روز و ماه و سال میلادی، شمارهٔ NHS، شمارهٔ بیمهٔ ملی (National Insurance number)، و آدرس با کد پستی.

بعد یک قسمت کوچک هست به اسم «Contact details»، برای وقتی که لازم شود دربارهٔ همین درخواست با کسی تماس بگیرند: نام، اگر با نام بیمار فرق دارد؛ ایمیل؛ و شمارهٔ تلفن.`;

const BANK = `بعد «Part 3 - Bank details» است: حسابی که پول به آن برگردد. نام صاحب یا صاحبان حساب، نام کامل بانک یا building society، sort code که شش رقم است و در سه جفت نوشته می‌شود، و شمارهٔ حساب که هشت رقم است. اگر حساب building society است، شمارهٔ roll یا reference آن را هم می‌خواهد؛ خود فرم می‌گوید اگر مطمئن نیستید حسابتان چنین شماره‌ای دارد یا نه، از building society بپرسید.

یک جملهٔ مهم پایین همین قسمت نوشته: مشخصات اشتباه بانکی، پرداخت پولی را که حقتان است عقب می‌اندازد.`;

/**
 * @param {object} form
 * @param {'do'|'tw'} form.layout
 * @param {string} form.code          e.g. "HC5(D)"
 * @param {string} form.noun          "هزینهٔ دندان‌پزشکی", used mid-sentence
 * @param {string} form.who           how page 2 describes the patient
 * @param {string} form.page0         the whole of page 1, which differs most
 * @param {string} form.part2         the Part 2 paragraphs
 * @param {string} form.part3         what stands where the bank details stand
 * @param {string} [form.group2Extra] extra Group 2 options, dental only
 * @param {string} form.addresses     where each group posts the form
 * @param {string} [form.page3]       the last page, for the 'tw' layout
 */
export const hc5Pages = (form) => {
  const part1 = PART_1(form.who);
  const part3 = form.part3 || BANK;
  const part4 = PART_4(form.noun, form.group2Extra || '', form.addresses);

  const declaration = `این صفحه «Declaration and signature» است: تأیید و امضا.

اول یک هشدار: دادن اطلاعات نادرست می‌تواند به پیگرد قانونی یا اقدام حقوقی بینجامد، و اگر برای شخص دیگری امضا می‌کنید، مسئولیت درستی اطلاعات با شماست.

با امضا کردن سه چیز را می‌پذیرید: که اطلاعات فرم درست و کامل است؛ که NHS Business Services Authority می‌تواند برای راستی‌آزمایی این اطلاعات را با ادارهٔ مالیات (HMRC)، شهرداری‌ها و ادارهٔ کار و بازنشستگی (DWP) در میان بگذارد؛ و که می‌تواند برای پیشگیری و کشف تقلب با NHS Counter Fraud Authority در میان بگذارد.

بعد نوشته اطلاعات شما بیرون از بریتانیا یا حوزهٔ اقتصادی اروپا فرستاده نمی‌شود.

دو کادر امضا هست و فقط یکی از آن‌ها به شما مربوط است:
• کادر A: درخواست خودتان است، برای پولی که خودتان داده‌اید. فقط امضا و تاریخ.
• کادر B: درخواست برای شخصی است که نامش در Part 1 آمده. اینجا علاوه بر امضا و تاریخ، نام خودتان با حروف بزرگ، نسبتتان با بیمار، و آدرس و کد پستی خودتان را هم می‌خواهد.`;

  if (form.layout === 'do') {
    return {
      0: form.page0,
      1: `${part1}

بعد «Part 2» شروع می‌شود. ${form.part2}

${part3}`,
      2: part4,
      3: `${declaration}

پایین صفحه کد فرم نوشته شده: ${form.code}. اگر کسی از شما پرسید کدام فرم را پر کرده‌اید، همین است.`,
    };
  }

  // 'tw': the declaration starts on page 3 under Part 4, and page 4 is mostly
  // for the office rather than for the person filling the form in.
  return {
    0: form.page0,
    1: `${part1}

بعد «Part 2» شروع می‌شود. ${form.part2}

${part3}`,
    2: `${part4}

پایین همین صفحه «Declaration and signature» شروع می‌شود و در صفحهٔ بعد ادامه پیدا می‌کند. متنش می‌گوید: دادن اطلاعات نادرست می‌تواند به اقدام حقوقی یا کیفری بینجامد؛ اگر برای شخص دیگری امضا می‌کنید مسئولیت اطلاعات با شماست؛ و با امضا اجازه می‌دهید اطلاعات فرم برای راستی‌آزمایی با ادارهٔ مالیات (HMRC)، شهرداری‌ها و ادارهٔ کار و بازنشستگی (DWP)، و برای بررسی تقلب با NHS Counter Fraud Authority، در میان گذاشته شود.`,
    3: form.page3,
  };
};

export { BANK, GROUP_3_BENEFITS };
