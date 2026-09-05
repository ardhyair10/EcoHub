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

// POST /api/orders/bulk — Checkout keranjang (multi-item)
const createBulkOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { items } = req.body; // items = [{ product_id, quantity, points_used }]
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Keranjang kosong' });
    }

    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    let totalPointsToDeduct = 0;
    
    // Fetch all products
    const productIds = items.map(i => i.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = {};
    products.forEach(p => productMap[p.id] = p);

    const transactionOperations = [];
    const createdOrdersData = [];

    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product || !product.is_active) {
        return res.status(404).json({ success: false, message: `Produk dengan ID ${item.product_id} tidak ditemukan atau tidak aktif` });
      }
      
      const qty = parseInt(item.quantity) || 1;
      if (product.stock < qty) {
        return res.status(400).json({ success: false, message: `Stok tidak mencukupi untuk ${product.name}` });
      }
      
      const requestedPoints = parseInt(item.points_used) || 0;
      // We will re-validate points globally later, but limit per product first
      const pointsUsed = Math.min(requestedPoints, product.max_point_discount);
      totalPointsToDeduct += pointsUsed;

      const totalPrice = product.price_idr * qty;
      const finalPrice = Math.max(0, totalPrice - pointsUsed);
      
      createdOrdersData.push({
        buyer_id: buyerId,
        product_id: product.id,
        quantity: qty,
        points_used: pointsUsed,
        final_price_idr: finalPrice,
      });

      // Reduce stock operation
      transactionOperations.push(
        prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qty } },
        })
      );
    }

    if (buyer.eco_points < totalPointsToDeduct) {
      return res.status(400).json({ success: false, message: 'Poin Anda tidak mencukupi untuk total pesanan ini' });
    }

    // Add create order operations
    transactionOperations.unshift(
      prisma.order.createMany({
        data: createdOrdersData
      })
    );

    // Deduct user points operation
    transactionOperations.push(
      prisma.user.update({
        where: { id: buyerId },
        data: { eco_points: { decrement: totalPointsToDeduct } },
      })
    );

    // Execute everything in a single transaction
    await prisma.$transaction(transactionOperations);

    res.status(201).json({
      success: true,
      message: `Pesanan berhasil! Diskon total ${totalPointsToDeduct} poin diterapkan.`,
    });
  } catch (error) {
    console.error('Create bulk order error:', error);
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

// POST /api/orders/:id/pay — Simulasi pembayaran
const payOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    if (order.buyer_id !== buyerId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Pesanan sudah dibayar atau dibatalkan' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'PAID' }
    });

    res.json({ success: true, message: 'Pembayaran berhasil!', data: updatedOrder });
  } catch (error) {
    console.error('Pay order error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/orders/:id/cancel — Batalkan pesanan
const cancelOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    if (order.buyer_id !== buyerId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Hanya pesanan menunggu bayar yang bisa dibatalkan' });
    }

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: 'CANCELLED' }
      }),
      prisma.product.update({
        where: { id: order.product_id },
        data: { stock: { increment: order.quantity } }
      }),
      prisma.user.update({
        where: { id: buyerId },
        data: { eco_points: { increment: order.points_used } }
      })
    ]);

    res.json({ success: true, message: 'Pesanan berhasil dibatalkan, poin dikembalikan!', data: updatedOrder });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/orders/:id/complete — Selesaikan pesanan
const completeOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    if (order.buyer_id !== buyerId) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    if (order.status !== 'PAID') {
      return res.status(400).json({ success: false, message: 'Pesanan belum dibayar atau sudah selesai' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });

    res.json({ success: true, message: 'Pesanan selesai!', data: updatedOrder });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { createOrder, getMyOrders, createBulkOrder, payOrder, cancelOrder, completeOrder };
