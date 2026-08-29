const prisma = require('../lib/prisma');

// POST /api/chat — Educational Smart CS Assistant for EcoHub
const processChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
    }
    
    const query = message.trim().toLowerCase();
    let reply = '';
    
    // Live DB Queries for specific topics
    if (query.includes('produk') || query.includes('katalog') || query.includes('barang') || query.includes('jual')) {
      const products = await prisma.product.findMany({
        where: { is_active: true },
        select: { name: true, price_idr: true, max_point_discount: true, eco_badge_desc: true },
        take: 5,
      });
      if (products.length > 0) {
        const productList = products
          .map(p => `- **${p.name}**: Rp ${p.price_idr.toLocaleString('id-ID')} (Diskon max ${p.max_point_discount} pts)\n  *${p.eco_badge_desc || 'Produk Upcycle Ramah Lingkungan'}*`)
          .join('\n');
        reply = `🛍️ **Katalog Produk Eco Marketplace Terbaru**:\n\n${productList}\n\n*Penjual Resmi*: Ricki Gilang Saputra\n\nKamu bisa menukarkan Eco-Points di halaman **Marketplace** untuk mendapatkan potongan harga!`;
      }
    } else if (query.includes('pos') || query.includes('lokasi') || query.includes('jadwal') || query.includes('buka') || query.includes('timbang')) {
      reply = `📍 **Lokasi & Jadwal Pos Penimbangan Sampah EcoHub**:\n\n- **Lokasi**: Balai Warga RW 05 (Pos RW Digital)\n- **Jadwal Penimbangan**: Setiap **Sabtu & Minggu** (Pkl 08.00 - 12.00 WIB)\n- **Penanggung Jawab**: Ricki Gilang Saputra, S.T. & Tim Admin RW\n\n*Cara*: Cukup bawa sampah daur ulangmu dan tunjukkan QR Code dari Dashboard ke Admin RW saat penimbangan!`;
    } else if (query.includes('sertifikat') || query.includes('ttd') || query.includes('tanda tangan') || query.includes('ricki')) {
      reply = `📜 **Sertifikat Kontribusi Eco-Impact**:\n\n- **Diberikan Kepada**: Warga yang aktif melakukan daur ulang & kegiatan komunitas.\n- **Penandatangan Resmi**: **Ricki Gilang Saputra, S.T.** (Ketua Program Ekonomi Sirkular Eco Hub).\n- **Fitur Sertifikat**: Dilengkapi **QR Code Verifikasi Keaslian**, Cap Stempel Basah Digital RW 05, dan dapat diunduh langsung sebagai **File PDF A4 Landscape**.\n\n*Akses*: Klik tombol **"Sertifikat Impact"** di Dashboard warga!`;
    } else if (query.includes('badge') || query.includes('lencana') || query.includes('prestasi') || query.includes('peringkat') || query.includes('leaderboard')) {
      reply = `🏆 **Sistem Gamifikasi, Badge & Leaderboard**:\n\nKamu bisa membuka 6 Badge Pencapaian:\n- 🌱 **Pemula Eco**: Pertama kali melakukan setoran sampah\n- ♻️ **Rajin Daur Ulang**: Mencapai ≥10 total transaksi\n- 🏆 **Eco Champion**: Mencapai ≥500 total poin\n- ⭐ **Bintang Bulan**: Masuk Top 3 di Leaderboard RW bulan ini\n- 🔥 **Streak Master**: Aktif 4 minggu berturut-turut\n- 💎 **Eco Legend**: Mencapai ≥2000 total poin\n\n*Tips*: Kejar target **500 poin/bulan** untuk tampil di Podium Leaderboard RW!`;
    } else if (query.includes('plastik') || query.includes('pet') || query.includes('hdpe') || query.includes('botol')) {
      reply = `♻️ **Kategori Sampah Plastik**:\n\n- **Plastik PET (Botol Bening)**: Bernilai **150 poin/kg**. Pastikan botol dikosongkan, dibilas, dan dikempeskan.\n- **Plastik HDPE (Jerigen/Botol Shampo)**: Bernilai **120 poin/kg**.\n\n*Tips Pemilahan*: Lepaskan label merek dan tutup botol secara terpisah agar nilai daur ulangnya maksimal!`;
    } else if (query.includes('minyak') || query.includes('jelantah') || query.includes('goreng')) {
      reply = `🍳 **Minyak Jelantah (200 Poin/kg)**:\n\n- **Nilai Poin**: **200 poin/kg**.\n- Jangan buang minyak bekas ke wastafel/selokan!\n- Tampung minyak jelantah dingin dalam botol plastik bening/jerigen.\n\n*Dampak*: Minyak jelantah yang disetorkan diolah kembali menjadi **Biodiesel ramah lingkungan**!`;
    } else if (query.includes('elektronik') || query.includes('ewaste') || query.includes('hp') || query.includes('kabel')) {
      reply = `🔌 **Elektronik / e-Waste (400 Poin/kg)**:\n\n- **Nilai Poin Terbanyak**: **400 poin/kg**!\n- Menerima HP tua bekas, kabel charger, radio, dan komponen elektronik kecil.\n\n*Catatan*: Penanganan e-waste dilakukan khusus untuk mengekstraksi logam berharga secara aman dari lingkungan.`;
    } else if (query.includes('besi') || query.includes('logam') || query.includes('kaleng')) {
      reply = `⚙️ **Besi & Logam (250 Poin/kg)**:\n\n- **Nilai Poin**: **250 poin/kg**.\n- Menerima kaleng minuman aluminium, potongan besi rumah tangga, dan perabot logam bekas. Pastikan bebas dari oli berat.`;
    } else if (query.includes('kardus') || query.includes('kertas') || query.includes('koran') || query.includes('dus')) {
      reply = `📦 **Kardus & Kertas (80 Poin/kg)**:\n\n- **Nilai Poin**: **80 poin/kg**.\n- Karton, dus bekas paket, koran, dan majalah.\n\n*Tips*: Lipat dus hingga pipih dan ikat rapi agar proses penimbangan di pos RW berjalan cepat.`;
    } else if (query.includes('event') || query.includes('kegiatan') || query.includes('volunteer') || query.includes('rsvp')) {
      reply = `🤝 **Volunteer Hub & Event Komunitas**:\n\n- Kamu dapat mendaftar kegiatan kerja bakti atau workshop daur ulang di menu **Events**.\n- Setelah mendaftar, kamu memperoleh **QR Tiket Presensi**.\n- Admin RW akan melakukan scan QR Tiket di lokasi kegiatan untuk memberikan **Bonus +100 Poin Event** ke akunmu!`;
    } else if (query.includes('poin') || query.includes('point') || query.includes('dapat berapa')) {
      reply = `🪙 **Daftar Lengkap Poin per Kg EcoHub**:\n\n1. 🔌 **Elektronik (e-Waste)**: 400 pts/kg\n2. ⚙️ **Besi & Logam**: 250 pts/kg\n3. 🍳 **Minyak Jelantah**: 200 pts/kg\n4. 🍾 **Plastik PET Bening**: 150 pts/kg\n5. 🧴 **Plastik HDPE**: 120 pts/kg\n6. 📦 **Kardus & Kertas**: 80 pts/kg\n7. 🍷 **Kaca & Botol**: 60 pts/kg\n\n*Catatan*: 1 Eco-Point = Potongan harga Rp 1 saat berbelanja di Eco Marketplace!`;
    } else if (query.includes('b2b') || query.includes('bulk') || query.includes('industri')) {
      reply = `🏢 **B2B Bulk Waste Hub**:\n\n- Fitur khusus **Mitra Industri & Admin RW** untuk memantau agregasi stok sampah yang terkumpul dari seluruh warga RW 05.\n- Industri daur ulang dapat mengajukan pembelian/penjemputan skala tonase langsung ke Admin RW!`;
    } else if (query.includes('target') || query.includes('bulanan')) {
      reply = `🎯 **Target Poin Bulanan (500 pts)**:\n\n- Setiap warga ditargetkan mengumpulkan **500 poin/bulan** dari setoran sampah.\n- Kemajuan target dapat dipantau langsung lewat **Progress Ring** di Dashboard warga!`;
    } else if (query.includes('halo') || query.includes('hi') || query.includes('selamat') || query.includes('pagi') || query.includes('siang') || query.includes('malam')) {
      reply = `🌱 **Halo! Selamat datang di AI Eco-Assistant EcoHub** 👋\n\nSaya asisten pintar yang siap membantu pertanyaanmu seputar Ekonomi Sirkular RW 05.\n\nKamu bisa menanyakan:\n- 📍 *Jadwal & Lokasi Pos Penimbangan*\n- 🪙 *Nilai poin jenis sampah (Minyak jelantah, Plastik, e-Waste)*\n- 📜 *Informasi Sertifikat Eco-Impact & Ricki Gilang Saputra*\n- 🛍️ *Katalog barang di Eco Marketplace*\n\nAda yang ingin kamu tanyakan hari ini?`;
    } else {
      reply = `🌱 **Informasi EcoHub Platform**:\n\nMaaf, saya belum sepenuhnya memahami pertanyaan tersebut. Namun berikut informasi cepat yang bisa kamu tanyakan:\n\n1. 📍 **Lokasi Pos**: *Balai Warga RW 05 (Sabtu & Minggu Pkl 08.00-12.00)*\n2. 🪙 **Poin Sampah**: *Plastik PET (150 pts/kg), Minyak Jelantah (200 pts/kg), e-Waste (400 pts/kg)*\n3. 📜 **Sertifikat Impact**: *Ditandatangani oleh Ricki Gilang Saputra, S.T. & dapat diunduh PDF*\n4. 🛍️ **Marketplace**: *Tukar poin untuk diskon belanja barang upcycle*\n\nSilakan ketik pertanyaan spesifik seputar daur ulang di atas!`;
    }
    
    res.json({
      success: true,
      data: {
        reply,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Process chat error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { processChat };
