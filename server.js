/*****  server.js  *****/
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const axios = require('axios');
const OpenAI = require('openai');

const { connect } = require('./db');          // اتصال به مونگو
const Order = require('./models/Order'); // مدل سفارش

/* ==========  اتصال به پایگاه‌داده  ========== */
connect();

/* ==========  تنظیمات اکسپرس  ========== */
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ==========  کلاینت‌های خارجی  ========== */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = 'asst_yqlP7CjfN4hBNgK22XWXluRJ';
const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || 'zibal';      // مرچنت تستی
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

/* ==========  توابع کمکی  ========== */
async function searchProducts(keyword) {
    const raw = await fs.readFile('./products.json', 'utf8');
    const list = JSON.parse(raw);

    const matched = list.filter(
        p => p.name.includes(keyword) || p.id.includes(keyword)
    );

    if (!matched.length) return 'موردی یافت نشد.';

    return matched
        .map(
            p => `
    <div class="chat-card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}">
      <div class="info">
        <span class="title">${p.name}</span>
        <span class="price">${p.price.toLocaleString('fa-IR')} تومان</span>
      </div>
      <button class="add-to-cart">+</button>
    </div>`
        )
        .join('');
}

/* ==========  API چت  ========== */
app.post('/api/chat', async (req, res) => {
    try {
        let { threadId, message } = req.body;

        if (!threadId) {
            const thread = await openai.beta.threads.create();
            threadId = thread.id;
        }

        await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: message,
        });

        let run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: ASSISTANT_ID,
        });

        while (true) {
            if (['completed', 'failed', 'cancelled'].includes(run.status)) break;

            if (run.status === 'requires_action') {
                const tool_outputs = [];

                for (const call of run.required_action.submit_tool_outputs.tool_calls) {
                    const { name, arguments: argsJSON } = call.function;
                    const args = JSON.parse(argsJSON);

                    if (name === 'searchProducts') {
                        const output = await searchProducts(args.keyword);
                        tool_outputs.push({ tool_call_id: call.id, output });
                    }
                }

                run = await openai.beta.threads.runs.submitToolOutputs(
                    threadId,
                    run.id,
                    { tool_outputs }
                );
            } else {
                await new Promise(r => setTimeout(r, 1000));
                run = await openai.beta.threads.runs.retrieve(threadId, run.id);
            }
        }

        if (run.status !== 'completed')
            return res.status(500).json({ error: 'پردازش کامل نشد', threadId });

        const msgs = await openai.beta.threads.messages.list(threadId, { limit: 1 });
        const reply = msgs.data[0].content[0].text.value;

        res.json({ threadId, response: reply });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/* ==========  API ثبت سفارش و دریافت لینک پرداخت  ========== */
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items } = req.body;
        if (!items?.length) return res.status(400).json({ error: 'سبد خالیه!' });

        const amountTomans = items.reduce((s, i) => s + i.price * i.qty, 0);
        const amount = amountTomans * 10; // ریال

        const orderId = 'ORD-' + crypto.randomBytes(4).toString('hex');

        const order = await Order.create({
            orderId,
            customer,
            items,
            amount,
            status: -1,
        });

        const { data } = await axios.post('https://gateway.zibal.ir/v1/request', {
            merchant: ZIBAL_MERCHANT,
            amount,
            callbackUrl: `${BASE_URL}/api/zibal/callback`,
            description: `خرید ${orderId}`,
            orderId,
            mobile: customer.phone,
        });

        if (data.result !== 100) {
            await Order.updateOne({ _id: order._id }, { status: data.result });
            return res.status(500).json({ error: `Zibal: ${data.message}` });
        }

        await Order.updateOne({ _id: order._id }, { trackId: data.trackId });

        const payUrl = `https://gateway.zibal.ir/start/${data.trackId}`;
        res.json({ payUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'مشکل سمت سرور' });
    }
});

/* ==========  کال‌بک زیبال و وریفای  ========== */
app.get('/api/zibal/callback', async (req, res) => {
    try {
        const { success, trackId, orderId } = req.query;
        const order = await Order.findOne({ orderId });
        if (!order) return res.send('سفارش پیدا نشد!');

        if (success !== '1') {
            order.status = 0;
            await order.save();
            return res.redirect('/payment-failed.html');
        }

        const { data } = await axios.post('https://gateway.zibal.ir/v1/verify', {
            merchant: ZIBAL_MERCHANT,
            trackId,
        });

        order.status = data.status;
        order.refNumber = data.refNumber;
        await order.save();

        if (data.result === 100 && data.status === 1) {
            return res.redirect('/payment-success.html');
        } else {
            return res.redirect('/payment-failed.html');
        }

    } catch (err) {
        console.error(err);
        res.send('خطای سرور در بررسی پرداخت');
    }
});


/* ==========  صفحات استاتیک  ========== */
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
app.get('/cart', (_, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));
app.get('/checkout', (_, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/product/:id', (_, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));
app.get('/category/:cat', (_, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));

/* ==========  اجرا  ========== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
