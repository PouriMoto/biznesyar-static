<div dir="rtl">

🚀 بیزنس‌یار (Bizyaar) — نسخه استاتیک بدون بک‌اند

🏢 وب‌سایت دستیار کسب‌وکار در بندرعباس و هرمزگان — جواز کسب، ثبت شرکت، کارت بازرگانی و امور مالیاتی
⚡ سریع · سئو‌محور · فارسی/RTL · بدون هزینه سرور
📬 لیدها به گوگل‌فرم و شیت آن می‌روند و سایت روی GitHub Pages منتشر می‌شود.

ℹ️ نسخه کامل با ورود پیامکی، پنل مشتری/اپراتور و پیگیری پرونده (PocketBase) در ریپوی دیگری است. هر دو از یک کدبیس‌اند و با کلید "mode" در src/config/site.config.json عوض می‌شوند.

---

📑 فهرست مطالب

· ✨ امکانات
· ⚡ شروع سریع
· 📬 اتصال گوگل‌فرم
· 🔔 اعلان لید جدید
· 🎛️ فعال و غیرفعال‌کردن فرم لید
· 🎨 شخصی‌سازی
· 📝 محتوا (مقاله، شهر، تصویر، ویدیو)
· 🚀 استقرار روی GitHub Pages
· 🧪 تست
· 📁 ساختار پروژه
· 🛠️ دستورات
· ⚠️ محدودیت‌ها و موارد تست‌نشده
· 🔄 رفتن به نسخه کامل
· ©️ مجوز و اعتبار

---

✨ امکانات

· 🏠 صفحه اصلی، صفحه هر خدمت، ۱۵ صفحه منطقه (بندرعباس، قشم، کیش، میناب، رودان و بقیه شهرستان‌های هرمزگان)، مقالات، تماس، درباره
· 🔍 JSON-LD (سازمان، خدمت، مقاله، FAQ، breadcrumb، ویدیو)، sitemap، robots.txt، llms.txt و llms-full.txt ساخته‌شده در build
· 🔤 فونت Vazirmatn از خود پروژه (بدون CDN)، تصاویر بهینه با alt اجباری برای تصویر شاخص، <Figure> <Video> <Callout> در MDX
· 📞 دکمه دایره‌ای تماس شناور، آدرس و تلفن‌ها در فوتر
· 📝 فرم لید (صفحه اصلی، خدمت، منطقه، مقاله، تماس) و لید مگنت (PDF فهرست مدارک در ازای شماره موبایل) → گوگل‌فرم
· 💾 لید ناموفق (اینترنت ضعیف یا فیلتر) در مرورگر ذخیره و دفعه بعد دوباره ارسال می‌شود
· 🎚️ فرم هر جایگاه و هر مقاله جداگانه قابل خاموش‌کردن است
· 📊 رویدادها (track()): page_view، cta_click، form_submit، article_read، magnet_* (قابل اتصال به Yandex Metrica)

🚫 در این نسخه نیست: ورود با پیامک، پنل مشتری/اپراتور، آپلود مدارک، پیگیری پرونده، اعلان خودکار. صفحات /login/، /panel/ و /ops/ به صفحه تماس هدایت می‌شوند و دکمه‌های ورود نمایش داده نمی‌شوند.

---

⚡ شروع سریع

نیاز: Node.js ≥ 22.12 و Git (این پروژه با npm کار می‌کند).

```bash
npm install
npm run dev        # http://localhost:4321  (مقالات draft هم دیده می‌شوند)
npm run build      # خروجی در dist/
npm run preview    # پیش‌نمایش build
```

---

📬 اتصال گوگل‌فرم

۱. در forms.google.com فرمی با ۸ سؤال «پاسخ کوتاه» به همین ترتیب بساز:
نام، موبایل، خدمت، منطقه، پیام، صفحه، منبع، utm
⚠️ هیچ‌کدام «الزامی» نباشد.

۲. تنظیمات: ورود با حساب گوگل لازم نباشد، «Limit to 1 response» و جمع‌آوری ایمیل خاموش، بدون آپلود فایل. تب Responses ← «Link to Sheets».

۳. آدرس ارسال: آدرس فرم …/forms/d/e/<شناسه>/viewform است؛ viewform را formResponse کن.

۴. شناسه سؤال‌ها: صفحه فرم را باز کن، در کنسول (F12) این را بزن:

