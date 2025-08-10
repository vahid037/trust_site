/**
 * bulk-seo-fix.js  –  one‑shot SEO tweaks
 *   •  fetchpriority="high" + <link rel="preload">   →  اولـین hero img
 *   •  loading="lazy"                               →  سایر img‌ها
 * همهٔ *.html داخل ./public (و زیردایرکتوری‌ها) را دستکاری می‌کند.
 */

const path = require("path");
const fs = require("fs").promises;
const fss = require("fs");                  // برای existsSync
const cheerio = require("cheerio");

const PUBLIC_DIR = path.resolve(__dirname, "public");

console.log("\n=== bulk‑seo‑fix started ===");
console.log("PUBLIC_DIR =", PUBLIC_DIR);

if (!fss.existsSync(PUBLIC_DIR)) {
    console.error("❌  public directory not found. مسیر را چک کن!");
    process.exit(1);
}

/* ---------  کمکى: پیمایش بازگشتی فولدر  --------- */
async function collectHtmlFiles(dir) {
    const out = [];
    const items = await fs.readdir(dir, { withFileTypes: true });
    for (const it of items) {
        const full = path.join(dir, it.name);
        if (it.isDirectory()) {
            out.push(...await collectHtmlFiles(full));
        } else if (it.isFile() && it.name.endsWith(".html")) {
            out.push(full);
        }
    }
    return out;
}

(async () => {
    try {
        const files = await collectHtmlFiles(PUBLIC_DIR);

        if (files.length === 0) {
            console.warn("⚠️  No .html files found in public directory.");
            return;
        }

        console.log("🔄  Processing", files.length, "HTML files ...\n");

        for (const fullPath of files) {
            const relPath = path.relative(PUBLIC_DIR, fullPath);
            let html = await fs.readFile(fullPath, "utf8");
            const $ = cheerio.load(html, { decodeEntities: false });

            /* 1) hero img */
            const heroImg = $(".hero-header img").first();
            if (heroImg.length) {
                const src = heroImg.attr("src");
                heroImg.attr("fetchpriority", "high");

                if ($(`link[rel="preload"][href="${src}"]`).length === 0) {
                    $("head").prepend(
                        `<link rel="preload" as="image" fetchpriority="high" href="${src}">`
                    );
                }
            }

            /* 2) سایر img → lazy */
            $("img").each((_, el) => {
                const img = $(el);
                if (!img.attr("loading")) img.attr("loading", "lazy");
            });

            await fs.writeFile(fullPath, $.html(), "utf8");
            console.log("✅  Done:", relPath);
        }

        console.log("\n🎉  All HTML files updated.");
    } catch (err) {
        console.error("❌  Unhandled error:\n", err);
    } finally {
        console.log("=== bulk‑seo‑fix finished ===\n");
    }
})();
