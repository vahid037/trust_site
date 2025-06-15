// ----- سبد خرید با ذخیره‌سازی در localStorage -----

// گرفتن آرایه کل محصولات سبد خرید
window.getCart = function () {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

// ذخیره‌سازی محصولات سبد خرید
window.saveCart = function (items) {
    localStorage.setItem('cart', JSON.stringify(items));
}

// افزودن محصول به سبد خرید (یا افزایش تعدادش)
window.addToCart = function (product) {
    const cart = window.getCart();
    const idx = cart.findIndex(i => i.id === product.id);

    if (idx > -1) {
        cart[idx].qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    window.saveCart(cart);
    window.updateCartBadge(cart);
}

// حذف یک محصول کامل از سبد خرید
window.removeFromCart = function (productId) {
    let cart = window.getCart();
    cart = cart.filter(i => i.id !== productId);
    window.saveCart(cart);
    window.updateCartBadge(cart);
}

// تغییر تعداد یک محصول (مثبت/منفی)
window.setCartQty = function (productId, qty) {
    const cart = window.getCart();
    const idx = cart.findIndex(i => i.id === productId);
    if (idx > -1) {
        if (qty <= 0) {
            cart.splice(idx, 1);
        } else {
            cart[idx].qty = qty;
        }
        window.saveCart(cart);
        window.updateCartBadge(cart);
    }
}

// گرفتن تعداد کل محصولات (جمع تعداد qty)
window.getCartCount = function () {
    const cart = window.getCart();
    return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

// بروزرسانی شمارنده سبد خرید در همه صفحات
window.updateCartBadge = function (cart) {
    cart = cart || window.getCart();
    const el = document.getElementById('cart-count');
    if (el) el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

// بروزرسانی شمارنده سبد خرید بعد از هر بار لود صفحه
document.addEventListener('DOMContentLoaded', function () {
    window.updateCartBadge();
});
