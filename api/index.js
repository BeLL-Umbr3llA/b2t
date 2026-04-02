const { Bot, webhookCallback } = require("grammy");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;

    if (url.includes("tiktok.com")) {
        // Link ရတာနဲ့ အရင်ဆုံး စာပြန်မယ်
        await ctx.reply("ခဏစောင့်ပေးပါခင်ဗျာ...");

        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const res = response.data;

            if (res.code === 0) {
                const data = res.data;

                // ၁။ Video ဖြစ်လျှင် (HD Quality ကို အရင်စစ်မယ်)
                if (data.hdplay || data.play) {
                    const videoUrl = data.hdplay || data.play;
                    
                    await ctx.replyWithVideo(videoUrl, {
                        caption: "ကျေးဇူးတင်ပါတယ်ခင်ဗျာ။",
                    });
                } 
                // ၂။ Photo Slideshow ဖြစ်လျှင်
                else if (data.images && data.images.length > 0) {
                    const mediaGroup = data.images.map((imgUrl) => ({
                        type: "photo",
                        media: imgUrl,
                    }));
                    await ctx.replyWithMediaGroup(mediaGroup.slice(0, 10));
                    await ctx.reply("မိတ်ဆွေလိုအပ်တဲ့ ရေအမှတ်မပါတာရပါပြီဗျာ ----B3ll");
                }
            } else {
                await ctx.reply("ဗီဒီယို သို့မဟုတ် ဓာတ်ပုံ ရှာမတွေ့ပါ။");
            }
        } catch (error) {
            console.error(error);
            await ctx.reply("Server Error! ခဏနေမှ ပြန်ကြိုးစားကြည့်ပါ။");
        }
    } else if (url === "/start") {
        await ctx.reply("TikTok Link ပို့ပေးပါခင်ဗျာ... \nကိုကိုဘဲ မှ Logo အပျောက် video ပြန်ပို့ပေးပါမယ် ခင်ဗျာ...");
    }
});

module.exports = webhookCallback(bot, "http");

