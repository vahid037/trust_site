// bulk-seo-fix.js
// اسکریپت یک‌بارِ به‌روزرسانی تمام فایل‌های public/*.html
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const glob = require("glob");

const PUBLIC_DIR = path.join(__dirname, "public");

glob(`${PUBLIC_DIR}/**/*.html`, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
        let html = fs.readFileSync(file, "utf8");
        const $ = cheerio.load(html, { decodeEntities: false });

        // فقط صفحاتی که hero دارند را دستکاری کن
        const heroImg = $(".hero-header img").first();
        if (!heroImg.length) return;

        /* ---------- ۱) fetchpriority روی <img> ---------- */
        heroImg.attr("fetchpriority", "high");

        /* ---------- ۲) <link rel=preload …> داخل <head> ---------- */
        const src = heroImg.attr("src") || "";
        const absSrc = src.startsWith("http") ? src : "/" + src.replace(/^\/+/, "");
        const preloadSelector = `link[rel="preload"][href="${absSrc}"]`;

        if (!$(`head ${preloadSelector}`).length) {
            // اگر هنوز Preload نداشتیم، اضافه کن
            $("<link>", {
                rel: "preload",
                as: "image",
                href: absSrc,
                fetchpriority: "high",
                type: "image/webp",
            }).prependTo("head");
        }

        /* ---------- ۳) font-display:swap روی فایل‌های Google Font ---------- */
        $('link[href*="fonts.googleapis.com"]').each((_, el) => {
            const href = $(el).attr("href");
            // پارامتر display را به swap تغییر بده
            if (href && !href.includes("display=swap")) {
                const newHref = href + (href.includes("?") ? "&" : "?") + "display=swap";
                $(el).attr("href", newHref);
            }
        });

        fs.writeFileSync(file, $.html(), "utf8");
        console.log("✅ updated", path.relative(PUBLIC_DIR, file));
    });
});