```js
[...document.querySelectorAll('input[name^="entry."],textarea[name^="entry."]')].map(e=>e.name+'  ←  '+(e.getAttribute('aria-label')||''))
```

اگر خالی بود: ⋮ ← «Get pre-filled link» و در آدرس‌ساخته‌شده entry.…= هر سؤال را بردار.

۵. در src/config/site.config.json:

```json
"mode": "static",
"leads": {
  "enabled": true,
  "provider": "google-form",
  "googleForm": {
    "action": "https://docs.google.com/forms/d/e/<شناسه>/formResponse",
    "fields": { "name": "entry.…", "phone": "entry.…", "service": "entry.…", "region": "entry.…",
                "message": "entry.…", "page": "entry.…", "source": "entry.…", "utm": "entry.…" }
  },
  "placements": { "hero": true, "service": true, "area": true, "article": true, "contact": true, "magnet": true }
}
```

⚠️ حتماً تست کن: با npm run dev یک لید بفرست و در شیت ببین آمد. مرورگر برای گوگل‌فرم پاسخ خواندنی نمی‌دهد؛ پس شناسه غلط هم «موفق» نشان می‌دهد ولی در شیت چیزی نمی‌آید.

---

🔔 اعلان لید جدید

روش توضیح
📧 ساده گوگل‌فرم ← Responses ← ⋮ ← «Get email notifications for new responses»
🤖 بله (اختیاری) در شیت، Extensions ← Apps Script، تابع onFormSubmit(e) با UrlFetchApp.fetch("https://tapi.bale.ai/bot<توکن>/sendMessage", …) و Trigger «From spreadsheet / On form submit» (کد کامل در SETUP-STATIC.md)
📋 پیگیری یک ستون «وضعیت» در شیت اضافه کن و با فیلتر کار کن

⏳ وضعیت فعلی: اتصال به بله هنوز انجام نشده و در نسخه فعلی فقط اعلان ایمیلی گوگل‌فرم فعال است.

---

🎛️ فعال و غیرفعال‌کردن فرم لید

· همه‌جا: "leads.enabled": false → به‌جای فرم، دکمه‌های تماس نمایش داده می‌شود
· یک جایگاه: placements.<hero|service|area|article|contact|magnet>: false
· یک مقاله: در front matter: leadForm: false (فرم پایین مقاله) و/یا magnet: false (PDF)

---

🎨 شخصی‌سازی

می‌خواهم… فایل
🎨 رنگ، لوگو، تلفن‌ها، آدرس، ساعت، پیام‌رسان‌ها، خدمات، لید مگنت، گوگل‌فرم src/config/site.config.json
🏠 متن صفحه اصلی، FAQ، درباره ما src/data/home.json
🧰 محتوای صفحه هر خدمت src/data/services.json
🗺️ شهرها src/data/regions.json + src/content/areas/<slug>.md
📰 مقاله src/content/articles/
🖼️ لوگو، favicon، تصویر اشتراک‌گذاری public/brand/ (logo.svg, logo-light.svg, favicon.svg, og.png ‏۱۲۰۰×۶۳۰)
📄 PDF لید مگنت python3 scripts/make-pdf.py business-license ← public/downloads/
💅 ظاهر src/styles/global.css

💡 رنگ‌ها از theme.primary و theme.accent به CSS variable تبدیل می‌شوند. آیدی پیام‌رسان‌ها (whatsapp, bale, rubika, instagram) بدون @ و لینک؛ تا خالی باشند، دکمه‌شان نمایش داده نمی‌شود. تلفن‌ها در contact.phones.

---

📝 محتوا (مقاله، شهر، تصویر، ویدیو)

🏙️ شهر جدید: یک آیتم به regions.json (slug, name, kind, intro, featured)؛ صفحه، sitemap و فرم‌ها خودکار ساخته می‌شوند.

🖼️ تصویر شاخص مقاله (alt اجباری؛ بدون آن build خطا می‌دهد):

```yaml
cover:
  src: ../../assets/articles/<slug>/cover.webp   # ۱۲۰۰×۶۳۰
  alt: توضیح واقعی تصویر
  caption: زیرنویس اختیاری
```

بهینه‌سازی، width/height، og:image و تصویر JSON-LD خودکار است.

🧩 داخل متن (.mdx):

· <Figure src={img} alt="..." caption="..." />
· <Video src="/videos/x.mp4" poster={p} title="..." description="..." duration="PT3M" uploadDate="2026-10-06" />
· <Callout variant="info|warning|tip">…</Callout>

