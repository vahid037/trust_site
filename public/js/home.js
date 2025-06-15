// home.js

// به محض بارگذاری اولیهٔ DOM اجرا می‌شود:
window.addEventListener('DOMContentLoaded', () => {
    /* ---------- ۱) بنر بالای همه صفحات ---------- */
    const banner = document.createElement('div');
    banner.id = 'global-banner';
    banner.className = 'global-banner';
    banner.innerHTML =
        'حضور شما در فروشگاه ما باعث افتخار است. مسئولیت خرید شما از اینجانب <b>وحید رحمانی</b> با کد نمایندگی <b>138911</b> است. وب‌سایت رسمی شرکت: <a href="https://liateam.ir" target="_blank">Liateam.ir</a>';

    const header = document.querySelector('header');
    if (header) {
        header.parentNode.insertBefore(banner, header);
    } else {
        document.body.insertBefore(banner, document.body.firstChild);
    }

    /* ---------- ۲) ساخت پاپ‌آپ هوش مصنوعی ---------- */
    const popup = document.createElement('div');
    popup.id = 'ai-popup';
    popup.innerHTML = `
    <button id="ai-close" aria-label="بستن">✕</button>
    <div class="ai-media">
      <video src="video/ai-wave.mp4" autoplay loop muted playsinline></video>
    </div>
    <div class="ai-body">
      <input type="text" id="ai-question-pop" placeholder="سؤال خود را بنویسید…" />
      <button id="ai-ask-pop">بپرس</button>
      <div id="ai-response-pop" class="ai-response"></div>
    </div>`;
    document.body.appendChild(popup);

    /* ---------- بستن پاپ‌آپ ---------- */
    document.getElementById('ai-close')
        .addEventListener('click', () => popup.remove());

    /* ---------- ۳) تابع مشترک اتصال هندلر هوش مصنوعی ---------- */
    function attachAI(btnId, inputId, respId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const resp = document.getElementById(respId);
        if (!btn || !input || !resp) return;

        btn.onclick = () => {
            const q = input.value.trim();
            if (!q) {
                resp.textContent = 'سؤال خود را وارد کنید!';
                return;
            }
            resp.textContent = 'در حال بررسی…';
            setTimeout(() => {
                resp.textContent = 'این فقط یک پاسخ آزمایشی است. سیستم مشاوره به‌زودی فعال می‌شود!';
            }, 1500);
        };
    }

    /* باکس مشاوره داخل هدر (ثابت) */
    attachAI('ai-ask', 'ai-question', 'ai-response');

    /* باکس پاپ‌آپ گوشه پایین */
    attachAI('ai-ask-pop', 'ai-question-pop', 'ai-response-pop');

    /* ---------- ۴) توگل منو موبایل ---------- */
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.querySelector('.main-nav')?.classList.toggle('open');
        });
    }

    /* ---------- ۵) سایر initialization های فروشگاه ---------- */
    loadBestsellers();
    loadCategories();
    updateCartCount();
    setupAddToCartButtons();
    setupCartButton();
});


