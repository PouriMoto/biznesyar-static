# اتصال دامنه اختصاصی به GitHub Pages با Cloudflare و Astro

**پروژه:** بیزنس‌یار (Biznesyar)  
**دامنه اصلی:** `https://biznesyar.ir`  
**دامنه جایگزین:** `https://www.biznesyar.ir`  
**مخزن GitHub:** https://github.com/pourimoto/biznesyar-static  
**میزبانی:** GitHub Pages  
**مدیریت DNS:** Cloudflare Free  
**فریم‌ورک سایت:** Astro  
**وضعیت:** اتصال دامنه و HTTPS تأیید شده؛ بررسی Sitemap در انتظار تأیید نهایی

---

## ۱. هدف و معماری

هدف این راهنما ثبت مراحل اتصال دامنه‌ای است که از IRNIC خریداری شده به وب‌سایت استاتیک Astro روی GitHub Pages، با استفاده از Cloudflare برای مدیریت DNS.

معماری نهایی:

```text
کاربر
  |
  v
biznesyar.ir
  |
  v
DNS مدیریت‌شده توسط Cloudflare
  |
  v
GitHub Pages
  |
  v
فایل‌های استاتیک تولیدشده توسط Astro
```

در این معماری:

- **IRNIC:** ثبت دامنه و تعیین Name Serverها.
- **Cloudflare:** مدیریت DNS دامنه.
- **GitHub Pages:** میزبانی نسخه منتشرشده سایت.
- **Astro:** ساخت صفحات، فایل‌های استاتیک و Sitemap.
- **GitHub Actions:** اجرای فرایند Build و انتشار، مطابق Workflow پروژه.

نکته: استفاده از Cloudflare برای مدیریت DNS به معنای استفاده از Cloudflare Pages نیست. سایت همچنان روی GitHub Pages میزبانی می‌شود.

## ۲. پیش‌نیازها

قبل از شروع باید موارد زیر در دسترس باشند:

- دامنه ثبت‌شده در IRNIC.
- حساب Cloudflare و امکان تغییر Name Serverهای دامنه.
- مخزن GitHub دارای سایت Astro.
- دسترسی مدیریتی به تنظیمات مخزن و GitHub Pages.
- فایل تنظیمات Astro و تنظیمات اصلی برند سایت.

مخزن پروژه:

`https://github.com/pourimoto/biznesyar-static`

آدرس اولیه سایت پیش از اتصال دامنه:

`https://pourimoto.github.io/biznesyar-static/`

## ۳. افزودن دامنه به Cloudflare

۱. وارد حساب Cloudflare شوید.

۲. گزینه افزودن سایت یا Add a domain را انتخاب کنید.

۳. دامنه زیر را وارد کنید:

`biznesyar.ir`

۴. طرح رایگان Cloudflare را انتخاب کنید.

۵. پس از بررسی DNS، Cloudflare دو Name Server اختصاصی برای دامنه ارائه می‌کند.

Name Serverهای اختصاص‌یافته به این دامنه:

```text
becky.ns.cloudflare.com
yoxall.ns.cloudflare.com
```

این مقادیر مخصوص همین دامنه هستند. برای دامنه‌های دیگر باید Name Serverهای نمایش‌داده‌شده در حساب Cloudflare همان دامنه را استفاده کرد.

## ۴. تغییر Name Server در IRNIC

در پنل مدیریت دامنه IRNIC:

۱. دامنه `biznesyar.ir` را انتخاب کنید.

۲. بخش تغییر یا مدیریت Name Serverها را باز کنید.

۳. Name Serverهای قبلی را با مقادیر اختصاص‌یافته توسط Cloudflare جایگزین کنید:

```text
becky.ns.cloudflare.com
yoxall.ns.cloudflare.com
```

۴. تغییرات را ذخیره کنید.

۵. به Cloudflare برگردید و وضعیت دامنه را بررسی کنید.

در این پروژه، وضعیت ابتدا به‌صورت Invalid nameservers نمایش داده شد؛ پس از اعمال و شناسایی تنظیمات، وضعیت دامنه به Active تغییر کرد.

**نکته:** تغییر Name Server ممکن است فوراً در تمام نقاط اینترنت قابل مشاهده نباشد. انتشار تغییرات DNS می‌تواند زمان‌بر باشد.

## ۵. تنظیم رکوردهای DNS در Cloudflare

مسیر:

`Cloudflare Dashboard → biznesyar.ir → DNS → Records`

### ۵.۱. رکوردهای دامنه اصلی

چهار رکورد A برای اتصال دامنه ریشه به GitHub Pages ایجاد شد.

