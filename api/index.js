const { Bot, webhookCallback, InputFile } = require("grammy");
const axios = require("axios");

const token = process.env.BOT_TOKEN;
const bot = new Bot(token);

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;

    if (url.includes("tiktok.com")) {
        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const res = response.data;

            if (res.code === 0) {
                const data = res.data;

                // ၁။ Video ဖြစ်ခဲ့လျှင် (Video only)
                if (data.play) {
                    await ctx.replyWithVideo(data.play, {
                        caption: "ကျေးဇူးတင်ပါတယ်ခင်ဗျာ။",
                    });
                } 
                // ၂။ Photo Slideshow ဖြစ်ခဲ့လျှင် (Images only)
                else if (data.images && data.images.length > 0) {
                    // ပုံအားလုံးကို Album လိုက်ပို့ပေးမှာဖြစ်ပါတယ်
                    const mediaGroup = data.images.map((imgUrl) => ({
                        type: "photo",
                        media: imgUrl,
                    }));

                    // ပုံအရေအတွက်များရင် အပိုင်းလိုက်ခွဲပို့ဖို့လိုအပ်နိုင်လို့ ပထမ ၁၀ ပုံကို အရင်ပို့ပါမယ်
                    await ctx.replyWithMediaGroup(mediaGroup.slice(0, 10));
                    await ctx.reply("ကျေးဇူးတင်ပါတယ်ခင်ဗျာ။");
                }
            } else {
                await ctx.reply("ဗီဒီယို သို့မဟုတ် ဓာတ်ပုံ ရှာမတွေ့ပါ။");
            }
        } catch (error) {
            console.error(error);
            await ctx.reply("Server Error!");
        }
    } else if (url === "/start") {
        await ctx.reply("TikTok Link ပို့ပေးပါခင်ဗျာ။");
    }
});

module.exports = webhookCallback(bot, "http");
