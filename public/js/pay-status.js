/* =========  pay-status.js  ========= */

(function () {
    const counterEl = document.getElementById('counter');
    let remaining = 10;

    counterEl.textContent = remaining;

    const interval = setInterval(() => {
        remaining--;
        counterEl.textContent = remaining;

        if (remaining <= 0) {
            clearInterval(interval);
            location.href = '/';   // صفحه اصلی
        }
    }, 1000);

    // اگر کاربر روی دکمه کلیک کرد قبل از ۱۰ ثانیه
    document.getElementById('back-btn').onclick = () => location.href = '/';
})();
