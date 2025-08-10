// ========================  home.js  ========================

// ===== شناسه یکتای کاربر (برای چت حافظه‌دار) =====
function getOrCreateUid() {
    let uid = localStorage.getItem('ai_uid');
    if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem('ai_uid', uid);
    }
    return uid;
}
const uid = getOrCreateUid();   // ← یکتا برای هر مرورگر
// ===== متغیر سراسری Thread =====
let threadId = null; // شناسه‌ی Thread مشترک بین درخواست‌ها

// ===== توابع کمکی چت هیستوری =====
function addToHistory(role, content, historyEl, isHTML = false) {
    const wrap = document.createElement('div');
    wrap.className = role === 'user' ? 'msg-user' : 'msg-ai';
    const label = role === 'user' ? 'شما:' : 'دستیار:';
    wrap.innerHTML = `<span class="bubble">${label} ${isHTML ? content : escapeHTML(content)
        }</span>`;
    historyEl.appendChild(wrap);
    historyEl.scrollTop = historyEl.scrollHeight;
}
function removeLastAIMessage(hist) {
    const items = hist.querySelectorAll('.msg-ai');
    if (items.length) hist.removeChild(items[items.length - 1]);
}
function escapeHTML(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== تابع گفت‌وگو با هیستوری =====
async function askAI(question, historyEl) {
    addToHistory('user', question, historyEl); // پیام کاربر
    addToHistory('ai', 'در حال پاسخ‌گویی...', historyEl);
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, threadId, message: question }),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        threadId = data.threadId; // ذخیره ترد
        removeLastAIMessage(historyEl);
        addToHistory('ai', data.response, historyEl, true);
        hookChatCards(historyEl); // فعال‌سازی دکمه‌های +
    } catch (e) {
        removeLastAIMessage(historyEl);
        addToHistory('ai', 'خطا در دریافت پاسخ!', historyEl);
        console.error(e);
    }
}

/* — دکمه‌های + در کارت‌های چت — */
function hookChatCards(container) {
    container.querySelectorAll('.chat-card .add-to-cart').forEach((btn) => {
        if (btn.dataset.bound) return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
            const card = btn.closest('.chat-card');
            if (!card) return;
            const id = card.dataset.id;
            const name = card.querySelector('.title').textContent.trim();
            const priceText = card.querySelector('.price').textContent.replace(/[^0-9۰-۹]/g, '');
            const price = Number(priceText.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
            let img = card.querySelector('img')?.getAttribute('src') || '';
            img = img.replace(/^\/?images\//, '');
            addToCart({ id, name, price, img });
            btn.textContent = '✓';
            setTimeout(() => (btn.textContent = '+'), 1200);
        });
    });
}

// ===== گفت‌وگو ساده (بدون هیستوری) برای باکس هدر =====
function attachAIInline(btnId, inputId, respId) {
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
        resp.textContent = 'در حال پاسخ‌گویی...';
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, threadId, message: q }),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) throw new Error(data.error);
                threadId = data.threadId;
                resp.innerHTML = data.response;
                hookChatCards(resp);
            })
            .catch((e) => {
                resp.textContent = 'خطا در دریافت پاسخ!';
                console.error(e);
            });
        input.value = '';
    };
    input.addEventListener('keydown', (e) => e.key === 'Enter' && btn.click());
}

// ============================================================
// به محض بارگذاری اولیهٔ DOM اجرا می‌شود:
window.addEventListener('DOMContentLoaded', () => {
    /* ---------- ۱) بنر بالای همه صفحات ---------- */
    const banner = document.createElement('div');
    banner.id = 'global-banner';
    banner.className = 'global-banner';
    banner.innerHTML =
        'حضور شما در فروشگاه ما باعث افتخار است. مسئولیت خرید شما از اینجانب <b>وحید رحمانی</b> با کد نمایندگی <b>138911</b> است. وب‌سایت رسمی شرکت: <a href="https://liateam.ir" target="_blank">Liateam.ir</a>';

    const header = document.querySelector('header');
    if (header) header.parentNode.insertBefore(banner, header);
    else document.body.insertBefore(banner, document.body.firstChild);

    /* ---------- ۲) پاپ‌آپ هوش مصنوعی ---------- */
    const popup = document.createElement('div');
    popup.id = 'ai-popup';
    popup.innerHTML = `
    <button id="ai-close" aria-label="بستن">✕</button>
    <div class="ai-body">
      <div class="ai-media">
        <video src="video/ai-wave.mp4" autoplay loop muted playsinline></video>
      </div>
      <div id="chat-history" class="chat-history"></div>
      <div class="ai-input-row">
        <input type="text" id="ai-question-pop" placeholder="سؤال خود را بنویسید…" />
        <button id="ai-ask-pop">بپرس</button>
      </div>
    </div>`;
    document.body.appendChild(popup);

    document.getElementById('ai-close').addEventListener('click', () => popup.remove());

    /* ---------- ۳) اتصال هندلرها ---------- */
    // پاپ‌آپ با هیستوری
    (function attachAIHistory() {
        const btn = document.getElementById('ai-ask-pop');
        const input = document.getElementById('ai-question-pop');
        const history = document.getElementById('chat-history');
        if (!btn || !input || !history) return;
        btn.onclick = () => {
            const q = input.value.trim();
            if (!q) {
                addToHistory('ai', 'سؤال خود را وارد کنید!', history);
                return;
            }
            askAI(q, history);
            input.value = '';
        };
        input.addEventListener('keydown', (e) => e.key === 'Enter' && btn.click());
    })();

    // باکس ساده هدر
    attachAIInline('ai-ask', 'ai-question', 'ai-response');

    /* ---------- ۴) توگل منو موبایل ---------- */
    const hamburger = document.getElementById('hamburger');
    if (hamburger) hamburger.addEventListener('click', () => document.querySelector('.main-nav')?.classList.toggle('open'));

    /* ---------- ۵) سایر initialization های فروشگاه ---------- */
    loadBestsellers();
    updateCartCount();
    setupAddToCartButtons();
    setupCartButton();
});