📋 front matter مقاله:
title, description (≤۲۰۰), category, tags, service, region, publishedAt, reviewedAt, draft, leadForm, magnet, cover, faq, sources

· draft: true یعنی در سایت نهایی و llms.txt نمی‌آید. اگر مقدار YAML دو نقطه دارد داخل " بگذار.
· reviewedAt را فقط وقتی بنویس که خودت واقعاً بازبینی کرده‌ای (نشان «بازبینی‌شده» می‌گیرد).
· مقاله «جواز کسب بندرعباس/میناب/رودان» آماده است ولی draft است و باید با تجربه واقعی بازبینی شود؛ دو مقاله دیگر نمونه‌اند.

---

🚀 استقرار روی GitHub Pages

۱. ریپو بساز و کد را push کن. پلن رایگان Pages ریپوی Public می‌خواهد (سایت استاتیک است؛ شناسه‌های گوگل‌فرم در هر حال داخل سایت دیده می‌شود). پوشه server/ (نسخه کامل) را در این ریپو نگذار.

۲. Settings ← Pages ← Source: GitHub Actions.

۳. با هر push به main، .github/workflows/deploy-pages.yml سایت را می‌سازد و منتشر می‌کند (تب Actions).

۴. 🌐 دامنه اختصاصی: Settings ← Secrets and variables ← Actions ← Variables:
CUSTOM_DOMAIN = bizyaar.ir و SITE_URL = https://bizyaar.ir (برای canonical و sitemap؛ بدون آن سئو درست نیست).

DNS:

· ۴ رکورد A برای دامنه ریشه به: 185.199.108.153, .109.153, .110.153, .111.153
· رکورد CNAME برای www به <نام‌کاربری>.github.io
· سپس «Enforce HTTPS»

⚠️ بدون دامنه: فقط ریپویی به نام <نام‌کاربری>.github.io (آدرس ریشه) کار می‌کند؛ آدرس‌های …github.io/نام-ریپو کار نمی‌کنند چون لینک‌ها از ریشه شروع می‌شوند.

🔁 جایگزین (اگر GitHub Pages از ایران کند بود): npm run build و آپلود محتوای dist/ روی هر هاست استاتیک ایرانی (FTP/cPanel)، یا Workflow دستی deploy-ssh.yml برای VPS (Secrets: SSH_KEY, SSH_HOST, SSH_USER, SSH_PORT).

✅ وضعیت فعلی: GitHub Actions روی ریپو بالا آمده و بیلد/انتشار با موفقیت انجام می‌شود.

---

🧪 تست

```bash
python3 static-test.py   # Playwright + شبیه‌ساز گوگل‌فرم
```

پیش‌نیاز: build با فرم تستی (مثلاً TESTID و entry.111…)، سرو dist/ روی پورت ۴۳۳۱ و pip install playwright.

بررسی می‌کند:

· ✅ پایلود ارسال با شناسه‌های درست و ارقام فارسی
· ✅ ذخیره و ارسال مجدد لید در قطعی
· ✅ خاموش‌شدن فرم در جایگاه یا مقاله
· ✅ لید مگنت
· ✅ هدایت صفحات پنل و نبود لینک ورود
· ✅ نبود خطای جاوااسکریپت

ارسال به گوگل واقعی را باید خودت تست کنی (که انجام شده ✅).

---

📁 ساختار پروژه

```
├── public/            brand/ fonts/ flows/ help/ downloads/
├── src/
│   ├── config/site.config.json  ✏️  تنظیمات، رنگ، تماس، گوگل‌فرم
│   ├── data/                    ✏️  home / services / regions
│   ├── content/                 ✏️  articles / areas
│   ├── components/ layouts/ pages/ lib/ styles/
│   └── scripts/                 lead-send.ts (گوگل‌فرم)، lead-form.ts، lead-magnet.ts، track.ts
├── scripts/           make-pdf.py  deploy.sh
├── .github/workflows/ deploy-pages.yml  deploy-ssh.yml
├── SETUP-STATIC.md    flow-guide.md
└── astro.config.mjs
```

ℹ️ public/flows و flow-guide.md برای نسخه کامل و ساخت PDF هستند؛ src/scripts/panel/ و صفحات پنل در نسخه استاتیک غیرفعال‌اند.

---

🛠️ دستورات

