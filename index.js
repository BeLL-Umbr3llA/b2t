const { Bot } = require("grammy");
const axios = require("axios");

// Bot Token ကို Render ရဲ့ Environment Variable ထဲမှာ ထည့်ပါမယ်
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is not defined");

const bot = new Bot(token);

bot.command("start", (ctx) => {
    ctx.reply("ကြိုဆိုပါတယ်! TikTok Link ပေးလိုက်ရင် Watermark မပါတဲ့ Video နဲ့ Photo ကို ထုတ်ပေးပါမယ်။");
});

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;

    if (url.includes("tiktok.com")) {
        await ctx.reply("ခဏစောင့်ပါ... အချက်အလက်ယူနေပါတယ်...");

        try {
            // TikWM API ကို အသုံးပြုခြင်း
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const res = response.data;

            if (res.code === 0) {
                const data = res.data;

                // ၁။ Video ပို့ခြင်း
                await ctx.replyWithVideo(data.play, {
                    caption: `🎬 Title: ${data.title}\n👤 Author: ${data.author.nickname}`,
                });

                // ၂။ Cover Image (Photo) ပို့ခြင်း
                await ctx.replyWithPhoto(data.cover, {
                    caption: "🖼️ Video Cover Image",
                });

            } else {
                await ctx.reply("ဗီဒီယို ရှာမတွေ့ပါ။ Link မှန်မမှန် ပြန်စစ်ပေးပါ။");
            }
        } catch (error) {
            console.error(error);
            await ctx.reply("Server အခက်အခဲကြောင့် ခဏနေမှ ပြန်ကြိုးစားကြည့်ပါ။");
        }
    }
});

// Bot ကို Start လုပ်ခြင်း
bot.start();
console.log("Bot is running...");

