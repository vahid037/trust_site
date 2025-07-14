import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

// مسیر اصلی فایل‌های سایتت
const ROOT = "C:\\Users\\Administrator\\Desktop\\trust_site\\public";

// آدرس خروجی دیتا
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "products.json");

// تبدیل ارقام فارسی به انگلیسی
const faNums = "۰۱۲۳۴۵۶۷۸۹";
function faToEn(str = "") {
    return str.replace(/[۰-۹]/g, d => faNums.indexOf(d));
}

// جست‌وجوی بازگشتی تمام htmlها
async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = [];
    for (const e of entries) {
        const res = path.resolve(dir, e.name);
        if (e.isDirectory()) files.push(...(await walk(res)));
        else if (e.isFile() && res.endsWith(".html")) files.push(res);
    }
    return files;
}

// استخراج محصولات یک فایل html
async function parseFile(filePath) {
    const html = await fs.readFile(filePath, "utf8");
    const $ = cheerio.load(html);
    const items = [];

    $(".square-card").each((_, el) => {
        const $card = $(el);

        const imgSrc = $card.find("img").attr("src") || "";
        const name = $card.find("h2").text().trim();
        const priceRaw = $card.find(".price").text().replace(/[^\d۰-۹,]/g, "").replace(/,/g, "");
        const price = Number(faToEn(priceRaw));
        let id = path.basename(imgSrc).replace(/\.[a-z]+$/i, "");
        if (!id) id = name.replace(/\s+/g, "-");

        items.push({
            id,
            name,
            price,
            image: imgSrc.replace(/^images[\\/]/, "images/"), // مسیر نسبی
            sourceFile: path.relative(ROOT, filePath),
        });
    });

    return items;
}

// اجرای اسکریپت
(async () => {
    const htmlFiles = await walk(ROOT);
    const catalog = [];

    for (const file of htmlFiles) {
        const products = await parseFile(file);
        catalog.push(...products);
    }

    await fs.writeFile(OUTPUT, JSON.stringify(catalog, null, 2), "utf8");
    console.log(`✅ ${catalog.length} محصول پیدا شد → ${OUTPUT}`);
})();