دستور کار
npm install 📦 نصب وابستگی‌ها
npm run dev 🧑‍💻 سرور توسعه
npm run build 🏗️ ساخت dist/
npm run preview 👀 پیش‌نمایش build
npm run deploy 🚚 rsync دستی (لینوکس/WSL)

---

⚠️ محدودیت‌ها و موارد تست‌نشده

· ✅ ارسال به گوگل‌فرم واقعی تست شده و کار می‌کند.
· ⏳ اتصال اعلان بله هنوز انجام نشده.
· 🌍 دسترسی از ایران: گوگل‌فرم و GitHub Pages را از شبکه‌های مختلف (ایرانسل، همراه اول، ثابت) بررسی کن.
· 🖼️ متن «درباره ما»، لوگو و og.png موقت‌اند؛ مقاله‌ها نمونه/پیش‌نویس‌اند.
· 📜 صفحه حریم خصوصی و قوانین هنوز نیست.
· 🔒 شیت پاسخ‌ها را خصوصی نگه‌دار و در این نسخه از مشتری مدرک نخواه (فقط شماره و توضیح کوتاه).

---

🔄 رفتن به نسخه کامل

"mode": "backend" ← پوشه server/ را از ریپوی نسخه کامل کنار PocketBase بگذار ← مراحل SETUP-BACKEND.md ← استقرار روی VPS.

💡 لیدهای شیت را به CSV صادر کن؛ اسکریپت واردکردن آن‌ها به PocketBase در نقشه راه فاز ۲ است.

---

©️ مجوز و اعتبار

ابزارهای متن‌باز استفاده‌شده:

· Astro — MIT
· Playwright — Apache 2.0
· فونت Vazirmatn — OFL

---

🔒 مجوز اختصاصی (Proprietary License)

© ۱۴۰۴ / ۲۰۲۵ — بیزنس‌یار (Bizyaar) — تمامی حقوق محفوظ است.

این پروژه، شامل کد منبع، طراحی، محتوا، متن‌ها، تصاویر، لوگو، ساختار صفحات، فایل‌های پیکربندی و مستندات، دارایی معنوی و اختصاصی نویسنده (مولف) است و تحت هیچ مجوز متن‌باز یا آزادی منتشر نمی‌شود.

استفاده از این پروژه تنها با شرایط زیر مجاز است:

1. ✅ کسب اجازه کتبی و صریح از مولف الزامی است. بدون اجازه کتبی، هرگونه استفاده — حتی شخصی — ممنوع است.
2. 🚫 ممنوعیت استفاده در کسب‌وکار مشابه: در صورت دریافت اجازه، استفاده از این پروژه صرفاً برای کسب‌وکارهایی مجاز است که با حوزه فعالیت «بیزنس‌یار» (خدمات جواز کسب، ثبت شرکت، کارت بازرگانی و امور مالیاتی در بندرعباس و هرمزگان) رقابت نکنند و در دسته‌بندی مشابه قرار نگیرند.
3. 🎨 الزام تغییر کامل هویت بصری و متنی: در صورت اجازه استفاده، رنگ‌بندی، پالت رنگی، لوگو، فونت‌های اختصاصی، متن‌ها، نام‌ها، محتوای مقالات، ساختار برند و کلیه متون فارسی/انگلیسی باید به‌طور کامل و اساسی تغییر کنند به شکلی که هیچ شباهت قابل‌تشخیصی با برند، محتوا و هویت «بیزنس‌یار» نداشته باشد.
4. 📛 حفظ و نمایش نام مولف: نام مولف اصلی باید در فایل NOTICE و در بخش اعتبارات پروژه (credits) به‌صورت واضح ذکر شود.
5. 🚫 ممنوعیت فروش مجدد، توزیع، یا ساب‌لایسنس بدون اجازه کتبی.
6. 🚫 ممنوعیت حذف یا مخدوش‌کردن این مجوز در نسخه‌های مشتق‌شده.

عدم رعایت هر یک از شرایط بالا به منزله نقض حق نشر و پیگرد قانونی است.

برای دریافت اجازه استفاده، لطفاً از طریق اطلاعات تماس موجود در سایت bizyaar.ir درخواست خود را ارسال کنید.

---

<p align="center">
  ساخته‌شده با ❤️ برای کسب‌وکارهای هرمزگان
  <br/>
  <sub>بیزنس‌یار — دستیار کسب‌وکار شما</sub>
</p>

</div>
