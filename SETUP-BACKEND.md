# بیزنس‌یار — راه‌اندازی نسخه با بک‌اند (فاز ۱)

> برای نسخه بدون بک‌اند (گوگل‌فرم) فایل `SETUP-STATIC.md` را ببین. این راهنما به پوشه `server/` از زیپ فاز ۱ نیاز دارد و `"mode": "backend"` را در کانفیگ می‌خواهد.

## ۱) اجرا روی کامپیوتر خودت
نیاز: Node.js ۲۲.۱۲ یا بالاتر، Git.
```
npm install
npm run dev      # http://localhost:4321
```
برای پنل‌ها PocketBase هم لازم است (بخش ۷، «تست محلی»).

## ۲) کدام فایل را کجا عوض کنم
| می‌خواهم… | فایل |
|---|---|
| رنگ، لوگو، تلفن‌ها، آدرس، ساعت، پیام‌رسان‌ها، خدمات، لید مگنت | `src/config/site.config.json` |
| متن صفحه اصلی، FAQ، درباره ما | `src/data/home.json` |
| محتوای صفحه خدمت | `src/data/services.json` |
| شهرها و منطقه‌ها | `src/data/regions.json` (+ `src/content/areas/<slug>.md` برای متن بلند) |
| مقاله | `src/content/articles/` |
| **مراحل، مدارک و راهنمای (!) هر خدمت** | `public/flows/<service>.json` — راهنما: `flow-guide.md` |
| عکس راهنمای مدارک | `public/help/` |
| PDF لید مگنت | `python3 scripts/make-pdf.py business-license` ← `public/downloads/` |

## ۳) شهر، تصویر و ویدیو
**شهر جدید:** آیتم به `regions.json` اضافه کن (slug, name, kind, intro, featured). صفحه و sitemap و فرم‌ها خودکار ساخته می‌شوند. متن بلند و تصویر: فایل `src/content/areas/<slug>.md`.
**تصویر شاخص مقاله (alt اجباری):** `src/assets/articles/<slug>/cover.webp` (۱۲۰۰×۶۳۰) و در front matter:
```
cover:
  src: ../../assets/articles/<slug>/cover.webp
  alt: توضیح واقعی تصویر
  caption: زیرنویس اختیاری
```
بهینه‌سازی، width/height، `og:image` و JSON-LD خودکار است.
**تصویر/ویدیو داخل متن:** مقاله را `.mdx` کن:
`<Figure src={img} alt="..." caption="..." />` و `<Video src="/videos/x.mp4" poster={p} title="..." description="..." duration="PT3M" uploadDate="2026-10-06" />`.
`<Callout variant="info|warning|tip">` هم در `.mdx` و فایل شهر هست.
مقاله «جواز کسب بندرعباس/میناب/رودان» آماده است ولی `draft: true` دارد؛ بعد از بازبینی پرش کن. اگر مقدار YAML دو نقطه دارد، داخل «"» بگذار.

## ۴) هاست
VPS لینوکس (KVM): Ubuntu 24.04، ۱ هسته، ۲ گیگ رم، ۲۵ گیگ SSD، IP ثابت. دیتابیس جدا لازم نیست.
فضا: فایل‌ها حداکثر ۵ مگابایت و عکس‌ها در مرورگر خودکار کم‌حجم می‌شوند. `FILE_RETENTION_DAYS` (اختیاری) مدارک پرونده‌های بسته‌شده را بعد از N روز پاک می‌کند.

## ۵) آماده‌سازی سرور
با `ssh root@IP`:
```
apt update && apt upgrade -y
adduser bizyaar && usermod -aG sudo bizyaar
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
mkdir -p /var/www/bizyaar /opt/pocketbase
chown -R bizyaar:bizyaar /var/www/bizyaar /opt/pocketbase
```
کلید دیپلوی روی کامپیوتر: `ssh-keygen -t ed25519 -f bizyaar_deploy -N ""` و `ssh-copy-id -i bizyaar_deploy.pub bizyaar@IP`.
**Caddy:**
```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```
اگر باز نشد بگو تا نسخه Nginx بدهم. DNS: رکورد A برای `@` و `www`. سپس `server/Caddyfile` (با دامنه خودت) را در `/etc/caddy/Caddyfile` بگذار و `sudo systemctl reload caddy`.

