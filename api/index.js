const { Bot, webhookCallback } = require("grammy");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

// Environment Variables များ ခေါ်ယူခြင်း
const token = process.env.BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const ADMIN_ID = Number(process.env.ADMIN_ID); 

const bot = new Bot(token);
const supabase = createClient(supabaseUrl, supabaseKey);

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text.trim();
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name;
    const username = ctx.from.username || "No Username";

    // --- (A) Database ထဲမှာ User ရှိမရှိစစ်ပြီး Count တိုးခြင်း ---
    try {
        const { data: user } = await supabase
            .from('users')
            .select('usage_count')
            .eq('id', userId)
            .single();

        const currentCount = user ? user.usage_count : 0;

        await supabase.from('users').upsert({
            id: userId,
            first_name: firstName,
            username: username,
            usage_count: currentCount + 1
        });
    } catch (err) {
        console.error("Database Error (User Update):", err);
    }

    // ၁။ TikTok Link ဟုတ်မဟုတ် စစ်ဆေးခြင်း
    if (url.includes("tiktok.com")) {
        await ctx.reply("ခဏစောင့်ပေးပါခင်ဗျာ...");

        try {
            // Link ကို History ထဲ သိမ်းခြင်း
            await supabase.from('links_history').insert({
                user_id: userId,
                link_url: url
            });

            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const res = response.data;

            if (res.code === 0) {
                const data = res.data;

                if (data.images && data.images.length > 0) {
                    const mediaGroup = data.images.map((imgUrl) => ({
                        type: "photo",
                        media: imgUrl,
                    }));
                    await ctx.replyWithMediaGroup(mediaGroup.slice(0, 10));
                    await ctx.reply("ရေအမှတ် မပါတာရပါပြီဗျာ ---B3ll");
                } 
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

   // ၂။ Admin အတွက် Dashboard (Stats - Top 10)
    else if (url === "/stats" && userId === ADMIN_ID) {
        try {
            const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
            const { count: linkCount } = await supabase.from('links_history').select('*', { count: 'exact', head: true });
            
            // limit ကို 10 လို့ ပြောင်းထားပါတယ်
            const { data: topUsers } = await supabase
                .from('users')
                .select('first_name, usage_count')
                .order('usage_count', { ascending: false })
                .limit(10); 

            let statMsg = `📊 *BOT DASHBOARD*\n\n`;
            statMsg += `👥 Users: ${userCount || 0} | 🔗 Downloads: ${linkCount || 0}\n\n`;
            
            statMsg += `🏆 *TOP 10 USERS LIST*\n`;
            statMsg += `\`\`\`\n`;
            statMsg += `| No | Name       | Qty |\n`;
            statMsg += `|----|------------|-----|\n`;
            
            topUsers?.forEach((u, i) => {
                // နံပါတ်စဉ်ကို ၂ လုံးစာ နေရာယူခိုင်းမယ် (ဥပမာ ၁၀ ဆိုရင် ညီသွားအောင်)
                let no = (i + 1).toString().padEnd(2, ' ');
                let name = u.first_name.substring(0, 10).padEnd(10, ' ');
                let count = u.usage_count.toString().padEnd(3, ' ');
                statMsg += `| ${no} | ${name} | ${count} |\n`;
            });
            statMsg += `\`\`\``;

            await ctx.reply(statMsg, { parse_mode: "Markdown" });
        } catch (err) {
            console.error(err);
            await ctx.reply("Stats ထုတ်ရာတွင် အမှားအယွင်းရှိနေပါသည်။");
        }
    }
    // ၃။ /start command အတွက်
    else if (url === "/start") {
        await ctx.reply("TikTok Link ပို့ပေးပါခင်ဗျာ... \nကိုကိုဘဲ မှ Logo အပျောက် \nvideo ပြန်ပို့ပေးပါမယ် ခင်ဗျာ...\n @bellumbrr");
    } 
    // ၄။ အခြားစာသားများအတွက်
    else {
        await ctx.reply("ကျေးဇူးပြု၍ TikTok Link တစ်ခု ပို့ပေးပါခင်ဗျာ။");
    }
});

module.exports = webhookCallback(bot, "http");
