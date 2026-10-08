# بیزنس‌یار — نسخه بدون بک‌اند (گوگل‌فرم + GitHub Pages)

این نسخه همان سایت است، ولی لیدها به **گوگل‌فرم** (و شیت آن) می‌رود و سایت فقط فایل استاتیک است؛ هزینه سرور ندارد.
یک کلید در `src/config/site.config.json` تعیین می‌کند کدام نسخه باشد: `"mode": "static"` (این نسخه) یا `"backend"` (فاز ۱ با پنل و PocketBase).

**در این نسخه نیست:** ورود با پیامک، پنل مشتری و اپراتور، آپلود مدارک، پیگیری پرونده، اعلان خودکار بله/پیامک (جز مسیر اختیاری Apps Script پایین). صفحات `/login/`، `/panel/` و `/ops/` به صفحه تماس هدایت می‌شوند و دکمه‌های ورود نمایش داده نمی‌شوند.
**هست:** همه صفحات و مقالات و سئو، فرم لید، لید مگنت (PDF)، دکمه تماس شناور، `llms.txt`، sitemap.

## ۱) (Google Form)ساخت گوگل‌فرم
۱. در forms.google.com یک فرم بساز. **۸ سؤال «پاسخ کوتاه» به همین ترتیب** (هیچ‌کدام «الزامی» نباشد، وگرنه لید خالی رد می‌شود):
نام، موبایل، خدمت، منطقه، پیام، صفحه، منبع، utm
۲. تنظیمات فرم (Settings): ورود با حساب گوگل **لازم نباشد**، «Limit to 1 response» خاموش، جمع‌آوری ایمیل خاموش، آپلود فایل نداشته باشد.
۳. تب Responses ← «Link to Sheets» تا پاسخ‌ها در شیت ذخیره شود.

## ۲) پیدا کردن آدرس و شناسه فیلدها
**آدرس ارسال:** فرم را باز کن (حالت Preview/ارسال) و آدرس را ببین: `https://docs.google.com/forms/d/e/<شناسه>/viewform` ← کلمه آخر را `formResponse` کن:
`https://docs.google.com/forms/d/e/<شناسه>/formResponse` (شناسه‌ی `/d/e/…` نه شناسه ویرایش `/d/…/edit`).
**شناسه هر سؤال (entry.123…):** صفحه فرم (نه ویرایش) را در مرورگر باز کن، کنسول (F12 ← Console) و این را بزن:
```
[...document.querySelectorAll('input[name^="entry."],textarea[name^="entry."]')].map(e=>e.name+'  ←  '+(e.getAttribute('aria-label')||''))
```
اگر خروجی خالی بود: منوی ⋮ فرم ← «Get pre-filled link»، همه سؤال‌ها را با یک مقدار پر کن ← «Get link»؛ در آدرس، `entry.…=` هر سؤال دیده می‌شود.

## ۳) اتصال به سایت
در `src/config/site.config.json` بخش `leads`:
```json
"leads": {
  "enabled": true,
  "provider": "google-form",
  "googleForm": {
    "action": "https://docs.google.com/forms/d/e/شناسه/formResponse",
    "fields": { "name": "entry.…", "phone": "entry.…", "service": "entry.…", "region": "entry.…",
                "message": "entry.…", "page": "entry.…", "source": "entry.…", "utm": "entry.…" }
  },
  "placements": { "hero": true, "service": true, "area": true, "article": true, "contact": true, "magnet": true }
}
```
**حتماً تست کن:** `npm run dev`، یک لید با شماره خودت بفرست و در شیت ببین آمد. مرورگر برای گوگل‌فرم پاسخ خواندنی نمی‌دهد، پس اگر شناسه‌ها غلط باشند سایت «موفق» می‌گوید ولی در شیت چیزی نمی‌آید.
اگر اینترنت یا فیلتر مانع شود، فرم پیام خطا و راه‌های تماس را نشان می‌دهد و لید در مرورگر ذخیره و دفعه بعد که کاربر سایت را باز کرد دوباره ارسال می‌شود.

## ۴) فعال/غیرفعال‌کردن فرم لید
- **همه جا:** `"enabled": false` (به‌جای فرم، دکمه‌های تماس نمایش داده می‌شود).
- **یک جایگاه:** `placements` (`hero, service, area, article, contact, magnet`) را `false` کن.
- **یک مقاله:** در بالای مقاله `leadForm: false` (فرم پایین مقاله) و/یا `magnet: false` (PDF).
لید مگنت (PDF فهرست مدارک) برای ساخت دوباره: `python3 scripts/make-pdf.py business-license`.

