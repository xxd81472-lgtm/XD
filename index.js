const express = require('express');
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("17 Botluk Sistem Aktif: 5 Saniye Döngü ve 2 Mesaj Modu.");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif.`);
});

// Render Environment Variables
const tokensRaw = process.env.TOKENS; 
const channelId = process.env.CHANNEL_ID;
const msgs = [process.env.MESSAGE1, process.env.MESSAGE2];

if (!tokensRaw || !channelId || !msgs[0] || !msgs[1]) {
    console.error("HATA: TOKENS, CHANNEL_ID, MESSAGE1 veya MESSAGE2 eksik!");
} else {
    const tokenList = tokensRaw.split(",").map(t => t.trim());

    // AYARLAR
    const cycleTime = 5000; // Her hesap 5 saniyede bir atar
    const staggerDelay = cycleTime / tokenList.length; // Hesaplar arası ~294ms kaydırma

    console.log(`${tokenList.length} bot için 2 mesajlı sistem başlatıldı.`);

    tokenList.forEach((token, index) => {
        const initialOffset = index * staggerDelay;

        setTimeout(() => {
            // İlk Mesaj
            sendRequest(token, index + 1);

            // 5 Saniyelik Döngü
            setInterval(() => {
                sendRequest(token, index + 1);
            }, cycleTime);

            console.log(`[Bot ${index + 1}] Döngüye girdi.`);
        }, initialOffset);
    });
}

function sendRequest(token, botNum) {
    // Sadece MESSAGE1 ve MESSAGE2 arasından rastgele seçim
    const content = msgs[Math.floor(Math.random() * msgs.length)];

    axios.post(`https://discord.com/api/v9/channels/${channelId}/messages`, 
    { content: content }, 
    {
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        }
    })
    .then(() => {
        console.log(`[Bot ${botNum}] ✅ Gönderildi: ${content.substring(0,10)}...`);
    })
    .catch((err) => {
        if (err.response?.status === 429) {
            console.error(`[Bot ${botNum}] ⚠️ Hız Sınırı!`);
        } else {
            console.error(`[Bot ${botNum}] ❌ Hata: ${err.response?.status}`);
        }
    });
}
