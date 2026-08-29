const prisma = require('../lib/prisma');

// POST /api/orders — Checkout pesanan
const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { product_id, quantity = 1, points_used = 0 } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'product_id wajib diisi' });
    }
    
    const product = await prisma.product.findUnique({ where: { id: product_id } });
    if (!product || !product.is_active) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan atau tidak aktif' });
    }
    
    if (product.stock < parseInt(quantity)) {
      return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });
    }
    
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    const parsedPointsUsed = Math.min(parseInt(points_used), product.max_point_discount, buyer.eco_points);
    
    // 1 poin = Rp 1 discount (configurable)
    const pointDiscount = parsedPointsUsed;
    const totalPrice = product.price_idr * parseInt(quantity);
    const finalPrice = Math.max(0, totalPrice - pointDiscount);
    
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          buyer_id: buyerId,
          product_id,
          quantity: parseInt(quantity),
          points_used: parsedPointsUsed,
          final_price_idr: finalPrice,
        },
        include: {
          product: { select: { id: true, name: true, image_url: true, price_idr: true } },
        },
      }),
      prisma.user.update({
        where: { id: buyerId },
        data: { eco_points: { decrement: parsedPointsUsed } },
      }),
      prisma.product.update({
        where: { id: product_id },
        data: { stock: { decrement: parseInt(quantity) } },
      }),
    ]);
    
    res.status(201).json({
      success: true,
      message: `Pesanan berhasil! Diskon ${parsedPointsUsed} poin diterapkan.`,
      data: {
        ...order,
        original_price: totalPrice,
        point_discount: pointDiscount,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/orders/my — Riwayat pesanan user
const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyer_id: buyerId },
        include: {
          product: {
            select: { id: true, name: true, image_url: true, price_idr: true, eco_badge_desc: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where: { buyer_id: buyerId } }),
    ]);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { createOrder, getMyOrders };
