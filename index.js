const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const http = require('http');

// --- RENDER İÇİN 7/24 AKTİF TUTMA SİSTEMİ ---
http.createServer((req, res) => {
    res.write("Bot aktif ve calisiyor!");
    res.end();
}).listen(process.env.PORT || 3000);

// --- BOT AYARLARI ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const prefix = "."; // Komut başlangıcı

client.on('ready', () => {
    console.log(`${client.user.tag} olarak giris yapildi!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // HEDEF BELİRLEME (Etiket varsa onu, yoksa yanıtlanan mesajın sahibini al)
    const getTarget = () => {
        if (message.mentions.members.first()) return message.mentions.members.first();
        if (message.reference) {
            const repliedMessage = message.channel.messages.cache.get(message.reference.messageId);
            return repliedMessage ? repliedMessage.member : null;
        }
        return null;
    };

    const target = getTarget();

    // BAN
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        if (!target) return message.reply("❌ Birini etiketlemeli veya bir mesajı yanıtlamalısın!");
        try {
            await target.ban({ reason: "Moderasyon" });
            message.reply(`✅ **${target.user.tag}** yasaklandı.`);
        } catch (e) { message.reply("❌ Yetkim yetmiyor."); }
    }

    // KICK
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;
        if (!target) return message.reply("❌ Birini etiketlemeli veya bir mesajı yanıtlamalısın!");
        try {
            await target.kick();
            message.reply(`✅ **${target.user.tag}** atıldı.`);
        } catch (e) { message.reply("❌ Yetkim yetmiyor."); }
    }

    // MUTE (Timeout - 10 Dakika)
    if (command === 'mute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
        if (!target) return message.reply("❌ Birini etiketlemeli veya bir mesajı yanıtlamalısın!");
        try {
            await target.timeout(10 * 60 * 1000);
            message.reply(`✅ **${target.user.tag}** 10 dakika susturuldu.`);
        } catch (e) { message.reply("❌ İşlem başarısız."); }
    }

    // UNMUTE
    if (command === 'unmute') {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return;
        if (!target) return message.reply("❌ Birini etiketlemeli veya bir mesajı yanıtlamalısın!");
        try {
            await target.timeout(null);
            message.reply(`✅ **${target.user.tag}** susturması kaldırıldı.`);
        } catch (e) { message.reply("❌ İşlem başarısız."); }
    }

    // UNBAN (Sadece ID ile çalışır)
    if (command === 'unban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        const id = args[0];
        if (!id) return message.reply("❌ Yasak kaldırmak için bir ID yazmalısın.");
        try {
            await message.guild.members.unban(id);
            message.reply(`✅ ID: **${id}** olan kişinin yasağı kaldırıldı.`);
        } catch (e) { message.reply("❌ ID bulunamadı veya kişi yasaklı değil."); }
    }

    // LOCK & UNLOCK (Kişi bağımsız)
    if (command === 'lock') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
        message.reply("🔒 Kanal kilitlendi.");
    }

    if (command === 'unlock') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return;
        message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
        message.reply("🔓 Kanal açıldı.");
    }
});

client.login(process.env.TOKEN);
