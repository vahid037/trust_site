const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// استاتیک سرو کردن پوشه public
app.use(express.static(path.join(__dirname, 'public')));

// روت صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// روت محصولات (صفحه هر محصول جدا)
app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// روت دسته‌بندی
app.get('/category/:cat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'category.html'));
});

// روت سبد خرید
app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