| Type | Name | IPv4 Address | TTL | Proxy |
|---|---|---|---|---|
| A | `@` | `185.199.108.153` | Auto | DNS only |
| A | `@` | `185.199.109.153` | Auto | DNS only |
| A | `@` | `185.199.110.153` | Auto | DNS only |
| A | `@` | `185.199.111.153` | Auto | DNS only |

این چهار آدرس، آدرس‌های IPv4 اعلام‌شده برای GitHub Pages هستند.

منبع رسمی: [GitHub Docs — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

### ۵.۲. رکورد زیردامنه www

رکورد پنجم برای آدرس `www` ایجاد شد:

| Type | Name | Target | TTL | Proxy |
|---|---|---|---|---|
| CNAME | `www` | `pourimoto.github.io` | Auto | DNS only |

**نکته مهم:** مقصد CNAME باید نام میزبان GitHub Pages باشد؛ مسیر مخزن نباید به آن اضافه شود.

مقدار صحیح:

```text
pourimoto.github.io
```

مقدار نادرست:

```text
pourimoto.github.io/biznesyar-static/
```

CNAME نام میزبان را مشخص می‌کند، نه مسیر یک پوشه یا پروژه.

### ۵.۳. چرا DNS only انتخاب شد؟

برای این پیکربندی، رکوردها با وضعیت DNS only تنظیم شدند تا Cloudflare صرفاً پاسخ DNS را مدیریت کند و درخواست‌ها مستقیماً به زیرساخت GitHub Pages برسند.

در صورت تغییر وضعیت Proxy یا افزودن تنظیمات دیگر، باید رفتار DNS و صدور گواهی HTTPS مجدداً بررسی شود.

### ۵.۴. رکوردهای اضافی

در پیکربندی تأییدشده این پروژه، چهار رکورد A و یک رکورد CNAME وجود داشت.

رکورد AAAA در این راه‌اندازی اضافه نشد. اگر در آینده IPv6 اضافه شود، باید مقادیر رسمی GitHub Pages استفاده و صدور گواهی HTTPS مجدداً بررسی شود.

از ایجاد رکوردهای اضافی یا متناقض، خصوصاً رکوردهای A، AAAA یا CNAME غیرضروری، خودداری کنید.

## ۶. اتصال دامنه در GitHub Pages

مسیر تنظیمات:

`GitHub Repository → Settings → Pages`

مخزن:

`https://github.com/pourimoto/biznesyar-static`

در بخش **Custom domain** مقدار زیر وارد و ذخیره شد:

```text
biznesyar.ir
```

سپس وضعیت DNS در GitHub بررسی شد.

نتیجه تأییدشده:

- DNS check successful
- دامنه اصلی توسط GitHub Pages شناسایی شد.

طبق مستندات GitHub، ثبت دامنه در تنظیمات Pages و سپس تنظیم DNS، مراحل اصلی اتصال دامنه اختصاصی هستند.

منبع رسمی: [GitHub Docs — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## ۷. فعال‌سازی HTTPS

در همان صفحه Settings → Pages، گزینه **Enforce HTTPS** بررسی شد.

وضعیت نهایی:

- گزینه تیک خورده است.
- فعال است.
- در وضعیت فعلی قابل تغییر نیست.

این وضعیت با فعال بودن گزینه سازگار است؛ وقتی تنظیم از قبل فعال شده باشد، ممکن است کنترل آن در رابط کاربری غیرفعال نمایش داده شود.

HTTPS باعث رمزگذاری ارتباط مرورگر و سایت می‌شود و درخواست‌های HTTP را به HTTPS هدایت می‌کند.

منبع رسمی: [GitHub Docs — Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

## ۸. بررسی تنظیمات Astro

### ۸.۱. فایل astro.config.mjs

محتوای تنظیمات بررسی‌شده:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { readFileSync } from 'node:fs';

const site = JSON.parse(
  readFileSync(
    new URL('./src/config/site.config.json', import.meta.url),
    'utf-8'
  )
);

export default defineConfig({
  site: process.env.SITE_URL || site.brand.url,
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    format: 'directory',
    inlineStylesheets: 'always'
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(login|panel|ops)\/?$/.test(page)
    })
  ],
});
```

این تنظیمات چه می‌کنند؟

- `site`: آدرس پایه سایت را تعیین می‌کند.
- `trailingSlash: 'always'`: آدرس صفحات را با اسلش پایانی هماهنگ می‌کند.
- `compressHTML`: فشرده‌سازی HTML خروجی را فعال می‌کند.
- `build.format: 'directory'`: ساختار خروجی پوشه‌ای برای صفحات تولید می‌کند.
- `inlineStylesheets: 'always'`: CSSهای قابل‌درج در HTML را تا حد امکان درون‌خطی می‌کند.
- `mdx()`: امکان استفاده از محتوای MDX را فراهم می‌کند.
- `sitemap()`: Sitemap تولید می‌کند و فیلتر تعریف‌شده، صفحات مشخص‌شده با مسیرهای `login`، `panel` و `ops` را از Sitemap خارج می‌کند.

### ۸.۲. آیا باید base را تغییر داد؟

در فایل بررسی‌شده، گزینه زیر وجود نداشت:

```js
base: '/biznesyar-static/'
```

بنابراین چیزی برای حذف کردن از این فایل وجود نداشت.

این نکته مهم است؛ سایت پروژه‌ای GitHub Pages معمولاً در مسیر نام مخزن منتشر می‌شود، اما پس از استفاده از دامنه اختصاصی، سایت از ریشه دامنه در دسترس قرار می‌گیرد.

برای پروژه حاضر، بررسی نهایی باید مطمئن شود که هیچ فایل یا تنظیم دیگری مسیر `/biznesyar-static/` را به‌صورت ثابت به لینک‌ها، CSS، JavaScript یا تصاویر اضافه نمی‌کند.

### ۸.۳. فایل src/config/site.config.json

در این فایل، آدرس اصلی برند بررسی شد:

```json
{
  "brand": {
    "name_fa": "بیزنس‌یار",
    "name_en": "Biznesyar",
    "url": "https://biznesyar.ir"
  }
}
```

مقدار صحیح است:

```text
https://biznesyar.ir
```

در `astro.config.mjs` این مقدار به‌عنوان جایگزین متغیر محیطی `SITE_URL` استفاده می‌شود:

```js
site: process.env.SITE_URL || site.brand.url
```

بنابراین اگر متغیر محیطی `SITE_URL` در GitHub Actions تعریف شده باشد، مقدار آن بر `brand.url` اولویت دارد. اگر Sitemap یا آدرس‌های canonical اشتباه بودند، مقدار `SITE_URL` در تنظیمات Workflow یا مخزن نیز باید بررسی شود.

### ۸.۴. مسیر فایل‌های استاتیک

در فایل تنظیمات برند، مسیر دارایی‌ها به این شکل تعریف شده‌اند:

```json
{
  "assets": {
    "logo": "/brand/logo.svg",
    "logo_light": "/brand/logo-light.svg",
    "favicon": "/brand/favicon.svg",
    "og_image": "/brand/og.png"
  }
}
```

این مسیرها از ریشه دامنه شروع می‌شوند؛ برای مثال:

```text
https://biznesyar.ir/brand/logo.svg
```

برای دامنه اختصاصی ریشه‌ای، این الگو مناسب است، مشروط بر اینکه فایل‌ها در مسیرهای مورد انتظار خروجی Build موجود باشند.

در صورت مشاهده تصاویر خراب، CSS بارگذاری‌نشده یا خطای 404، ابتدا آدرس واقعی فایل در مرورگر و محتوای پوشه خروجی Build بررسی شود.

## ۹. تست‌های انجام‌شده پس از اتصال

### ۹.۱. دامنه اصلی

آدرس:

https://biznesyar.ir

نتیجه: **موفق**

### ۹.۲. صفحات داخلی

یک صفحه داخلی، از جمله صفحه مربوط به جواز کسب، باز و بررسی شد.

نتیجه گزارش‌شده:

- صفحه بدون خطا باز شد.
- ظاهر، فونت‌ها و تصاویر درست بودند.
- آدرس صفحه با دامنه جدید نمایش داده شد.

### ۹.۳. دامنه www

آدرس:

https://www.biznesyar.ir

نتیجه: **موفق**

پس از باز کردن این آدرس، مرورگر دامنه اصلی زیر را نمایش داد:

```text
https://biznesyar.ir
```

بنابراین مسیر `www` نیز به دامنه اصلی هدایت می‌شود.

### ۹.۴. HTTPS

نتیجه: **موفق**

گزینه Enforce HTTPS در GitHub Pages تیک خورده و فعال است.

### ۹.۵. Sitemap

آدرس مورد بررسی:

https://biznesyar.ir/sitemap-index.xml

وضعیت: **نیازمند ثبت نتیجه نهایی**

پس از باز کردن این آدرس، بررسی کنید که XML یا فهرست Sitemap باز می‌شود و به‌جای آن صفحه 404 یا خطای دیگری نمایش داده نمی‌شود.

اگر این آدرس وجود نداشت، فایل‌ها و ساختار خروجی Build را بررسی کنید؛ ممکن است مسیر Sitemap تولیدشده با آدرس مورد انتظار متفاوت باشد.

## ۱۰. چک‌لیست نهایی

- [x] دامنه در IRNIC ثبت شده است.
- [x] Name Serverهای Cloudflare در IRNIC ثبت شده‌اند.
- [x] وضعیت دامنه در Cloudflare به Active تغییر کرده است.
- [x] چهار رکورد A برای دامنه اصلی ایجاد شده‌اند.
- [x] رکورد CNAME برای `www` ایجاد شده است.
- [x] DNS check در GitHub Pages موفق بوده است.
- [x] دامنه اختصاصی در تنظیمات Pages ثبت شده است.
- [x] گزینه Enforce HTTPS فعال است.
- [x] مقدار `brand.url` با دامنه جدید هماهنگ است.
- [x] دامنه اصلی باز می‌شود.
- [x] صفحات داخلی بررسی‌شده درست کار می‌کنند.
- [x] دامنه `www` باز می‌شود و به دامنه اصلی هدایت می‌شود.
- [ ] Sitemap باز شده و محتوای آن تأیید شده است.

## ۱۱. عیب‌یابی مشکلات احتمالی

### مشکل: GitHub می‌گوید DNS check ناموفق است

موارد زیر بررسی شوند:

۱. Name Serverهای ثبت‌شده در IRNIC با مقادیر Cloudflare تطابق داشته باشند.

۲. وضعیت دامنه در Cloudflare فعال باشد.

۳. چهار رکورد A صحیح و بدون اشتباه تایپی باشند.

۴. رکورد CNAME مربوط به `www` مستقیماً به `pourimoto.github.io` اشاره کند.

۵. در صورت تغییر تازه DNS، برای انتشار آن زمان داده شود.

### مشکل: دامنه اصلی باز نمی‌شود

- وضعیت رکوردهای A بررسی شود.
- دامنه در Settings → Pages مخزن صحیح ثبت شده باشد.
- انتشار آخرین Build در GitHub Actions موفق شده باشد.
- وضعیت DNS با ابزارهای بررسی DNS ارزیابی شود.

### مشکل: دامنه باز می‌شود اما CSS یا تصاویر خراب هستند

- وجود مسیر ثابت `/biznesyar-static/` در سورس بررسی شود.
- مسیر دارایی‌ها در خروجی `dist/` بررسی شود.
- مقدار `SITE_URL` در Workflow بررسی شود.
- پس از اصلاح تنظیمات، Build و Deploy مجدداً اجرا شود.

### مشکل: HTTPS فعال نمی‌شود

- DNS دامنه و `www` بررسی شود.
- رکوردهای اضافی یا متناقض بررسی شوند.
- وضعیت گواهی در GitHub Pages بررسی شود.
- برای صدور یا تمدید گواهی، در صورت تغییر DNS زمان کافی در نظر گرفته شود.

### مشکل: Sitemap باز نمی‌شود

- خروجی Build بررسی شود.
- مسیر Sitemap واقعی در پوشه `dist/` بررسی شود.
- مقدار نهایی `site` در Astro بررسی شود.
- فیلتر Sitemap و تنظیمات Workflow بررسی شوند.

## ۱۲. نکات نگهداری

۱. این مستند را پس از هر تغییر مهم DNS، دامنه یا روش انتشار به‌روزرسانی کنید.

۲. پیش از تغییر رکوردهای DNS، از تنظیمات فعلی تصویر یا یادداشت تهیه کنید.

۳. هنگام انتقال دامنه به میزبان دیگر، ابتدا معماری جدید و مقصد رکوردها را مشخص کنید و سپس DNS را تغییر دهید.

۴. متغیر `SITE_URL` را با آدرس اصلی سایت هماهنگ نگه دارید.

۵. پس از تغییر دامنه یا ساختار مسیرها، صفحات داخلی، دارایی‌ها، Sitemap و canonical URLها را بررسی کنید.

۶. این مستند برای نگهداری و بازسازی تنظیمات است؛ هیچ توکن، رمز عبور یا کلید خصوصی نباید در آن قرار بگیرد.

## ۱۳. منابع رسمی

- [GitHub Pages — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages — Securing your site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Cloudflare — Managing DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)

---

**خلاصه وضعیت:** دامنه اختصاصی `biznesyar.ir` به GitHub Pages متصل شده، HTTPS فعال است و هر دو آدرس اصلی و `www` بررسی شده‌اند. تنظیمات بررسی‌شده Astro و آدرس برند با دامنه اصلی هماهنگ هستند. فقط نتیجه بررسی نهایی Sitemap باید به این مستند اضافه شود.