// ================== دیتای محصولات و دسته‌ها ==================
// ستون‌ها هر کدام شامل دو محصول هستند
const columns = [
    // ستون ۱
    [
        { id: 'deep-fusion', img: 'دیپ-فیوژن-واتر-SPF50-تراست.webp', alt: 'دیپ فیوژن واتر', name: 'دیپ فیوژن واتر تراست اسمارت SPF50', volume: '۴۰ میل', price: 797000 },
        { id: 'sun-dry-light', img: 'کرم-ضد-آفتاب-رنگی-پوست-خشک-روشن-تراست.webp', alt: 'آفتاب رنگی روشن', name: 'کرم ضد آفتاب رنگی بژ روشن (خشک/نرمال)', volume: '۴۰ میل', price: 397000 }
    ],
    // ستون ۲
    [
        { id: 'serum-smart3', img: 'سرم-سه-گانه-هوشمند-تراست.webp', alt: 'سرم سه‌گانه', name: 'سرم سه‌گانه هوشمند تراست', volume: '۶۰ میل', price: 2970000 },
        { id: 'serum-hya', img: 'سرم-آبرسان-هیالورونیک-اسید-تراست.webp', alt: 'سرم هیالورونیک', name: 'سرم آبرسان هیالورونیک اسید تراست', volume: '۲۰ میل', price: 537000 }
    ],
    // ستون ۳
    [
        { id: 'cream-oily', img: 'کرم-آبرسان-پوست-چرب-تراست.webp', alt: 'آبرسان چرب', name: 'کرم آبرسان پوست چرب تراست', volume: '۵۰ میل', price: 297000 },
        { id: 'cream-dry', img: 'کرم-آبرسان-پوست-نرمال-تراست.webp', alt: 'آبرسان خشک', name: 'کرم آبرسان پوست خشک و نرمال تراست', volume: '۵۰ میل', price: 297000 }
    ],
    // ستون ۴
    [
        { id: 'hand-body', img: 'کرم-دست-بدن-شیر-عسل-تراست.webp', alt: 'کرم شیر و عسل', name: 'کرم دست و بدن پروتئین شیر و عسل تراست', volume: '۱۵۰ میل', price: 297000 },
        { id: 'emu-oil', img: 'روغن-شترمرغ-تراست.webp', alt: 'روغن شترمرغ', name: 'روغن شترمرغ', volume: '۱۲۰ میل', price: 477000 }
    ],
    // ستون ۵
    [
        { id: 'sham-anti', img: 'شامپو-ضدشوره-ملایم-تراست.webp', alt: 'شامپو ضدشوره', name: 'شامپو ضد شوره ملایم (خشک/نرمال)', volume: '۲۰۰ میل', price: 297000 },
        { id: 'sham-color', img: 'شامپو-ثبیت-رنگ-تراست.webp', alt: 'شامپو تثبیت رنگ', name: 'شامپو تثبیت رنگ و ترمیم مو', volume: '۲۰۰ میل', price: 297000 }
    ]
];

// آرایهٔ کاملِ ۱۰ محصول (برای حالت دسکتاپ) از روی ستون‌ها ساخته می‌شود
const bestsellers = columns.flat();

// آرایهٔ اسلایدها: هر اسلاید ترکیب دو ستون متوالی‌ست
const slides = [];
for (let i = 0; i < columns.length; i++) {
    const nextIndex = (i + 1) % columns.length;
    slides.push([
        ...columns[i],        // دو محصول از ستون i
        ...columns[nextIndex] // دو محصول از ستون i+1
    ]);
}
// حالا slides پنج آرایهٔ ۴تایی دارد که به ترتیب ستون‌ها را جابجا می‌کند



// ================== تابع کمکی برای رندر لیستی از محصولات ==================
function renderProductsArray(productsArray) {
    const root = document.getElementById('bestseller-products');
    if (!root) return;
    let html = '';
    productsArray.forEach(p => {
        html += `
        <article class="square-card" data-id="${p.id}">
            <figure><img src="images/${p.img}" alt="${p.alt}" loading="lazy"></figure>
            <h2>${p.name}</h2>
            <span class="volume">${p.volume}</span>
            <span class="price">${p.price.toLocaleString('fa-IR')} تومان</span>
            <button class="add-to-cart">+</button>
        </article>`;
    });
    root.innerHTML = html;
    // پس از درجِ HTML کارت‌ها، دکمه‌های + را فعال می‌کنیم:
    //setupAddToCartButtons();
}



