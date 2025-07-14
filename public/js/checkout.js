// ===== checkout.js =====
document.addEventListener('DOMContentLoaded', () => {

    // --- تبدیل ارقام فارسی/عربی به انگلیسی -------------
    function toEnglishDigits(str = '') {
        const fa = '۰۱۲۳۴۵۶۷۸۹';
        const ar = '٠١٢٣٤٥٦٧٨٩';
        return str.replace(/[۰-۹]/g, d => fa.indexOf(d))
            .replace(/[٠-٩]/g, d => ar.indexOf(d));
    }

    const items = getCart();
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById('order-total').textContent = total.toLocaleString();

    const form = document.getElementById('checkout-form');
    const fields = form.querySelectorAll('input, textarea');

    /* ⛔️ جلوگیری از حباب پیش‌فرض مرورگر (انگلیسی) */
    form.addEventListener('invalid', e => e.preventDefault(), true);

    /* نمایش پیام فارسی */
    function setError(el, msg) {
        el.setCustomValidity(msg);
        el.reportValidity();              // دسکتاپ
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) { // موبایل
            alert(msg);
        }
    }

    /* پاک‌کردن خطا با تایپ مجدد */
    fields.forEach(el => el.addEventListener('input', () => el.setCustomValidity('')));

    /* ارسال فرم */
    form.addEventListener('submit', async e => {
        e.preventDefault();

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

        if (!items.length) {
            alert('سبد خرید خالی است!');
            return;
        }

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
                saveCart([]);
                location.href = res.payUrl;
            } else {
                alert(res.error || 'خطا در ثبت سفارش');
            }
        } catch (err) {
            alert('خطای شبکه! لطفاً دوباره تلاش کنید');
        }
    });
});
