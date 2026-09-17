import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The full privacy policy, in the open.
 *
 * The "Privacy and data" panel on the home screen makes short promises. This is
 * the long version behind them, written because the people most likely to read
 * it are the ones deciding whether to recommend Hamyar to someone frightened of
 * being tracked, and they are right to want the detail rather than a slogan.
 *
 * Two things it does that a boilerplate policy does not. It says, plainly, that
 * a scanned document or a recording is sent to Google to be read and
 * translated, because that is true and pretending otherwise to exactly this
 * audience would be the worst thing the app could do. And it distinguishes what
 * the app never stores anywhere (documents, conversations) from the small
 * things it keeps only on the person's own device, so "private" means something
 * a person can check rather than a word.
 *
 * Persian first, English second, one language per block, like every other
 * notice in the app.
 */

const asOf = 'September 2026';

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emphasis/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-3xl w-full shadow-hamyar border border-edge overflow-hidden flex flex-col max-h-[88vh]">
        <div className="p-5 border-b border-edge bg-page flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-farsi font-bold text-ink text-base">حریم خصوصی</h2>
              <p className="font-latin text-xs text-ink-muted">Privacy Policy</p>
            </div>
          </div>
          <button
            id="btn-close-privacy-policy"
            onClick={onClose}
            aria-label="بستن · Close"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-page transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-8">
          <p className="text-xs text-ink-muted">
            <span className="font-farsi">آخرین به‌روزرسانی: {asOf}</span>
            <span className="font-latin"> · Last updated: {asOf}</span>
          </p>

          {/* 1. In one line */}
          <Section
            fa="خلاصه در یک خط"
            en="In short"
            faBody="مدارک و گفتگوهای شما در هیچ سروری ذخیره نمی‌شود. برای ترجمه، عکس یا صدا به گوگل فرستاده می‌شود، خوانده می‌شود و پاک می‌شود. هر چیزی که ذخیره می‌کنید فقط روی دستگاه خودتان می‌ماند. هیچ‌چیز به اداره مهاجرت، مددکار یا صاحب‌خانه فرستاده نمی‌شود."
            enBody="We do not store your documents or conversations on any server. To translate a photo or a recording, it is sent to Google, read, and discarded. Anything you save stays only on your own device. Nothing is ever sent to the Home Office, a caseworker or a landlord."
          />

          {/* 2. What this is */}
          <Section
            fa="این چیست"
            en="What Hamyar is"
            faBody="همیار یک برنامهٔ تحت وب است که در مرورگر باز می‌شود. برنامه‌ای نیست که از اپ استور نصب کنید. برای همین هیچ دسترسی‌ای به مخاطبین، مکان، دوربین به‌جز وقتی خودتان عکس می‌گیرید، یا اطلاعات دستگاه شما نمی‌گیرد و جمع نمی‌کند. حسابی هم در کار نیست: نه ثبت‌نام، نه ورود، نه رمز."
            enBody="Hamyar is a web app that opens in your browser. It is not an app you install from the App Store or Google Play, so it asks for no phone permissions and collects no device metadata: no contacts, no location, no camera access beyond the moment you choose to take a photo. There are no accounts. There is no sign-up, no login and no password."
          />

          {/* 3. Documents and audio - the honest part */}
          <Section
            fa="عکس مدارک و صدای شما"
            en="Your document photos and audio"
            faBody="وقتی نامه یا فرمی را عکس می‌گیرید، یا حرف می‌زنید تا ترجمه شود، آن عکس یا آن صدا به سرویس هوش مصنوعی گوگل (Google Gemini) فرستاده می‌شود تا خوانده و ترجمه شود، و نتیجه برمی‌گردد. این تنها راهی است که ترجمه کار می‌کند. ما این عکس یا صدا را روی سرور خودمان نگه نمی‌داریم. سروری برای ذخیره‌سازی نداریم."
            enBody="When you photograph a letter or a form, or speak to have something translated, that image or that audio is sent to Google's AI service (Google Gemini) so it can be read and translated, and the result comes back. This is how the translation works. We do not keep that image or audio on our side. We have no server database and write nothing to disk."
          />

          {/* 4. What Google does with it */}
          <Section
            fa="گوگل با آن چه می‌کند"
            en="What Google does with it"
            faBody="همیار از سرویس پولی (paid) گوگل استفاده می‌کند. طبق شرایط گوگل، در این سرویس پولی، گوگل از عکس‌ها، صداها یا نوشته‌های شما برای آموزش یا بهتر کردن مدل‌های خودش استفاده نمی‌کند. گوگل این داده‌ها را فقط برای مدت کوتاهی و تنها برای جلوگیری از سوءاستفاده نگه می‌دارد. ما هیچ اطلاعاتی همراه این درخواست‌ها نمی‌فرستیم که بگوید شما که هستید."
            enBody="Hamyar uses Google's paid API service. Under Google's terms, on this paid tier Google does not use your images, audio, prompts or the responses to train or improve its models. Google logs this data only for a limited period, and only to detect and prevent misuse. We send nothing alongside these requests that would identify who you are."
          />

          {/* 5. What stays on your device */}
          <Section
            fa="چه چیزی روی دستگاه شما می‌ماند"
            en="What stays on your device"
            faBody="اگر گفتگویی، عبارتی یا مدرکی را ذخیره کنید، فقط در حافظهٔ مرورگر خودِ دستگاه شما ذخیره می‌شود. به جایی فرستاده نمی‌شود. تاریخچهٔ ترجمه، عبارت‌های ذخیره‌شده و جواب‌های فرم‌ها همین‌طور. مدارکی که در «مدارک من» نگه می‌دارید هم روی همان دستگاه می‌مانند. هر زمان بخواهید می‌توانید همه را با یک لمس پاک کنید، و اگر داده‌های مرورگر را پاک کنید، پاک می‌شوند."
            enBody="If you save a conversation, a phrase or a document, it is kept only in your own device's browser storage. It is not sent anywhere. The same is true of your translation history, saved phrases and form answers. Documents you keep in My Documents also stay on that device. You can clear all of it at any time with a single tap, and it is removed if you clear your browser data."
          />

          {/* 6. Counting visits */}
          <Section
            fa="شمارش بازدید"
            en="Counting visits"
            faBody="برای اینکه بدانیم چند نفر از همیار استفاده می‌کنند و بتوانیم برای گرفتن بودجه مدرک داشته باشیم، از Google Analytics و Microsoft Clarity استفاده می‌کنیم. هیچ‌کدام تا وقتی خودتان «قبول» را نزنید بارگذاری نمی‌شوند. اگر «رد» را بزنید، هیچ‌چیز شمارش نمی‌شود. چیزی که در فرم‌ها می‌نویسید در این ابزارها پنهان می‌ماند."
            enBody="To understand how many people use Hamyar and gather evidence of its usage, we use Google Analytics and Microsoft Clarity to collect and analyse user engagement data. Neither loads unless you press Accept on the cookie notice. If you press Reject, nothing is counted and no cookie is set. What you type into forms is masked from these tools. You can change your choice at any time under Privacy and data."
          />

          {/* 6b. The cookieless count */}
          <Section
            fa="یک شمارش ساده و بی‌کوکی"
            en="A simple, cookieless count"
            faBody="یک شمارندهٔ ساده هم داریم که هر بار همیار باز می‌شود، فقط یک عدد را یکی زیاد می‌کند. این شمارنده کوکی نمی‌گذارد، شناسه‌ای برای شما نمی‌سازد، و هیچ‌چیز دربارهٔ شما ذخیره نمی‌کند، نه آدرس اینترنتی و نه چیز دیگر. تعداد استفاده‌ها را می‌شمارد، نه افراد را. چون چیزی از شما نگه نمی‌دارد، به اجازه نیاز ندارد و همیشه کار می‌کند، حتی اگر «رد» را زده باشید."
            enBody="We also keep a simple counter that adds one to a single number each time Hamyar is opened. It sets no cookie, creates no identifier for you, and stores nothing about you, no IP address and nothing else. It counts uses, not people. Because it keeps nothing about you, it needs no consent and always runs, even if you pressed Reject. We use it only to show funders how much Hamyar is used."
          />

          {/* 7. Not legal advice, not the government */}
          <Section
            fa="چه چیزی نیست"
            en="What Hamyar is not"
            faBody="همیار ترجمه و اطلاعات عمومی می‌دهد. وکیل نیست و جای مشورت حقوقی را نمی‌گیرد. بخشی از دولت یا اداره مهاجرت نیست و به آن‌ها گزارش نمی‌دهد. یک ابزار مستقل است که مِهر هلث (Mehr Health CIC) ساخته است."
            enBody="Hamyar provides translation and general information. It is not a solicitor and does not replace legal advice. It is not part of the government or the Home Office and does not report to them. It is an independent tool built by Mehr Health CIC."
          />

          {/* 8. Contact */}
          <Section
            fa="تماس"
            en="Contact"
            faBody="اگر دربارهٔ داده‌ها یا حریم خصوصی سؤالی دارید، به ما ایمیل بزنید: info@mehrhealth.co.uk"
            enBody="If you have any question about your data or your privacy, email us at info@mehrhealth.co.uk. Hamyar is provided by Mehr Health CIC, a Community Interest Company registered in England and Wales (No. 17139475)."
          />
        </div>

        <div className="p-4 border-t border-edge bg-page flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 min-h-[44px] bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary-press transition"
          >
            <span className="font-farsi">متوجه شدم</span>
            <span className="font-latin"> · Understood</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ fa: string; en: string; faBody: string; enBody: string }> = ({
  fa,
  en,
  faBody,
  enBody,
}) => (
  <section className="space-y-3">
    <div dir="rtl" className="space-y-1.5">
      <h3 className="font-farsi font-bold text-ink text-lg leading-tight">{fa}</h3>
      <p className="font-farsi text-base text-ink-muted leading-relaxed">{faBody}</p>
    </div>
    <div dir="ltr" className="font-latin border-t border-edge pt-3 space-y-1.5">
      <h4 className="font-bold text-ink text-base">{en}</h4>
      <p className="text-sm text-ink-muted leading-relaxed">{enBody}</p>
    </div>
  </section>
);
