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
