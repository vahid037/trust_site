const { Schema, model } = require('mongoose');

module.exports = model('Order', new Schema({
    orderId: { type: String, unique: true },
    customer: {
        fullName: String,
        phone: String,
        address: String,
        postalCode: String,
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        qty: Number,
    }],
    amount: Number,       // ریال
    status: { type: Number, default: -1 }, // جدول وضعیت زیبال
    trackId: Number,
    refNumber: Number,
    createdAt: { type: Date, default: Date.now },
}));
