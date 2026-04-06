const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const prefix = "."; // İstediğin prefixi yapabilirsin

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // HEDEF BELİRLEME FONKSİYONU (Etiket veya Yanıtlanan Kişi)
    const getTarget = () => {
        // Önce etiketlenen var mı bak, yoksa yanıtlanan mesajın sahibini al
        return message.mentions.members.first() || (message.reference ? message.channel.messages.cache.get(message.reference.messageId)?.member : null);
    };

    const target = getTarget();

    // BAN KOMUTU
    if (command === 'ban') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        if (!target) return message.reply("❌ Birini etiketlemeli veya bir mesajı yanıtlamalısın!");
        
        try {
            await target.ban({ reason: `${message.author.tag} tarafından yasaklandı.` });
            message.reply(`✅ **${target.user.tag}** başarıyla yasaklandı.`);
        } catch (err) {
            message.reply("❌ Bu kişiyi yasaklayamıyorum (Yetkim yetmiyor olabilir).");
        }
    }

    // KICK KOMUTU
    if (command === 'kick') {
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;
        if (!target) return message.reply("❌ Birini etiketlemeli veya bir mesajı yanıtlamalısın!");

        try {
            await target.kick();
            message.reply(`✅ **${target.user.tag}** sunucudan atıldı.`);
        } catch (err)
