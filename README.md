# 🚀 بیزنس‌یار (Bizyaar) — نسخه استاتیک بدون بک‌اند

> 🏢 وب‌سایت دستیار کسب‌وکار در بندرعباس و هرمزگان — جواز کسب، ثبت شرکت، کارت بازرگانی و امور مالیاتی
> ⚡ سریع · سئو‌محور · فارسی/RTL · بدون هزینه سرور

---

## 📑 فهرست مطالب

- [✨ امکانات](#-امکانات)
- [⚡ شروع سریع](#-شروع-سریع)
- [📬 اتصال گوگل‌فرم](#-اتصال-گوگلفرم)
- [🔔 اعلان لید جدید](#-اعلان-لید-جدید)
- [🎛️ فعال و غیرفعال‌کردن فرم لید](#️-فعال-و-غیرفعالکردن-فرم-لید)
- [🎨 شخصی‌سازی](#-شخصیسازی)
- [📝 محتوا](#-محتوا)
- [🚀 استقرار روی GitHub Pages](#-استقرار-روی-github-pages)
- [🧪 تست](#-تست)
- [📁 ساختار پروژه](#-ساختار-پروژه)
- [🛠️ دستورات](#️-دستورات)
- [⚠️ محدودیت‌ها](#️-محدودیتها)
- [🔄 رفتن به نسخه کامل](#-رفتن-به-نسخه-کامل)
- [©️ مجوز و اعتبار](#️-مجوز-و-اعتبار)

---

## ✨ امکانات

- 🏠 صفحه اصلی، صفحه هر خدمت، ۱۵ صفحه منطقه (بندرعباس، قشم، کیش، میناب، رودان و بقیه شهرستان‌های هرمزگان)، مقالات، تماس، درباره
- 🔍 JSON-LD، sitemap، `robots.txt`، `llms.txt` و `llms-full.txt` ساخته‌شده در build
- 🔤 فونت Vazirmatn از خود پروژه (بدون CDN)، تصاویر بهینه با alt اجباری
- 📞 دکمه دایره‌ای تماس شناور، آدرس و تلفن‌ها در فوتر
- 📝 فرم لید (صفحه اصلی، خدمت، منطقه، مقاله، تماس) و لید مگنت (PDF فهرست مدارک) به گوگل‌فرم
- 💾 لید ناموفق در مرورگر ذخیره و دفعه بعد دوباره ارسال می‌شود
- 🎚️ فرم هر جایگاه و هر مقاله جداگانه قابل خاموش‌کردن است
- 📊 رویدادها (`track()`): `page_view`، `cta_click`، `form_submit`، `article_read`، `magnet_*`

> 🚫 در این نسخه نیست: ورود با پیامک، پنل مشتری/اپراتور، آپلود مدارک، پیگیری پرونده، اعلان خودکار.

---

## ⚡ شروع سریع

نیاز: Node.js نسخه ۲۲.۱۲ یا بالاتر و Git (این پروژه با npm کار می‌کند).

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # خروجی در dist/
npm run preview    # پیش‌نمایش build
```

---

## 📬 اتصال گوگل‌فرم

۱. در forms.google.com فرمی با ۸ سؤال «پاسخ کوتاه» بساز:
   نام، موبایل، خدمت، منطقه، پیام، صفحه، منبع، utm

۲. تنظیمات: ورود با حساب گوگل لازم نباشد، «Limit to 1 response» و جمع‌آوری ایمیل خاموش.

۳. آدرس ارسال: `…/forms/d/e/<شناسه>/viewform` را به `…/formResponse` تغییر بده.

۴. شناسه سؤال‌ها: در کنسول (F12) صفحه فرم:

```js
[...document.querySelectorAll('input[name^="entry."],textarea[name^="entry."]')].map(e=>e.name+'  ←  '+(e.getAttribute('aria-label')||''))
```

۵. در `src/config/site.config.json` بخش `leads.googleForm` را پر کن.

> ⚠️ حتماً تست کن: شناسه غلط هم «موفق» نشان می‌دهد ولی در شیت چیزی نمی‌آید.

---

## 🔔 اعلان لید جدید

- 📧 ساده: گوگل‌فرم ← Responses ← ⋮ ← «Get email notifications»
- 🤖 بله (اختیاری): Apps Script با `UrlFetchApp.fetch("https://tapi.bale.ai/bot<توکن>/sendMessage", …)`
- 📋 پیگیری: یک ستون «وضعیت» در شیت اضافه کن

> ⏳ وضعیت فعلی: اتصال به بله هنوز انجام نشده.

---

## 🎛️ فعال و غیرفعال‌کردن فرم لید

- همه‌جا: `"leads.enabled": false`
- یک جایگاه: `placements.<hero|service|area|article|contact|magnet>: false`
- یک مقاله: در front matter: `leadForm: false` و/یا `magnet: false`

---

## 🎨 شخصی‌سازی

- 🎨 رنگ، لوگو، تلفن‌ها، خدمات، گوگل‌فرم ← `src/config/site.config.json`
- 🏠 متن صفحه اصلی، FAQ ← `src/data/home.json`
- 🧰 محتوای هر خدمت ← `src/data/services.json`
- 🗺️ شهرها ← `src/data/regions.json`
- 📰 مقاله ← `src/content/articles/`
- 🖼️ لوگو، favicon، og ← `public/brand/`
- 💅 ظاهر ← `src/styles/global.css`

---

## 📝 محتوا

🏙️ شهر جدید: یک آیتم به `regions.json` اضافه کن؛ صفحه، sitemap و فرم‌ها خودکار ساخته می‌شوند.

🖼️ تصویر شاخص مقاله (alt اجباری):

```yaml
cover:
  src: ../../assets/articles/<slug>/cover.webp
  alt: توضیح واقعی تصویر
  caption: زیرنویس اختیاری
```

🧩 داخل متن (`.mdx`):

- `<Figure src={img} alt="..." caption="..." />`
- `<Video src="/videos/x.mp4" poster={p} title="..." />`
- `<Callout variant="info|warning|tip">…</Callout>`

📋 front matter مقاله:
`title, description, category, tags, service, region, publishedAt, reviewedAt, draft, leadForm, magnet, cover, faq, sources`

---

## 🚀 استقرار روی GitHub Pages

۱. ریپو بساز و کد را push کن (پلن رایگان Pages ریپوی Public می‌خواهد).

۲. Settings ← Pages ← Source: GitHub Actions.

۳. با هر push به `main`، `.github/workflows/deploy-pages.yml` سایت را می‌سازد.

۴. دامنه اختصاصی: Variables را ست کن:

- `CUSTOM_DOMAIN = bizyaar.ir`
- `SITE_URL = https://bizyaar.ir`

DNS:

- ۴ رکورد A به: `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
- رکورد CNAME برای `www` به `<نام‌کاربری>.github.io`
- سپس «Enforce HTTPS»

> ✅ وضعیت فعلی: GitHub Actions بالا آمده و بیلد/انتشار موفق است.

---

## 🧪 تست

```bash
python3 static-test.py   # Playwright + شبیه‌ساز گوگل‌فرم
```

بررسی می‌کند: ارسال با شناسه‌های درست · ذخیره لید در قطعی · خاموش‌شدن فرم · لید مگنت · هدایت صفحات پنل · نبود خطای JS

---

## 📁 ساختار پروژه

```
├── public/            brand/ fonts/ flows/ help/ downloads/
├── src/
│   ├── config/site.config.json  ✏️  تنظیمات
│   ├── data/                    ✏️  home / services / regions
│   ├── content/                 ✏️  articles / areas
│   ├── components/ layouts/ pages/ lib/ styles/
│   └── scripts/                 lead-send.ts، lead-form.ts، track.ts
├── scripts/           make-pdf.py  deploy.sh
├── .github/workflows/ deploy-pages.yml
└── astro.config.mjs
```

---

## 🛠️ دستورات

- `npm install` → 📦 نصب وابستگی‌ها
- `npm run dev` → 🧑‍💻 سرور توسعه
- `npm run build` → 🏗️ ساخت `dist/`
- `npm run preview` → 👀 پیش‌نمایش build
- `npm run deploy` → 🚚 rsync دستی

---

## ⚠️ محدودیت‌ها

- ✅ ارسال به گوگل‌فرم واقعی تست شده و کار می‌کند
- ⏳ اتصال اعلان بله هنوز انجام نشده
- 🌍 دسترسی از ایران: از شبکه‌های مختلف بررسی کن
- 🖼️ متن «درباره ما»، لوگو و `og.png` موقت‌اند
- 📜 صفحه حریم خصوصی و قوانین هنوز نیست

---

## 🔄 رفتن به نسخه کامل

`"mode": "backend"` ← پوشه `server/` را کنار PocketBase بگذار ← مراحل `SETUP-BACKEND.md` ← استقرار روی VPS.

---

## ©️ مجوز و اعتبار

ابزارهای متن‌باز: Astro (MIT) · Playwright (Apache 2.0) · فونت Vazirmatn (OFL)

### 🔒 مجوز اختصاصی (Proprietary License)

© ۱۴۰۴ / ۲۰۲۵ — بیزنس‌یار (Bizyaar) — تمامی حقوق محفوظ است.

این پروژه، شامل کد منبع، طراحی، محتوا، متن‌ها، تصاویر، لوگو و مستندات، دارایی معنوی و اختصاصی مولف است و تحت هیچ مجوز متن‌باز منتشر نمی‌شود.

شرایط استفاده:

۱. ✅ کسب اجازه کتبی و صریح از مولف الزامی است.
۲. 🚫 ممنوعیت استفاده در کسب‌وکار مشابه: صرفاً برای کسب‌وکارهایی مجاز است که با حوزه «بیزنس‌یار» (جواز کسب، ثبت شرکت، کارت بازرگانی، امور مالیاتی) رقابت نکنند.
۳. 🎨 الزام تغییر کامل هویت بصری و متنی: رنگ‌بندی، لوگو، متن‌ها و محتوا باید به‌طور کامل تغییر کنند.
۴. 📛 حفظ نام مولف در فایل `NOTICE` و بخش اعتبارات.
۵. 🚫 ممنوعیت فروش مجدد یا ساب‌لایسنس بدون اجازه کتبی.
۶. 🚫 ممنوعیت حذف این مجوز در نسخه‌های مشتق‌شده.

عدم رعایت، نقض حق نشر و پیگرد قانونی است.

برای اجازه استفاده: bizyaar.ir

---

ساخته‌شده با ❤️ برای کسب‌وکارهای هرمزگان
بیزنس‌یار — دستیار کسب‌وکار شما
