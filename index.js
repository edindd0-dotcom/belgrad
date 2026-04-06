const { Client, GatewayIntentBits, PermissionFlagsBits, Partials } = require('discord.js');
const http = require('http');

// --- RENDER PORTU VE CANLI TUTMA ---
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Belgrad Bot Aktif!");
    res.end();
}).listen(process.env.PORT || 3000, () => {
    console.log("==> Render Portu Dinleniyor...");
});

// --- BOT İSTEMCİSİ (Tüm Niyetler Açık) ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const prefix = "."; // Komut başlangıcı

// --- BOT HAZIR OLDUĞUNDA ---
client.on('ready', () => {
    console.log(`✅ BAŞARILI: ${client.user.tag} sunucuya giriş yaptı!`);
    client.user.setActivity(`${prefix}help | Belgrad`);
});

// --- KOMUT DÖNGÜSÜ ---
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // HEDEF BELİRLEME (Etiket veya Yanıt)
    const getTarget = () => {
        if (message.mentions.members.first()) return message.mentions.members.first();
        if (message.reference && message.reference.messageId) {
            const repliedMessage = message.channel.messages.cache.get(message.reference.messageId);
            return repliedMessage ? repliedMessage.member : null;
        }
        return null;
    };

    const target = getTarget();

    // MODERASYON KOMUTLARI
    try {
        if (command === 'ban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply("❌ Yetkin yok.");
            if (!target) return message.reply("❌ Birini etiketle veya mesajını yanıtla!");
            await target.ban({ reason: `Sorumlu: ${message.author.tag}` });
            message.reply(`✅ **${target.user.tag}** yasaklandı.`);
        }

        if (command === 'kick') {
            if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply("❌ Yetkin yok.");
            if (!target) return message.reply("❌ Birini etiketle veya mesajını yanıtla!");
            await target.kick();
            message.reply(`✅ **${target.user.tag}** atıldı.`);
        }

        if (command === 'mute') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("❌ Yetkin yok.");
            if (!target) return message.reply("❌ Birini etiketle veya mesajını yanıtla!");
            await target.timeout(10 * 60 * 1000); // 10 Dakika
            message.reply(`✅ **${target.user.tag}** 10 dakika susturuldu.`);
        }

        if (command === 'unmute') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply("❌ Yetkin yok.");
            if (!target) return message.reply("❌ Birini etiketle veya mesajını yanıtla!");
            await target.timeout(null);
            message.reply(`✅ **${target.user.tag}** susturması kaldırıldı.`);
        }

        if (command === 'lock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
            message.reply("🔒 Kanal kilitlendi.");
        }

        if (command === 'unlock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
            message.reply("🔓 Kanal açıldı.");
        }
    } catch (err) {
        console.error("Komut Hatası:", err);
        message.reply("❌ Bir hata oluştu (Yetki yetersiz olabilir).");
    }
});

// --- HATA YAKALAMA VE GİRİŞ ---
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ TOKEN HATASI: Token geçersiz veya Intents kapalı!", err.message);
});

process.on('unhandledRejection', error => {
    console.error('⚠️ Kritik Hata:', error);
});
