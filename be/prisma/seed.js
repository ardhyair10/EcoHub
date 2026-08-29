require('dotenv').config();
const prisma = require('../src/lib/prisma');

const wasteCategories = [
  {
    name: 'Plastik PET',
    point_per_kg: 150,
    description: 'Botol minuman plastik bening (kode 1), sangat tinggi nilai daur ulangnya.',
    icon_url: null,
  },
  {
    name: 'Plastik HDPE',
    point_per_kg: 120,
    description: 'Jerigen, botol shampo, ember plastik (kode 2).',
    icon_url: null,
  },
  {
    name: 'Kardus / Kertas',
    point_per_kg: 80,
    description: 'Karton, dus bekas, koran, dan majalah bekas.',
    icon_url: null,
  },
  {
    name: 'Besi / Logam',
    point_per_kg: 250,
    description: 'Besi, aluminium, kaleng, dan logam campuran lainnya.',
    icon_url: null,
  },
  {
    name: 'Kaca / Botol',
    point_per_kg: 60,
    description: 'Botol kaca, pecahan kaca, dan gelas kaca.',
    icon_url: null,
  },
  {
    name: 'Elektronik (e-Waste)',
    point_per_kg: 400,
    description: 'Perangkat elektronik bekas yang mengandung komponen berharga.',
    icon_url: null,
  },
  {
    name: 'Minyak Jelantah',
    point_per_kg: 200,
    description: 'Minyak goreng bekas yang dapat diolah menjadi biodiesel.',
    icon_url: null,
  },
];

