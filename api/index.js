const { Bot, webhookCallback } = require("grammy");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text.trim();

    // ၁။ TikTok Link ဟုတ်မဟုတ် စစ်ဆေးခြင်း
    if (url.includes("tiktok.com")) {
        await ctx.reply("ခဏစောင့်ပေးပါခင်ဗျာ...");

        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const res = response.data;

            if (res.code === 0) {
                const data = res.data;

                // Photo Slideshow ဖြစ်မဖြစ် အရင်စစ်မယ် (ဒါမှ ပုံတွေအရင်ထွက်မှာပါ)
                if (data.images && data.images.length > 0) {
                    const mediaGroup = data.images.map((imgUrl) => ({
                        type: "photo",
                        media: imgUrl,
                    }));
                    
                    // Telegram က တစ်ခါပို့ရင် ပုံ ၁၀ ပုံပဲ လက်ခံလို့ ပထမ ၁၀ ပုံကို ပို့ပေးမယ်
                    await ctx.replyWithMediaGroup(mediaGroup.slice(0, 10));
                    await ctx.reply("ရေအမှတ် မပါတာရပါပြီဗျာ ---B3ll");
                } 
                // Photo မဟုတ်မှ Video အနေနဲ့ စစ်မယ်
                else if (data.hdplay || data.play) {
                    const videoUrl = data.hdplay || data.play;
                    await ctx.replyWithVideo(videoUrl, {
                        caption: "ရေအမှတ်မပါတာရပါပြီဗျာ ---B3ll",
                    });
                }
            } else {
                await ctx.reply("ဗီဒီယို သို့မဟုတ် ဓာတ်ပုံ ရှာမတွေ့ပါ။ Link ကို ပြန်စစ်ပေးပါ။");
            }
        } catch (error) {
            console.error(error);
            await ctx.reply("Server Error! ခဏနေမှ ပြန်ကြိုးစားကြည့်ပါ။");
        }
    } 
    // ၂။ /start command အတွက်
    else if (url === "/start") {
        await ctx.reply("TikTok Link ပို့ပေးပါခင်ဗျာ... \nကိုကိုဘဲ မှ Logo အပျောက် \nvideo ပြန်ပို့ပေးပါမယ် ခင်ဗျာ...\n @bellumbrr");
    } 
    // ၃။ TikTok Link လည်းမဟုတ်၊ Start လည်းမဟုတ်တဲ့ တခြားစာသားတွေအတွက်
    else {
        await ctx.reply("ကျေးဇူးပြု၍ TikTok Link တစ်ခု ပို့ပေးပါခင်ဗျာ။");
    }
});

module.exports = webhookCallback(bot, "http");