// ================== تابعی برای اجرای ۵ مرحلهٔ چرخشی در موبایل ==================
function cycleBestsellerSteps() {
    // مرحلهٔ ۱: ستون ۰ و ستون ۱ (index 0,1)
    setTimeout(() => {
        const stepProducts = [...columns[0], ...columns[1]];
        renderProductsArray(stepProducts);
    }, 0);

    // مرحلهٔ ۲: ستون ۱ و ستون ۲
    setTimeout(() => {
        const stepProducts = [...columns[1], ...columns[2]];
        renderProductsArray(stepProducts);
    }, 2000);

    // مرحلهٔ ۳: ستون ۲ و ستون ۳
    setTimeout(() => {
        const stepProducts = [...columns[2], ...columns[3]];
        renderProductsArray(stepProducts);
    }, 4000);

    // مرحلهٔ ۴: ستون ۳ و ستون ۴
    setTimeout(() => {
        const stepProducts = [...columns[3], ...columns[4]];
        renderProductsArray(stepProducts);
    }, 6000);

    // مرحلهٔ ۵: ستون ۴ و ستون ۰ (دور حلقه)
    setTimeout(() => {
        const stepProducts = [...columns[4], ...columns[0]];
        renderProductsArray(stepProducts);
    }, 8000);

    // پس از طی ۵ مرحله تا ۱۰۰۰۰ms، دوباره کل سیکل را تکرار کن
    setTimeout(() => {
        cycleBestsellerSteps();
    }, 10000);
}



// ================== تابع اصلی loadBestsellers ==================
function loadBestsellers() {
    const root = document.getElementById('bestseller-products');
    if (!root) return;

    const isMobile = window.innerWidth < 700;

    if (!isMobile) {
        // ===== حالت دسکتاپ: نمایش تمام ۱۰ محصول در یک گرید ۲×۵ =====
        renderProductsArray(bestsellers);
        // (CSS خودش ۵ ستون×۲ ردیف را روی #bestseller-products اعمال می‌کند)
    } else {
        // ===== حالت موبایل: شروع سیکل ۲×۲ براساس ستون‌ها =====
        cycleBestsellerSteps();
    }
}



// ================== بارگذاری دسته‌بندی‌ها ==================
function loadCategories() {
    const skinCategories = [
        { id: "balm-lab", name: "بالم لب تراست", img: "بالم-لب-تراست.webp", alt: "بالم لب تراست", url: "balm.html" },
        { id: "cream-face", name: "کرم صورت تراست", img: "کرم-صورت-تراست.webp", alt: "کرم صورت تراست", url: "creams.html" },
        { id: "pains", name: "پن شوینده صورت تراست", img: "پن-شوینده-تراست.webp", alt: "پن شوینده تراست", url: "pains.html" },
        { id: "soaps", name: "صابون زیبایی تراست", img: "صابون-زیبایی-تراست.webp", alt: "صابون تراست", url: "soaps.html" },
        { id: "cleansers", name: "پاک کننده و شوینده صورت", img: "شوینده-صورت-تراست.webp", alt: "شوینده صورت تراست", url: "cleansers.html" },
        { id: "kit-skincare", name: "کیت آنتی آکنه تراست", img: "کیت-مراقبت-پوست-تراست.webp", alt: "کیت آنتی آکنه تراست", url: "anti-ackne.html" },
        { id: "serum-face-oil", name: "سرم و روغن صورت تراست", img: "سرم-و-روغن-صورت-تراست.webp", alt: "سرم و روغن تراست", url: "serums.html" },
        { id: "cream-eye", name: "کرم دور چشم تراست", img: "ناحیه-چشم-تراست.webp", alt: "کرم چشم تراست", url: "eye-area.html" },
        { id: "mask-face", name: "ماسک صورت تراست", img: "ماسک-صورت-تراست.webp", alt: "ماسک صورت تراست", url: "face-mask.html" },
        { id: "sunscreen", name: "کرم ضد آفتاب تراست", img: "ضد-آفتاب-تراست.webp", alt: "ضد آفتاب تراست", url: "sunscreen.html" }
    ];

    const hairCategories = [
        { id: "hair-oil", name: "روغن مو تراست", img: "روغن-مو-تراست.webp", alt: "روغن مو تراست", url: "hair-oil.html" },
        { id: "hair-serum", name: "سرم مو تراست", img: "سرم-مو-تراست.webp", alt: "سرم مو تراست", url: "hair-serum.html" },
        { id: "hair-tonic", name: "تونیک مو تراست", img: "تونیک-مو-تراست.webp", alt: "تونیک مو تراست", url: "hair-tonics.html" },
        { id: "hair-mask", name: "ماسک مو تراست", img: "ماسک-مو-تراست.webp", alt: "ماسک مو تراست", url: "hair-mask.html" },
        { id: "hair-shampoo", name: "شامپو مو تراست", img: "شامپو-مو-تراست.webp", alt: "شامپو مو تراست", url: "hair-shampoo.html" },
        { id: "hair-kit", name: "کیت رویش مجدد مو تراست", img: "کیت-رویش-مو-تراست.webp", alt: "کیت رویش مو", url: "hair-kit.html" }
    ];

    const bodyCategories = [
        { id: "handwash", name: "مایع دستشویی تراست", img: "مایع-دستشویی-تراست.webp", alt: "مایع دستشویی تراست", url: "handwashes.html" },
        { id: "body-deodorant", name: "خوشبوکننده و ضدتعریق بدن تراست", img: "خوشبوکننده-بدن-تراست.webp", alt: "خوشبوکننده بدن تراست", url: "mamroll.html" },
        { id: "body-oil-lotion", name: "روغن و لوسیون بدن تراست", img: "روغن-و-لوسیون-بدن-تراست.webp", alt: "روغن لوسیون بدن تراست", url: "body-oil.html" },
        { id: "body-cream", name: "کرم بدن تراست", img: "کرم-بدن-تراست.webp", alt: "کرم بدن تراست", url: "body-cream.html" },
        { id: "body-shampoo", name: "شامپو بدن تراست", img: "شامپو-بدن-تراست.webp", alt: "شامپو بدن تراست", url: "body-shampoo.html" }
    ];

    const cats = [
        { id: 'skin-categories', data: skinCategories },
        { id: 'hair-categories', data: hairCategories },
        { id: 'body-categories', data: bodyCategories }
    ];
    cats.forEach(({ id, data }) => {
        const container = document.getElementById(id);
        if (!container) return;
        container.innerHTML = '';
        data.forEach(cat => {
            const href = cat.url ? cat.url : `/category/${cat.id}`;
            container.innerHTML += `
            <a href="${href}" class="category-card" title="${cat.name}">
              <img src="images/${cat.img}" alt="${cat.alt}" loading="lazy">
              <span>${cat.name}</span>
            </a>`;
        });
    });
}