## ۶) دیپلوی سایت
**GitHub Actions:** Secrets: `SSH_KEY`, `SSH_HOST`, `SSH_USER` (=bizyaar), `SSH_PORT` (=22). هر push به main دیپلوی می‌کند.
اگر Actions به IP ایرانی وصل نشد: `DEPLOY_HOST=IP DEPLOY_USER=bizyaar npm run deploy` (لینوکس/WSL) یا ویندوز: `npm run build` و `scp -r dist/* bizyaar@IP:/var/www/bizyaar/`.
مراحل (`flows`) هم همراه همین دیپلوی می‌رود.

## ۷) PocketBase
تست‌شده با **۰.۴۰.۴**.
۱. `linux_amd64` را از github.com/pocketbase/pocketbase/releases بگیر و در `/opt/pocketbase` باز کن.
۲. `scp -r server/pb_hooks server/pb_migrations bizyaar@IP:/opt/pocketbase/`
۳. `cd /opt/pocketbase && ./pocketbase superuser upsert you@email.com 'گذرواژه-قوی'` (مهاجرت‌ها اجرا و همه کالکشن‌ها ساخته می‌شود).
۴. `/etc/bizyaar.env` را بساز (`sudo chmod 600`) — همه متغیرها در `.env.example` توضیح داده شده. حداقل:
```
OTP_SECRET=...
ADMIN_PHONES=09928710944,09172079245
FLOWS_DIR=/var/www/bizyaar/flows
SMS_PROVIDER=melipayamak
MELIPAYAMAK_USER=...
MELIPAYAMAK_PASS=...
MELIPAYAMAK_OTP_BODYID=...
BALE_TOKEN=...
BALE_CHAT_ID=...
```
۵. `sudo cp server/pocketbase.service /etc/systemd/system/ && sudo systemctl enable --now pocketbase`
۶. ادمین PocketBase فقط با تونل: `ssh -L 8090:127.0.0.1:8090 bizyaar@IP` سپس `http://127.0.0.1:8090/_/` (فقط برای موارد نادر؛ کارهای روزمره در `/ops/`).

**اگر قبلاً نسخه قبلی را اجرا کرده‌ای:** پوشه‌های `pb_hooks` و `pb_migrations` جدید را جایگزین کن و PocketBase را ری‌استارت کن. مهاجرت جدید خودش قوانین را اصلاح و کالکشن‌های تازه را اضافه می‌کند. **این به‌روزرسانی یک حفره جدی را می‌بندد: نسخه قبلی اجازه می‌داد کاربر بدون ورود فهرست پرونده‌ها را ببیند.** پرونده‌های قدیمی مرحله‌های جدید ندارند؛ برای تست یک پرونده تازه بساز.

### ملی‌پیامک
در پنل ملی‌پیامک دو **پترن** (قالب تأییدی) بساز و کدشان را در env بگذار:
- OTP: «کد ورود بیزنس‌یار: {0}» ← `MELIPAYAMAK_OTP_BODYID`
- اعلان: «بیزنس‌یار: {0}» ← `MELIPAYAMAK_NOTIFY_BODYID` (متن متغیر کوتاه و بدون لینک)
اتصال از مسیر `SendByBaseNumber3` و **روی سرور واقعی تست نشده است**؛ با شماره خودت امتحان کن و اگر خطا بود لاگ `journalctl -u pocketbase` را بفرست.
**هزینه پیامک:** `SMS_MODE=critical` (پیش‌فرض) فقط رویدادهای مهم پیامک می‌شود (درخواست پرداخت، تأیید پرداخت، درخواست/ردّ مدرک، بازگشت مرحله، تحویل)؛ بقیه فقط بله. `all` برای همه رویدادها (اگر بله وصل نباشد پیامک)، `off` بدون پیامک وضعیت. OTP همیشه پیامک است (یا بله اگر `OTP_VIA_BALE=1` و کاربر بله وصل کرده باشد).

