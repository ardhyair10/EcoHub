const prisma = require('../lib/prisma');

// GET /api/products — Daftar produk aktif
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = {
      is_active: true,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          seller: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where: whereClause }),
    ]);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/products/:id — Detail produk
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true } },
      },
    });
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/products — Buat produk baru (B2B/Admin)
const createProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const {
      name, description, price_idr, max_point_discount,
      eco_badge_desc, image_url, stock,
      carbon_saved_kg, plastic_saved_kg, impact_desc,
    } = req.body;
    
    if (!name || !description || !price_idr) {
      return res.status(400).json({ success: false, message: 'Nama, deskripsi, dan harga wajib diisi' });
    }
    
    const product = await prisma.product.create({
      data: {
        seller_id: sellerId,
        name,
        description,
        price_idr: parseInt(price_idr),
        max_point_discount: parseInt(max_point_discount) || 0,
        eco_badge_desc: eco_badge_desc || null,
        image_url: image_url || null,
        stock: parseInt(stock) || 0,
        carbon_saved_kg: carbon_saved_kg ? parseFloat(carbon_saved_kg) : null,
        plastic_saved_kg: plastic_saved_kg ? parseFloat(plastic_saved_kg) : null,
        impact_desc: impact_desc || null,
      },
      include: {
        seller: { select: { id: true, name: true } },
      },
    });
    
    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PATCH /api/products/:id — Update produk
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    if (existing.seller_id !== sellerId && req.user.role !== 'ADMIN_RW') {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses untuk mengubah produk ini' });
    }
    
    const updateData = {};
    const fields = ['name', 'description', 'price_idr', 'max_point_discount', 'eco_badge_desc', 'image_url', 'stock', 'is_active', 'carbon_saved_kg', 'plastic_saved_kg', 'impact_desc'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['price_idr', 'max_point_discount', 'stock'].includes(field)) {
          updateData[field] = parseInt(req.body[field]);
        } else if (['carbon_saved_kg', 'plastic_saved_kg'].includes(field)) {
          updateData[field] = req.body[field] ? parseFloat(req.body[field]) : null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    });
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { seller: { select: { id: true, name: true } } },
    });
    
    res.json({ success: true, message: 'Produk berhasil diperbarui', data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct };
