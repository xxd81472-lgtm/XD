const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Sistem Aktif! 2 Mesajlı (%50 şans) ve Optimize Hız Modu Çalışıyor.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelIdsRaw = process.env.CHANNEL_IDS || process.env.CHANNEL_İDS;
const msgs = [
    process.env.MESSAGE1, 
    process.env.MESSAGE2
];

// Hata Kontrolü
if (!tokensRaw || !channelIdsRaw || !msgs[0] || !msgs[1]) {
    console.error("HATA: TOKENS, CHANNEL_IDS, MESSAGE1 veya MESSAGE2 eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());
    const channelList = channelIdsRaw.split(",").map(c => c.trim());

    // --- OPTİMİZE HIZ AYARLARI ---
    const cycleTime = 9000;    // Her bot 9 saniyede bir mesaj atar (Ban riskini azaltır)
    const staggerDelay = 600;  // Botlar arası 0.6 saniye boşluk bırakır
    // ----------------------------

    console.log(`${tokenList.length} bot için optimize edilmiş döngü başlatıldı.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk Tetikleme
            sendToChannels(token, index + 1, channelList, msgs);

            // Periyodik Döngü
            setInterval(() => {
                sendToChannels(token, index + 1, channelList, msgs);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Sisteme girdi.`);
        }, initialOffset);
    });
}

// Mesaj Gönderme Fonksiyonu
async function sendToChannels(token, botNum, channels, messages) {
    // 2 mesaj arasından rastgele seçim (%50 şans)
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    for (const channelId of channels) {
        try {
            await axios.post(
                `https://discord.com/api/v9/channels/${channelId}/messages`,
                { content: randomMsg },
                { headers: { Authorization: token } }
            );
            console.log(`[Bot ${botNum}] Başarılı -> Mesaj: ${randomMsg.substring(0,10)}...`);
        } catch (err) {
            if (err.response?.status === 429) {
                console.error(`[Bot ${botNum}] ⚠️ Hız Sınırı!`);
            } else {
                console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
            }
        }
    }
}
