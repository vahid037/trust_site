/**
 * change.js
 *
 * اسکریپتی برای جایگزینی خودکار
 * <footer> … </footer>
 * همهٔ فایل‌های HTML در شاخهٔ جاری.
 *
 * - اگر نام فایل / باشد، فوتر همراه با اینماد درج می‌شود.
 * - برای بقیهٔ فایل‌های HTML، فوتر بدون اینماد درج می‌شود.
 *
 * نحوهٔ اجرا:
 *   در ترمینال یا CMD در پوشهٔ ریشهٔ پروژه:
 *     node change.js
 *
 * ⚠️ قبل از اجرا، حتماً از فایل‌های HTML یک بکاپ داشته باشید.
 */

const fs = require('fs');
const path = require('path');

// ====== 1) فوتر بدون اینماد ======
const footerWithoutEnamad = `
<footer id="contact">
    <div class="footer-content">
        <div>
            <strong>درباره ما:</strong>
            <p>فروشگاه تخصصی محصولات مراقبت پوست و مو، با بهترین کیفیت و ارسال سریع به سراسر ایران.</p>
        </div>
        <div>
            <strong>لینک‌های مهم:</strong>
            <ul>
                <li><a href="/">خانه</a></li>
            </ul>
        </div>
        <div>
            <strong>ارتباط با ما:</strong>
            <p>ایمیل: ayaitech2023@gmail.com</p>
            <p>تلفن: 09120337520</p>
        </div>
    </div>
    <div class="footer-bottom">
        کلیه حقوق متعلق به فروشگاه تراست‌شاپ است.
    </div>
</footer>
`.trim();

// ====== 2) فوتر با اینماد (فقط برای /) ======
const footerWithEnamad = `
<footer id="contact">
    <div class="footer-content">
        <div>
            <strong>درباره ما:</strong>
            <p>فروشگاه تخصصی محصولات مراقبت پوست و مو، با بهترین کیفیت و ارسال سریع به سراسر ایران.</p>
        </div>
        <div>
            <strong>لینک‌های مهم:</strong>
            <ul>
                <li><a href="/">خانه</a></li>
            </ul>
        </div>
        <div>
            <strong>ارتباط با ما:</strong>
            <p>ایمیل: ayaitech2023@gmail.com</p>
            <p>تلفن: 09120337520</p>
        </div>
        <!-- بلوک اینماد -->
        <div class="enamad-wrapper" style="text-align:center; margin-top:16px;">
            <a referrerpolicy="origin" target="_blank"
               href="https://trustseal.enamad.ir/?id=617435&Code=LGpfV3T9LBruU0KoBRlQ2CYbQKBJ6oiJ">
              <img referrerpolicy="origin"
                   src="https://trustseal.enamad.ir/logo.aspx?id=617435&Code=LGpfV3T9LBruU0KoBRlQ2CYbQKBJ6oiJ"
                   alt="نماد اعتماد الکترونیکی"
                   style="cursor:pointer; max-width:120px; height:auto;"
                   code="LGpfV3T9LBruU0KoBRlQ2CYbQKBJ6oiJ">
            </a>
        </div>
    </div>
    <div class="footer-bottom">
        کلیه حقوق متعلق به فروشگاه تراست‌شاپ است.
    </div>
</footer>
`.trim();

// ====== 3) تابعی که یک فایل HTML را می‌خواند و فوتر آن را جایگزین می‌کند ======
function replaceFooterInFile(filePath) {
    // 1. خواندن کل محتویات فایل
    let content = fs.readFileSync(filePath, 'utf8');

    // 2. تعیین این‌که آیا این فایل / است یا خیر
    const isHome = path.basename(filePath).toLowerCase() === '/';

    // 3. انتخاب فوتر مناسب
    const newFooter = isHome ? footerWithEnamad : footerWithoutEnamad;

    // 4. جایگزینی تمام بخش <footer> تا </footer> با فوتر جدید
    //    از یک الگوی سادهٔ regex استفاده می‌کنیم که از <footer …> تا اولین </footer> را می‌گیرد
    const replaced = content.replace(
        /<footer[\s\S]*?<\/footer>/i,
        newFooter
    );

    // 5. اگر چیزی تغییر کرده، فایل را بازنویسی می‌کنیم
    if (replaced !== content) {
        fs.writeFileSync(filePath, replaced, 'utf8');
        console.log(`✔ footer replaced in: ${filePath}`);
    } else {
        console.log(`⚠️  no <footer> tag found in: ${filePath}`);
    }
}

// ====== 4) اسکن شکل سادهٔ پوشه برای یافتن همهٔ .html ======
const folderPath = __dirname; // پوشهٔ ریشه (جایی که change.js قرار دارد)
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('مشکل در خواندن پوشهٔ جاری:', err);
        return;
    }
    // فقط فایل‌های .html را فیلتر می‌کنیم
    const htmlFiles = files.filter(f => f.toLowerCase().endsWith('.html'));

    if (htmlFiles.length === 0) {
        console.log('هیچ فایل HTML در شاخهٔ جاری پیدا نشد.');
        return;
    }

    // برای هر فایل HTML، تابع replaceFooterInFile را صدا می‌زنیم
    htmlFiles.forEach(file => {
        const fullPath = path.join(folderPath, file);
        replaceFooterInFile(fullPath);
    });
});
