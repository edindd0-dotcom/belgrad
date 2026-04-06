const { Client, GatewayIntentBits, PermissionFlagsBits, Partials, ActivityType } = require('discord.js');
const http = require('http');

// --- RENDER ICIN PORT ACMA (BOTUN KAPANMASINI ENGELLER) ---
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Belgrad Bot 7/24 Aktif!');
});

server.listen(process.env.PORT || 3000, () => {
    console.log("==> [SİSTEM] Render portu başarıyla açıldı.");
});

// --- BOTU TANIMLA ---
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

const prefix = ".";

// --- BOT GIRIS YAPINCA ---
client.on('ready', () => {
    console.log(`✅ [BAŞARILI] ${client.user.tag} olarak giriş yapıldı!`);
    client.user.setPresence({
        activities: [{ name: 'Belgrad Moderasyon', type: ActivityType.Watching }],
        status: 'online',
    });
});

// --- MODERASYON KOMUTLARI ---
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Akıllı Hedef Belirleme (Etiket veya Yanıt)
    const target = message.mentions.members.first() || 
                   (message.reference ? (await message.channel.messages.fetch(message.reference.messageId)).member : null);

    try {
        // LOCK & UNLOCK
        if (command === 'lock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
            return message.reply("🔒 Kanal kilitlendi.");
        }

        if (command === 'unlock') {
            if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
            return message.reply("🔓 Kanal açıldı.");
        }

        // HEDEF GEREKTİREN KOMUTLAR
        if (!target && ['ban', 'kick', 'mute', 'unmute'].includes(command)) {
            return message.reply("❌ Birini etiketlemedin veya bir mesajı yanıtlamadın!");
        }

        if (command === 'ban') {
            if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
            await target.ban({ reason: `Mod: ${message.author.tag}` });
            message.reply(`✅ **${target.user.tag}** yasaklandı.`);
        }

        if (command === 'kick') {
            if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;
            await target.kick();
            message.reply(`✅ **${target.user.tag}** atıldı.`);
        }

        if (command === 'mute') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
            await target.timeout(10 * 60 * 1000); // 10 Dakika
            message.reply(`✅ **${target.user.tag}** 10 dakika susturuldu.`);
        }

        if (command === 'unmute') {
            if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
            await target.timeout(null);
            message.reply(`✅ **${target.user.tag}** susturması kaldırıldı.`);
        }

    } catch (error) {
        console.error("HATA:", error);
        message.reply("⚠️ İşlem yapılamadı. Botun yetkisinin ve rolünün üstte olduğundan emin ol.");
    }
});

// --- GİRİŞ VE HATA YAKALAMA ---
if (!process.env.TOKEN) {
    console.error("❌ HATA: TOKEN bulunamadı! Render Environment Variables kısmına TOKEN ekle.");
} else {
    client.login(process.env.TOKEN).catch(err => {
        console.error("❌ DISCORD HATASI:", err.message);
    });
}
