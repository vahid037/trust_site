// remove-logo.js
const fs = require('fs');
const path = require('path');

// مسیر پوشه‌ای که همهٔ فایل‌های HTML توش هستن
// اگر ساختار فرق داره، اینو عوض کن
const ROOT_DIR = path.join(__dirname, 'public');

// رگ‌اِکس برای پیدا کردن بلوک لوگو
// <div class="hero-logo"> ... </div>
const logoRegex = /<div\s+class="hero-logo"[\s\S]*?<\/div>/gi;

/**
 * پیمایش بازگشتی پوشه‌ها و تمیز کردن فایل‌های .html
 */
function walk(dir) {
    fs.readdirSync(dir).forEach(item => {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) {
            walk(full);                       // پوشهٔ تو در تو
        } else if (full.endsWith('.html')) {
            let html = fs.readFileSync(full, 'utf8');
            const cleaned = html.replace(logoRegex, '');
            if (cleaned !== html) {
                fs.writeFileSync(full, cleaned, 'utf8');
                console.log('✔ cleaned', full);
            }
        }
    });
}

walk(ROOT_DIR);
console.log('تمام لوگوها حذف شدن ✅');
