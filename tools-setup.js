// tools-setup.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ASSISTANT_ID = "asst_yqlP7CjfN4hBNgK22XWXluRJ";

await openai.beta.assistants.update(ASSISTANT_ID, {
    instructions: `
    تو فروشندهٔ فروشگاه لوازم پوست و مو هستی.
    اگر کاربر دربارهٔ موجودی، قیمت یا توضیح محصولی پرسید
    و خودت جواب دقیق نداری، حتماً تابع searchProducts را
    با کلیدواژهٔ فارسی فراخوانی کن.
    وقتی خروجی تابع را گرفتی:
      • HTML آن را بدون تغییر در پیام قرار بده
      • قبل یا بعدش یک توضیح کوتاه فارسی اضافه کن
  `,
    tools: [
        /* قبلی‌ها را نگه دار مثل code_interpreter اگر داشتی */
        {
            type: "function",
            function: {
                name: "searchProducts",
                description: "جست‌وجوی محصول در فایل JSON و برگرداندن HTML کارت‌ها",
                strict: true,
                parameters: {
                    type: "object",
                    properties: {
                        keyword: { type: "string", description: "واژهٔ جست‌وجو" }
                    },
                    required: ["keyword"],
                    additionalProperties: false
                }
            }
        }
    ]
});
console.log("✅ Assistant به searchProducts مجهز شد");
