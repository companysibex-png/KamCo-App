# سئوی KamCo-App — چه کاری انجام شد و قدم‌های بعدی

این سند چک‌لیست سئوی اپ فروشگاه کم‌کو است (آخرین به‌روزرسانی: ۲۰۲۶-۱۰-۳۱).

## ✅ پیاده‌سازی‌شده

### ۱. متاتگ‌های ایستای `index.html`
- عنوان فارسی + توضیحات متا (توصیف فروشگاه با کلیدواژه‌های مرتبط)
- `canonical` به آدرس اصلی سایت
- `robots: index, follow, max-image-preview:large` (نمایش تصویر بزرگ در نتایج)
- **Open Graph کامل** (`og:title/description/image/url/locale`) — پیش‌نمایش زیبا در تلگرام، واتساپ، فیسبوک و لینکدین
- **Twitter Card** (`summary_large_image`)
- `lang="fa" dir="rtl"` به‌صورت پیش‌فرض (اپ در زمان اجرا بین fa/en سوییچ می‌کند)
- تصویر اشتراک‌گذاری اختصاصی `og-image.png` با ابعاد استاندارد ۱۲۰۰×۶۳۰

### ۲. داده‌های ساخت‌یافته (JSON-LD)
- ایستا در `index.html`: گره‌های `OnlineStore` + `WebSite` (نام، لوگو، توضیحات، زبان‌ها)
- داینامیک در صفحه هر محصول (`src/seo.ts`): گره `Product` شامل نام، توضیحات، برند، **قیمت و ارز**، موجودی (`InStock`/`OutOfStock`) — زمینه را برای نمایش **ریچ اسنیپت قیمت** در نتایج گوگل فراهم می‌کند.

### ۳. سئوی داینامیک هر صفحه (`src/seo.ts`)
- `ProductsPage`: عنوان و توضیحات فروشگاه (بومی fa/en)
- `ProductDetailPage`: عنوان = «نام محصول | کم‌کو» + JSON-LD محصول
- `CartPage`, `LoginPage`, `OrdersPage`: `noindex, nofollow` (صفحات کاربردی نباید در نتایج جستجو بیایند)
- سوییچ زبان → عنوان/توضیحات و `lang`/`dir` فوراً به‌روز می‌شوند

### ۴. `robots.txt` و `sitemap.xml`
- در `public/` و به‌صورت خودکار در بیلد کپی می‌شوند
- sitemap آدرس اصلی + `hreflang` برای fa و en

### ۵. کارایی (Core Web Vitals) — از قبل بود
- فونت Vazirmatn باندل‌شده با `font-display: swap`
- Service Worker با precache کامل (نمایش آنی و آفلاین)
- تصاویر محصولات SVG درون‌برنامه‌ای (بدون هاست خارجی و بدون CLS)

## ⚠️ محدودیت‌های این معماری (و دلیل انتخابش)

- **مسیرها با `#` هستند (HashRouter):** گوگل محتوای JS را رندر می‌کند و اپ را می‌بیند، ولی هر مسیر URL جداگانه ندارد؛ فقط یک URL (`/`) نمایه می‌شود. این انتخاب عمدی است تا همان بیلد بدون تغییر روی GitHub Pages، Capacitor (اندروید/iOS) و TWA کار کند.
- **اسکرپرهای شبکه‌های اجتماعی JS اجرا نمی‌کنند:** به همین دلیل متاتگ‌ها ایستا هستند (در index.html)، نه از داخل اپ.

## 🚀 قدم‌های بعدی (خودتان انجام دهید)

1. **Google Search Console** (مهم‌ترین قدم):
   - به [search.google.com/search-console](https://search.google.com/search-console) بروید → Add Property → URL prefix → `https://companysibex-png.github.io/KamCo-App/`
   - مالکیت را با فایل HTML یا DNS تأیید کنید
   - `sitemap.xml` را در بخش Sitemaps ثبت کنید
   - از Inspection درخواست ایندکس URL اصلی را بدهید
2. **Bing Webmaster Tools**: از همان مسیر، حتی می‌تواند سئو را از Search Console ایمپورت کند.
3. **دامنه اختصاصی** (اختیاری ولی مؤثر): خرید دامنه (مثلاً `kamco.shop`) و تنظیم در Settings → Pages → Custom domain + رکورد CNAME. دامنه اختصاصی اعتماد و نرخ کلیک را بالاتر می‌برد.
4. **محتوای واقعی**: وقتی API واقعی وصل شد، نام و توضیحات فارسی محصولات واقعی بهترین سوخت سئو است؛ JSON-LD محصول خودکار از همان داده‌ها پر می‌شود.
5. **بازبینی بعد از ایندکس**: حدود یک هفته بعد در Search Console بخش Performance را چک کنید.

## 🧪 ابزارهای تست

- Rich Results Test گوگل: `search.google.com/test/rich-results`
- Open Graph debugger: `developers.facebook.com/tools/debug/`
- Lighthouse (در کروم DevTools → تب Lighthouse → SEO)
