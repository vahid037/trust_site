// checkout.js
document.addEventListener('DOMContentLoaded', () => {
    // تبدیل ارقام فارسی/عربی به انگلیسی
    function toEnglishDigits(str = '') {
        const fa = '۰۱۲۳۴۵۶۷۸۹';
        const ar = '٠١٢٣٤٥٦٧٨٩';
        return str
            .replace(/[۰-۹]/g, d => fa.indexOf(d))
            .replace(/[٠-٩]/g, d => ar.indexOf(d));
    }

    const form = document.getElementById('checkout-form');
    if (!form) {
        console.error('checkout-form not found!');
        return;
    }
    const fields = form.querySelectorAll('input, textarea');
    const totalEl = document.getElementById('order-total');

    // مقدار اولیه جمع سبد
    refreshTotal();

    function refreshTotal() {
        const items = safeGetCart();
        const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
        if (totalEl) totalEl.textContent = total.toLocaleString();
        return { items, total };
    }

    function safeGetCart() {
        try {
            return typeof getCart === 'function' ? getCart() : [];
        } catch {
            return [];
        }
    }

    // نمایش پیام خطا
    function setError(el, msg) {
        el.setCustomValidity(msg);
        el.reportValidity();
        alert(msg); // همیشه (دسکتاپ و موبایل) برای اطمینان
    }

    // پاک کردن خطا
    fields.forEach(el => el.addEventListener('input', () => el.setCustomValidity('')));

    // جلوگیری از حباب پیش‌فرض
    form.addEventListener('invalid', e => e.preventDefault(), true);

    form.addEventListener('submit', async e => {
        e.preventDefault();

        // ولیدیشن سمت کلاینت
        for (const el of fields) {
            if (el.hasAttribute('required') && !el.value.trim()) {
                return setError(el, 'لطفاً این فیلد را پر کنید');
            }
            if (el.name === 'phone' && !/^09\d{9}$/.test(toEnglishDigits(el.value))) {
                return setError(el, 'شماره موبایل باید با 09 شروع و 11 رقم باشد');
            }
            if (el.name === 'postalCode' && !/^\d{10}$/.test(toEnglishDigits(el.value))) {
                return setError(el, 'کد پستی باید ۱۰ رقم باشد');
            }
        }

        // بازخوانی سبد (تازه)
        const { items } = refreshTotal();
        if (!items.length) {
            alert('سبد خرید خالی است! شما به فروشگاه برمی‌گردید.');
            location.href = '/';
            return;
        }

        // داده مشتری
        const customer = Object.fromEntries(new FormData(form).entries());
        customer.phone = toEnglishDigits(customer.phone);
        customer.postalCode = toEnglishDigits(customer.postalCode);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer, items })
            }).then(r => r.json());

            if (res.payUrl) {
                saveCart([]); // خالی کردن سبد
                location.href = res.payUrl;
            } else {
                alert(res.error || 'خطا در ثبت سفارش');
            }
        } catch (err) {
            console.error(err);
            alert('خطای شبکه! لطفاً دوباره تلاش کنید');
        }
    });
});
