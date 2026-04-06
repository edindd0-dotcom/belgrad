const { Client, GatewayIntentBits, PermissionFlagsBits, Partials, ActivityType } = require('discord.js');
const http = require('http');

// 1. RENDER İÇİN PORT AÇMA (BOTUN KAPANMASINI ENGELLER)
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Belgrad Bot Aktif!');
});
server.listen(process.env.PORT || 3000, () => {
    console.log("==> [SİSTEM] Port açıldı.");
});

// 2. BOTU TANIMLA (İŞTE HATA ALDIĞIN YER BURASIYDI, ÖNCE BU OLMALI)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel]
});

// 3. BOT GİRİŞ YAPTIĞINDA
client.on('ready', () => {
    console.log(`✅ [BAŞARILI] ${client.user.tag} aktif!`);
});

// 4. BASİT BİR TEST KOMUTU (.ping)
client.on('messageCreate', async (message) => {
    if (message.content === '.ping') {
        message.reply('Pong! 🏓');
    }
});

// 5. GİRİŞ YAP (BU HER ZAMAN EN SONDA OLMALI)
if (!process.env.TOKEN) {
    console.error("❌ HATA: Render Environment Variables kısmına TOKEN eklememişsin!");
} else {
    client.login(process.env.TOKEN).catch(err => {
        console.error("❌ DISCORD HATASI:", err.message);
    });
}