## ۵) اعلان لید جدید
**ساده‌ترین:** در گوگل‌فرم ← Responses ← ⋮ ← «Get email notifications for new responses».
**بله (اختیاری):** در شیت پاسخ‌ها ← Extensions ← Apps Script:
```js
function onFormSubmit(e) {
  var v = e.namedValues;
  var p = PropertiesService.getScriptProperties();
  var text = "لید جدید بیزنس‌یار\nنام: " + v["نام"] + "\nموبایل: " + v["موبایل"] + "\nخدمت: " + v["خدمت"] +
             "\nمنطقه: " + v["منطقه"] + "\nپیام: " + v["پیام"] + "\nمنبع: " + v["منبع"];
  UrlFetchApp.fetch("https://tapi.bale.ai/bot" + p.getProperty("BALE_TOKEN") + "/sendMessage", {
    method: "post", contentType: "application/json", muteHttpExceptions: true,
    payload: JSON.stringify({ chat_id: p.getProperty("BALE_CHAT_ID"), text: text })
  });
}
```
سپس Project Settings ← Script properties: `BALE_TOKEN` و `BALE_CHAT_ID`؛ بعد Triggers ← Add Trigger ← تابع `onFormSubmit`، منبع «From spreadsheet»، رویداد «On form submit». (عنوان کلیدها باید دقیقاً همان عنوان سؤال‌های فرم باشد. این بخش تست نشده است.)
**پیگیری:** در شیت یک ستون «وضعیت» اضافه کن (جدید/تماس گرفته شد/پرونده/از دست رفته) و با فیلتر کار کن.

## ۶) استقرار روی GitHub Pages
۱. ریپوی گیت‌هاب بساز و کد را push کن. **پلن رایگان Pages ریپوی Public می‌خواهد**؛ چون سایت استاتیک است سری در کد نیست، ولی شناسه‌های گوگل‌فرم عمومی می‌شود (در هر حالت داخل سایت دیده می‌شود). پوشه `server/` را (در صورت داشتن) در این ریپو نگذار.
۲. Settings ← Pages ← Source: **GitHub Actions**.
۳. با هر push به `main`، فایل `.github/workflows/deploy-pages.yml` سایت را می‌سازد و منتشر می‌کند (تب Actions).
۴. **دامنه اختصاصی:** Settings ← Secrets and variables ← Actions ← تب Variables: `CUSTOM_DOMAIN = bizyaar.ir` و `SITE_URL = https://bizyaar.ir` (برای canonical و sitemap؛ بدون آن سئو درست نیست).
DNS: برای `bizyaar.ir` چهار رکورد A به `185.199.108.153`، `185.199.109.153`، `185.199.110.153`، `185.199.111.153`؛ برای `www` رکورد CNAME به `<نام‌کاربری>.github.io`. بعد از چند دقیقه در Pages گزینه «Enforce HTTPS» را بزن.
**بدون دامنه:** فقط ریپویی به نام `<نام‌کاربری>.github.io` کار می‌کند (آدرس ریشه). آدرس `نام.github.io/نام-ریپو` کار نمی‌کند، چون لینک‌های سایت از ریشه شروع می‌شوند.
**اگر GitHub Pages از ایران کند یا قطع بود:** همین فایل‌ها را روی هر هاست ایرانی بگذار: `npm run build` و محتوای پوشه `dist/` را (FTP/cPanel) آپلود کن، یا Workflow دوم `deploy-ssh.yml` (دستی) برای VPS. من از داخل ایران تست نکرده‌ام؛ سرعت و دسترسی را از شبکه‌های مختلف (ایرانسل، همراه اول، اینترنت ثابت) خودت ببین. گوگل‌فرم هم باید از شبکه کاربر باز شود.

## ۷) قبل از انتشار
- [ ] شناسه‌های گوگل‌فرم پر و **تست واقعی** شد
- [ ] تلفن‌ها، آدرس، ساعت، آیدی پیام‌رسان‌ها در کانفیگ؛ متن «درباره ما»؛ لوگو و `og.png`
- [ ] مقاله اصلی را بازبینی و `draft: false` کن (و دو مقاله نمونه را بازنویسی یا نگه‌دار)
- [ ] `SITE_URL` و دامنه، Search Console + sitemap (`/sitemap-index.xml`)، Google Business Profile
- [ ] صفحه حریم خصوصی/قوانین (هنوز ساخته نشده)
- [ ] شیت پاسخ‌ها را خصوصی نگه‌دار؛ از مشتری در این نسخه مدرک نخواه (فقط شماره و توضیح کوتاه)

## ۸) رفتن به نسخه کامل (فاز ۱ / ۲)
۱. `"mode": "backend"` ← ۲. پوشه `server/` را از زیپ فاز ۱ کنار PocketBase بگذار ← ۳. مراحل `SETUP-BACKEND.md` ← ۴. دیپلوی روی VPS (فایل `deploy-ssh.yml`).
لیدهای شیت را به CSV صادر کن؛ اگر خواستی اسکریپت واردکردن آن‌ها به PocketBase را بنویسم.
