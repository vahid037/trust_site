// models/ChatLog.js
const { Schema, model } = require('mongoose');

const ChatLogSchema = new Schema({
    uid: { type: String, required: true },          // شناسه یکتای مرورگر
    threadId: { type: String, required: true },          // ترد OpenAI
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// در نهایت Collection = chatlogs
module.exports = model('ChatLog', ChatLogSchema);