### بله
۱. در بله با `@botfather` ربات بساز؛ توکن ← `BALE_TOKEN`، نام‌کاربری ربات ← `BALE_BOT_USERNAME`.
۲. به ربات پیام بده و `https://tapi.bale.ai/bot<توکن>/getUpdates` را باز کن؛ `chat.id` را بردار ← `BALE_CHAT_ID` (برای گروه مدیران: ربات را در گروه بگذار و همین کار).
۳. اتصال مشتری/اپراتور: `BALE_WEBHOOK_SECRET` را رشته تصادفی بگذار و یک بار این آدرس را باز کن:
`https://tapi.bale.ai/bot<توکن>/setWebhook?url=https://دامنه/api/bz/bale/webhook/<BALE_WEBHOOK_SECRET>`
بعد در پنل، دکمه «اتصال به بله» لینک ربات را باز می‌کند و با زدن Start وصل می‌شود.
**بله روی سرور واقعی تست نشده است** (مسیرهای داخلی با شبیه‌ساز تست شده).

### نقش‌ها و دسترسی
- مشتری: فقط پرونده خودش.
- اپراتور: فقط پرونده‌های واگذارشده؛ **شماره مشتری را نمی‌بیند**؛ مراحل، پیام، بازبینی مدارک، بازگشت مرحله؛ تأیید پرداخت ندارد.
- مدیر: همه چیز (پرداخت، لید، کاربران، تنظیمات).
شماره‌های `ADMIN_PHONES` با اولین ورود خودکار مدیر می‌شوند. اپراتور/مدیر جدید: `/ops/` ← «کاربران». شماره اشتباه مشتری: روی پرونده «اصلاح شماره / انتقال پرونده» (قطع ورود قبلی + ثبت در لاگ).
اطلاعات حساب برای پرداخت دستی: `/ops/` ← «تنظیمات».

### رفتار خودکار
- لیدی که با همان شماره وارد پنل شود: پرونده پیش‌نویس از لید ساخته و لید «تبدیل‌شده» می‌شود.
- لید بی‌اقدام ۳۰ روزه: خودکار «از دست رفته» و بایگانی. لیدِ پرونده تکمیل‌شده: بایگانی.
- کد حساس (OTP دولتی) ۱۵ دقیقه بعد پاک می‌شود.
- بک‌آپ: Settings ← Backups ← Cron `0 3 * * *`، نگه‌داری ۷؛ ماهی یک نسخه را دانلود کن. اگر Rate limiting را دیدی روشنش کن.

### تست محلی
```
./pocketbase superuser upsert admin@test.local 'Pass12345678'
OTP_DEV=1 ADMIN_PHONES=09120000001 FLOWS_DIR=/مسیر/پروژه/public/flows ./pocketbase serve
npm run dev
```
(`pb_hooks` و `pb_migrations` کنار فایل pocketbase باشند. کد ورود در خود صفحه نشان داده می‌شود.) تست خودکار: `python3 backend-test.py` (PocketBase روشن، با دقیقاً همین تنظیمات و ادمین `admin@test.local / AdminPass12345`).

## ۸) بعد از انتشار
- [ ] `/llms.txt`، `/robots.txt`، `/sitemap-index.xml`
- [ ] فرم لید، ورود با پیامک واقعی، اعلان بله
- [ ] اطلاعات حساب در «تنظیمات»
- [ ] Search Console + sitemap، Bing، Yandex Metrica (`analytics.metrica`)
- [ ] Google Business Profile، نشان، بلد (همین آدرس و تلفن‌ها)
- [ ] واتساپ/بله/روبیکا/اینستاگرام را در کانفیگ پر کن
- [ ] مقالات را بازبینی و `draft: false` کن؛ عکس راهنما و لوگو را جایگزین کن
