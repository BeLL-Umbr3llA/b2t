const { Bot, webhookCallback } = require("grammy");
const axios = require("axios");

// Token ကို Environment Variable ကနေ ယူမယ်
const token = process.env.BOT_TOKEN;
const bot = new Bot(token);

// TikTok Link လက်ခံတဲ့အပိုင်း
bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;

    if (url.includes("tiktok.com")) {
        await ctx.reply("ခဏစောင့်ပါ... ဗီဒီယို ရှာနေပါတယ်...");

        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const res = response.data;

            if (res.code === 0) {
                const data = res.data;
                // Video ပို့မယ်
                await ctx.replyWithVideo(data.play, {
                    caption: `🎬 ${data.title}\n\n@YourBotName`,
                });
                // Image (Cover) ပို့မယ်
                await ctx.replyWithPhoto(data.cover, {
                    caption: "🖼️ Video Cover Image",
                });
            } else {
                await ctx.reply("ဗီဒီယို ရှာမတွေ့ပါ။ Link ပြန်စစ်ပါ။");
            }
        } catch (error) {
            await ctx.reply("Server Error! နောက်မှ ပြန်ကြိုးစားပါ။");
        }
    } else if (url === "/start") {
        await ctx.reply("TikTok Link ပို့ပေးပါ၊ Watermark မပါဘဲ ထုတ်ပေးပါမယ်။");
    }
});

// Vercel ရဲ့ Serverless Function အတွက် Export လုပ်ခြင်း
module.exports = webhookCallback(bot, "http");

