require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai'); // v4 SDK
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json()); // to read JSON POST body
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

app.post('/api/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  try {
    const userMsg = req.body.message || '';
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // یا gpt-4o / gpt-4o-mini-high
      stream: true,
      messages: [
        { role: 'system', content: 'You are a helpful sales assistant for skincare products. جواب‌ها را به زبان فارسی رسمی ولی خودمانی بده.' },
        { role: 'user', content: userMsg }
      ]
    });
    for await (const chunk of stream) {
      const token = chunk.choices[0].delta.content || '';
      res.write(token);
    }
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