async function main() {
  console.log('🌱 Seeding waste categories...');

  for (const category of wasteCategories) {
    const existing = await prisma.wasteCategory.findUnique({
      where: { name: category.name },
    });

    if (!existing) {
      await prisma.wasteCategory.create({ data: category });
      console.log(`  ✅ Created: ${category.name} (${category.point_per_kg} pts/kg)`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${category.name}`);
    }
  }

  // Seed sample products
  console.log('\n🛍️ Seeding sample products...');
  
  // Find or create a B2B seller for products
  const bcrypt = require('bcryptjs');
  let seller = await prisma.user.findFirst({ where: { role: 'B2B_BUYER' } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        name: 'Ricki Gilang Saputra',
        email: 'ricki@ecohub.id',
        password_hash: await bcrypt.hash('ecoshop123', 10),
        role: 'B2B_BUYER',
        is_verified: true,
      },
    });
    console.log('  ✅ Created B2B seller: Ricki Gilang Saputra');
  }
  
  const sampleProducts = [
    {
      name: 'Tas Belanja Daur Ulang',
      description: 'Tas belanja kuat dan tahan lama yang dibuat dari 100% bahan plastik daur ulang. Cocok untuk belanja harian dan ramah lingkungan.',
      price_idr: 45000,
      max_point_discount: 200,
      eco_badge_desc: 'Menghemat 2kg plastik dari lautan',
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      stock: 50,
      carbon_saved_kg: 1.5,
      plastic_saved_kg: 2.0,
      impact_desc: 'Setara menyelamatkan 40 botol plastik dari tempat pembuangan',
    },
    {
      name: 'Pupuk Kompos Organik 5kg',
      description: 'Pupuk kompos premium dari sampah organik daur ulang. Ideal untuk tanaman hias dan kebun rumah.',
      price_idr: 35000,
      max_point_discount: 150,
      eco_badge_desc: 'Mengurangi 5kg sampah organik',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
      stock: 100,
      carbon_saved_kg: 3.0,
      plastic_saved_kg: 0,
      impact_desc: 'Setara mengubah 5kg sampah menjadi nutrisi tanah',
    },
    {
      name: 'Notebook Kertas Daur Ulang',
      description: 'Notebook 100 halaman dari kertas daur ulang 100%. Cover dari kardus bekas yang di-upcycle.',
      price_idr: 25000,
      max_point_discount: 100,
      eco_badge_desc: 'Menghemat 1 pohon dari penebangan',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      stock: 200,
      carbon_saved_kg: 0.8,
      plastic_saved_kg: 0,
      impact_desc: 'Setara menyelamatkan 1 pohon kecil dari penebangan',
    },
    {
      name: 'Botol Minum Eco-Tumbler Stainless',
      description: 'Tumbler air minum stainless tahan dingin & panas 12 jam. Desain ergonomis dan ramah lingkungan.',
      price_idr: 75000,
      max_point_discount: 300,
      eco_badge_desc: 'Gantikan 500 botol sekali pakai',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      stock: 40,
      carbon_saved_kg: 4.5,
      plastic_saved_kg: 5.0,
      impact_desc: 'Mengurangi sampah plastik botol sekali pakai selama setahun penuh',
    },
    {
      name: 'Lampu Hias Meja Kayu Upcycle',
      description: 'Lampu meja estetis dengan kerangka buatan tangan dari limbah kayu peti kemas dan bohlam LED hemat energi.',
      price_idr: 120000,
      max_point_discount: 450,
      eco_badge_desc: '100% Limbah Kayu Peti Kemas',
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
      stock: 15,
      carbon_saved_kg: 6.0,
      plastic_saved_kg: 0,
      impact_desc: 'Menghemat limbah kayu furnitur bekas dari pembakaran terbuka',
    },
    {
      name: 'Dompet Koin Kain Perca Etnik',
      description: 'Dompet koin unik berbahan dasar kain perca batik/etnik yang di-upcycle secara kreatif.',
      price_idr: 20000,
      max_point_discount: 80,
      eco_badge_desc: 'Kain Perca Konveksi Upcycle',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      stock: 80,
      carbon_saved_kg: 0.5,
      plastic_saved_kg: 0.2,
      impact_desc: 'Mengubah sisa potongan konveksi menjadi aksesoris berguna',
    },
    {
      name: 'Pot Kaca Terarium Botol Bekas',
      description: 'Pot tanaman sukulen/hias berbahan potongan botol kaca kecap atau sirup yang di-upcycle rapi.',
      price_idr: 30000,
      max_point_discount: 120,
      eco_badge_desc: 'Daur Ulang Botol Kaca Kecap',
      image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
      stock: 35,
      carbon_saved_kg: 1.2,
      plastic_saved_kg: 0,
      impact_desc: 'Menyelamatkan botol kaca bekas agar tidak menumpuk di TPA',
    },
    {
      name: 'Sedotan Bambu Organik (Set 4 Pcs + Sikat)',
      description: 'Set sedotan ramah lingkungan dari bambu alami, dapat dicuci dan dipakai berulang kali. Dilengkapi sikat pembersih khusus.',
      price_idr: 18000,
      max_point_discount: 60,
      eco_badge_desc: '100% Bambu Alami Biodegradable',
      image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
      stock: 120,
      carbon_saved_kg: 0.7,
      plastic_saved_kg: 1.0,
      impact_desc: 'Menggantikan lebih dari 300 sedotan plastik sekali pakai',
    },
  ];
  
  for (const product of sampleProducts) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (!existing) {
      await prisma.product.create({
        data: { ...product, seller_id: seller.id },
      });
      console.log(`  ✅ Created product: ${product.name}`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${product.name}`);
    }
  }

  // Seed sample events
  console.log('\n🤝 Seeding sample events...');
  const sampleEvents = [
    {
      title: 'Aksi Bersih RW 05 & Pilah Sampah Plastik',
      description: 'Kegiatan gotong royong membersihkan lingkungan RW 05 sekaligus edukasi cara memilah plastik PET dan HDPE agar memiliki nilai daur ulang maksimal.',
      location: 'Balai Warga RW 05',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      reward_points: 100,
      banner_url: null,
      max_attendees: 50,
    },
    {
      title: 'Workshop Pengolahan Minyak Jelantah Jadi Biodiesel',
      description: 'Pelatihan praktis bersama ahli daur ulang untuk mengolah minyak goreng bekas menjadi energi terbarukan ramah lingkungan.',
      location: 'Posyandu Terpadu RT 03',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      reward_points: 150,
      banner_url: null,
      max_attendees: 30,
    },
  ];

  for (const ev of sampleEvents) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title } });
    if (!existing) {
      await prisma.event.create({ data: ev });
      console.log(`  ✅ Created event: ${ev.title}`);
    } else {
      console.log(`  ⏭️  Skipped (already exists): ${ev.title}`);
    }
  }

  console.log('\n✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
