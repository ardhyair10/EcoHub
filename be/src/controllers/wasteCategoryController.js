const prisma = require('../lib/prisma');

// GET /api/waste-categories — semua kategori sampah (publik)
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.wasteCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/waste-categories — tambah kategori baru (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, point_per_kg, description, icon_url } = req.body;

    if (!name || !point_per_kg) {
      return res.status(400).json({ success: false, message: 'Nama dan poin per kg wajib diisi' });
    }

    const existing = await prisma.wasteCategory.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Kategori dengan nama ini sudah ada' });
    }

    const category = await prisma.wasteCategory.create({
      data: { name, point_per_kg: parseInt(point_per_kg), description, icon_url },
    });

    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data: category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getAllCategories, createCategory };