function updateCartCount() {
    if (typeof updateCartBadge === 'function') updateCartBadge();
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = btn.closest('.square-card');
            if (!card) return;
            const name = card.querySelector('h2').textContent.trim();
            let img = card.querySelector('img') ? card.querySelector('img').getAttribute('src') : '';
            img = img.replace(/^images\//, '');
            const priceTag = card.querySelector('.price');
            let priceText = priceTag ? priceTag.textContent.replace(/[^0-9۰-۹]/g, '') : '0';
            let price = Number(priceText.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
            const id = img ? img.replace(/\.[a-z]+$/i, '') : name.replace(/\s+/g, '-').replace(/[^\w\-آ-ی]/g, '').toLowerCase();
            addToCart({ id, name, price, img });
            btn.textContent = "✓";
            setTimeout(() => btn.textContent = "+", 1200);
        });
    });
}

function setupAIBox() {
    const aiBtn = document.getElementById("ai-ask");
    const aiInput = document.getElementById("ai-question");
    const aiResp = document.getElementById("ai-response");
    if (aiBtn && aiInput && aiResp) {
        aiBtn.onclick = () => {
            const question = aiInput.value.trim();
            if (!question) {
                aiResp.textContent = "سؤال خود را وارد کنید!";
                return;
            }
            aiResp.textContent = "در حال بررسی...";
            setTimeout(() => {
                aiResp.textContent = "این فقط یک پاسخ آزمایشی است. سیستم مشاوره به‌زودی فعال می‌شود!";
            }, 1500);
        };
    }
}

function setupCartButton() {
    const cartBox = document.querySelector('.cart-box');
    if (cartBox) {
        cartBox.onclick = function () {
            window.location = '/cart.html';
        };
    }
}

// ================== اجرای فانکشن‌های عمومی بعد از لود کامل صفحه ==================
window.onload = function () {
    updateCartCount();
    setupAIBox();
    setupCartButton();
};