// ================== دیتای محصولات و دسته‌ها ==================
const columns = [
    [
        { id: 'deep-fusion', img: 'دیپ-فیوژن-واتر-SPF50-تراست.webp', alt: 'دیپ فیوژن واتر', name: 'دیپ فیوژن واتر تراست اسمارت SPF50', volume: '۴۰ میل', price: 797000 },
        { id: 'sun-dry-light', img: 'کرم-ضد-آفتاب-رنگی-پوست-خشک-روشن-تراست.webp', alt: 'آفتاب رنگی روشن', name: 'کرم ضد آفتاب رنگی بژ روشن (خشک/نرمال)', volume: '۴۰ میل', price: 397000 }
    ],
    [
        { id: 'serum-smart3', img: 'سرم-سه-گانه-هوشمند-تراست.webp', alt: 'سرم سه‌گانه', name: 'سرم سه‌گانه هوشمند تراست', volume: '۶۰ میل', price: 2970000 },
        { id: 'serum-hya', img: 'سرم-آبرسان-هیالورونیک-اسید-تراست.webp', alt: 'سرم هیالورونیک', name: 'سرم آبرسان هیالورونیک اسید تراست', volume: '۲۰ میل', price: 537000 }
    ],
    [
        { id: 'cream-oily', img: 'کرم-آبرسان-پوست-چرب-تراست.webp', alt: 'آبرسان چرب', name: 'کرم آبرسان پوست چرب تراست', volume: '۵۰ میل', price: 297000 },
        { id: 'cream-dry', img: 'کرم-آبرسان-پوست-نرمال-تراست.webp', alt: 'آبرسان خشک', name: 'کرم آبرسان پوست خشک و نرمال تراست', volume: '۵۰ میل', price: 297000 }
    ],
    [
        { id: 'hand-body', img: 'کرم-دست-بدن-شیر-عسل-تراست.webp', alt: 'کرم شیر و عسل', name: 'کرم دست و بدن پروتئین شیر و عسل تراست', volume: '۱۵۰ میل', price: 297000 },
        { id: 'emu-oil', img: 'روغن-شترمرغ-تراست.webp', alt: 'روغن شترمرغ', name: 'روغن شترمرغ', volume: '۱۲۰ میل', price: 477000 }
    ],
    [
        { id: 'sham-anti', img: 'شامپو-ضدشوره-ملایم-تراست.webp', alt: 'شامپو ضدشوره', name: 'شامپو ضد شوره ملایم (خشک/نرمال)', volume: '۲۰۰ میل', price: 297000 },
        { id: 'sham-color', img: 'شامپو-ثبیت-رنگ-تراست.webp', alt: 'شامپو تثبیت رنگ', name: 'شامپو تثبیت رنگ و ترمیم مو', volume: '۲۰۰ میل', price: 297000 }
    ]
];

const bestsellers = columns.flat();

const slides = [];
for (let i = 0; i < columns.length; i++) {
    const nextIndex = (i + 1) % columns.length;
    slides.push([...columns[i], ...columns[nextIndex]]);
}

// ================== تابع کمکی برای رندر لیستی از محصولات ==================
function renderProductsArray(arr) {
    const root = document.getElementById('bestseller-products');
    if (!root) return;
    root.innerHTML = arr.map(p => `
    <article class="square-card"
            data-id="${p.id}"
            data-name="${p.name}"
            data-price="${p.price}"
            data-img="${p.img}">
      <figure><img src="images/${p.img}" alt="${p.alt}" loading="lazy"></figure>
      <h2>${p.name}</h2>
      <span class="volume">${p.volume}</span>
      <span class="price">${p.price.toLocaleString('fa-IR')} تومان</span>
      <button class="add-to-cart">+</button>
    </article>`
    ).join('');
}

// ================== تابعی برای اجرای ۵ مرحلهٔ چرخشی در موبایل ==================
function cycleBestsellerSteps() {
    setTimeout(() => renderProductsArray([...columns[0], ...columns[1]]), 0);
    setTimeout(() => renderProductsArray([...columns[1], ...columns[2]]), 2000);
    setTimeout(() => renderProductsArray([...columns[2], ...columns[3]]), 4000);
    setTimeout(() => renderProductsArray([...columns[3], ...columns[4]]), 6000);
    setTimeout(() => renderProductsArray([...columns[4], ...columns[0]]), 8000);
    setTimeout(() => cycleBestsellerSteps(), 10000);
}

// ================== تابع اصلی loadBestsellers ==================
function loadBestsellers() {
    const root = document.getElementById('bestseller-products');
    if (!root) return;

    const isMobile = window.innerWidth < 700;
    if (!isMobile) {
        renderProductsArray(bestsellers);
    } else {
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
    /* اگر قبلاً یک لیسنر جهانی ثبت شده، دوباره نساز تا دوبار اضافه نشود */
    if (document.body.dataset.cartBound) return;
    document.body.dataset.cartBound = "1";

    document.body.addEventListener('click', e => {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;                 // روی چیز دیگری کلیک شده

        const card = btn.closest('.square-card');
        if (!card) return;                // دکمه داخل کارت نیست

        // داده‌ها را از data-attributes می‌خوانیم
        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = Number(card.dataset.price || 0);
        const img = card.dataset.img;

        addToCart({ id, name, price, img });

        // انیمیشن تأیید کوچک
        btn.textContent = '✓';
        setTimeout(() => (btn.textContent = '+'), 1000);
    });
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
    setupCartButton();
};
