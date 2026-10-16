export default async function handler(req, res) {
    const API_KEY = "$2a$10$wGWaV.o5hAXIdAaG15anoeZwwzWewrvSjFCL//FVbtxsOCs.MRvYW";
    const BIN_ID = "6acda745ac6210605a2c6007";
    const FONNTE_TOKEN = "vFr5GcNUVYNdrhBHL3Jj";
    const TARGET_WHATSAPP = "6281549506621";

    try {
        // 1. Ambil data jadwal dari JSONBin
        const binResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const binResult = await binResponse.json();
        const jadwalList = binResult.record.jadwal || [];

        // 2. Dapatkan waktu saat ini dalam zona waktu WITA (UTC +8)
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const witaTime = new Date(utc + (3600000 * 8));
        
        const year = witaTime.getFullYear();
        const month = String(witaTime.getMonth() + 1).padStart(2, '0');
        const day = String(witaTime.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;
        
        const hours = String(witaTime.getHours()).padStart(2, '0');
        const minutes = String(witaTime.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hours}:${minutes}`;

        let sentCount = 0;

        // 3. Cek apakah ada jadwal yang waktunya sama persis dengan detik ini
        for (const ev of jadwalList) {
            if (ev.type !== 'proyek' && ev.time && ev.time.includes(' - ')) {
                const parts = ev.time.split(' - ');
                const startTime = parts[0].trim();

                // Cocokkan tanggal dan jam mulai
                if (ev.date === currentDateStr && currentTimeStr === startTime) {
                    const message = `🔔 *PENGINGAT AGENDA PRIBADI (AUTO-SERVER)*\n\n` +
                                    `Halo Tandy, waktunya menjalankan kegiatan:\n` +
                                    `📌 *${ev.title}*\n` +
                                    `📂 Kategori: ${ev.category}\n` +
                                    `⏰ Pukul: ${ev.time} WITA\n\n` +
                                    `_Pesan otomatis dari Sistem Cloud Vercel._`;

                    const formData = new URLSearchParams();
                    formData.append('target', TARGET_WHATSAPP);
                    formData.append('message', message);
                    formData.append('countryCode', '62');

                    // Kirim ke Fonnte
                    await fetch('https://api.fonnte.com/send', {
                        method: 'POST',
                        headers: { 'Authorization': FONNTE_TOKEN },
                        body: formData
                    });
                    sentCount++;
                }
            }
        }

        return res.status(200).json({ success: true, message: `Checked successfully. Sent ${sentCount} notifications.` });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
