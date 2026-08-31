const prisma = require('../lib/prisma');

// GET /api/analytics/community — Community-wide Eco Impact Analytics
const getCommunityAnalytics = async (req, res) => {
  try {
    const [txAgg, categoryBreakdown, userCount] = await Promise.all([
      prisma.dropOffTransaction.aggregate({
        where: { status: 'VALIDATED' },
        _sum: { weight_kg: true, points_awarded: true },
        _count: { id: true },
      }),
      prisma.dropOffTransaction.groupBy({
        by: ['waste_category_id'],
        where: { status: 'VALIDATED' },
        _sum: { weight_kg: true, points_awarded: true },
        _count: { id: true },
      }),
      prisma.user.count({ where: { role: 'CITIZEN' } }),
    ]);

    // Fetch waste category details
    const categoryIds = categoryBreakdown.map(c => c.waste_category_id);
    const categories = await prisma.wasteCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

    const totalWeightKg = Math.round((txAgg._sum.weight_kg || 0) * 10) / 10;
    const totalPoints = txAgg._sum.points_awarded || 0;
    const totalTransactions = txAgg._count.id || 0;

    // Environmental Impact Equivalents
    const carbonSavedKg = Math.round(totalWeightKg * 1.2 * 10) / 10;
    const plasticSavedKg = Math.round(totalWeightKg * 0.8 * 10) / 10;
    const treesSaved = Math.max(1, Math.round(totalWeightKg * 0.15 * 10) / 10);
    const biofuelProducedLiters = Math.round(totalWeightKg * 0.4 * 10) / 10;

    const breakdown = categoryBreakdown.map(c => ({
      category_name: categoryMap[c.waste_category_id] || 'Lainnya',
      weight_kg: Math.round((c._sum.weight_kg || 0) * 10) / 10,
      points_awarded: c._sum.points_awarded || 0,
      transaction_count: c._count.id || 0,
    }));

    res.json({
      success: true,
      data: {
        total_citizens: userCount,
        total_weight_kg: totalWeightKg,
        total_points_awarded: totalPoints,
        total_transactions: totalTransactions,
        impact_equivalents: {
          carbon_saved_kg: carbonSavedKg,
          plastic_saved_kg: plasticSavedKg,
          trees_saved: treesSaved,
          biofuel_liters: biofuelProducedLiters,
        },
        category_breakdown: breakdown,
      },
    });
  } catch (error) {
    console.error('Get community analytics error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/analytics/notifications — User Notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Generate dynamic notifications from actual user events (transactions, orders, events)
    const [txs, orders, events] = await Promise.all([
      prisma.dropOffTransaction.findMany({
        where: { citizen_id: userId },
        include: { waste_category: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.order.findMany({
        where: { buyer_id: userId },
        include: { product: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.eventParticipant.findMany({
        where: { citizen_id: userId },
        include: { event: { select: { title: true, reward_points: true } } },
        orderBy: { joined_at: 'desc' },
        take: 5,
      }),
    ]);

    const notifications = [];

    txs.forEach(t => {
      notifications.push({
        id: `tx-${t.id}`,
        title: t.status === 'VALIDATED' ? '🎉 Setoran Sampah Tervalidasi' : '⏳ Setoran Sampah Menunggu',
        message: t.status === 'VALIDATED'
          ? `Setoran ${t.weight_kg} kg ${t.waste_category?.name} divalidasi. Anda mendapatkan +${t.points_awarded} Eco-Points!`
          : `Setoran ${t.weight_kg} kg ${t.waste_category?.name} sedang diverifikasi oleh Admin RW.`,
        type: t.status === 'VALIDATED' ? 'success' : 'info',
        created_at: t.created_at,
        is_read: false,
      });
    });

    orders.forEach(o => {
      notifications.push({
        id: `ord-${o.id}`,
        title: '🛒 Pesanan Marketplace Berhasil',
        message: `Pembelian ${o.product?.name} berhasil! Diskon ${o.points_used} pts diterapkan.`,
        type: 'success',
        created_at: o.created_at,
        is_read: true,
      });
    });

    events.forEach(e => {
      notifications.push({
        id: `ev-${e.id}`,
        title: e.status === 'ATTENDED' ? '🏆 Presensi Event Berhasil' : '🤝 Terdaftar Event',
        message: e.status === 'ATTENDED'
          ? `Presensi di "${e.event?.title}" dikonfirmasi! Bonus +${e.event?.reward_points} pts dikreditkan.`
          : `Anda berhasil RSVP di "${e.event?.title}". QR Tiket presensi siap di tunjukkan.`,
        type: 'info',
        created_at: e.created_at,
        is_read: false,
      });
    });

    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      success: true,
      data: {
        unread_count: notifications.filter(n => !n.is_read).length,
        notifications: notifications.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getCommunityAnalytics, getNotifications };

