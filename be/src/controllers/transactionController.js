const prisma = require('../lib/prisma');

// POST /api/transactions — Admin input transaksi baru
const createTransaction = async (req, res) => {
  try {
    const adminId = req.user.id; // dari JWT
    const { citizen_id, waste_category_id, weight_kg, notes, photo_url, status = 'VALIDATED' } = req.body;

    if (!citizen_id || !waste_category_id || !weight_kg) {
      return res.status(400).json({
        success: false,
        message: 'citizen_id, waste_category_id, dan weight_kg wajib diisi',
      });
    }

    if (parseFloat(weight_kg) <= 0) {
      return res.status(400).json({ success: false, message: 'Berat harus lebih dari 0 kg' });
    }

    // Cek citizen ada
    const citizen = await prisma.user.findUnique({ where: { id: citizen_id } });
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Cek kategori ada
    const category = await prisma.wasteCategory.findUnique({ where: { id: waste_category_id } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori sampah tidak ditemukan' });
    }

    const parsedWeight = parseFloat(weight_kg);
    const pointsAwarded = Math.round(parsedWeight * category.point_per_kg);

    let transaction;

    if (status === 'PENDING') {
      // Create without points increment
      transaction = await prisma.dropOffTransaction.create({
        data: {
          citizen_id,
          admin_id: adminId,
          waste_category_id,
          weight_kg: parsedWeight,
          points_awarded: pointsAwarded,
          notes: notes || null,
          photo_url: photo_url || null,
          status: 'PENDING',
        },
        include: {
          citizen: { select: { id: true, name: true, email: true } },
          waste_category: true,
          admin: { select: { id: true, name: true } },
        },
      });

      return res.status(201).json({
        success: true,
        message: `Transaksi pending dibuat untuk ${citizen.name}.`,
        data: transaction,
      });
    }

    // Buat transaksi & update poin dalam 1 transaction Prisma
    const [created] = await prisma.$transaction([
      prisma.dropOffTransaction.create({
        data: {
          citizen_id,
          admin_id: adminId,
          waste_category_id,
          weight_kg: parsedWeight,
          points_awarded: pointsAwarded,
          notes: notes || null,
          photo_url: photo_url || null,
          status: 'VALIDATED',
        },
        include: {
          citizen: { select: { id: true, name: true, email: true } },
          waste_category: true,
          admin: { select: { id: true, name: true } },
        },
      }),
      prisma.user.update({
        where: { id: citizen_id },
        data: { eco_points: { increment: pointsAwarded } },
      }),
    ]);
    
    transaction = created;

    res.status(201).json({
      success: true,
      message: `Transaksi berhasil! ${citizen.name} mendapatkan ${pointsAwarded} Eco-Points.`,
      data: transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/transactions/my — Riwayat transaksi milik user yang login
const getMyTransactions = async (req, res) => {
  try {
    const citizenId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.dropOffTransaction.findMany({
        where: { citizen_id: citizenId },
        include: {
          waste_category: { select: { name: true, icon_url: true, point_per_kg: true } },
          admin: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.dropOffTransaction.count({ where: { citizen_id: citizenId } }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/transactions — Admin lihat semua transaksi
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, citizen_id, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (citizen_id) where.citizen_id = citizen_id;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.dropOffTransaction.findMany({
        where,
        include: {
          citizen: { select: { id: true, name: true, email: true } },
          waste_category: { select: { name: true, icon_url: true, point_per_kg: true } },
          admin: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.dropOffTransaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PATCH /api/transactions/:id/validate — Admin validates a pending transaction
const validateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.dropOffTransaction.findUnique({
      where: { id },
      include: { citizen: true, waste_category: true },
    });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }
    
    if (transaction.status === 'VALIDATED') {
      return res.status(400).json({ success: false, message: 'Transaksi sudah divalidasi' });
    }
    
    // Update status and credit points atomically
    const [updated] = await prisma.$transaction([
      prisma.dropOffTransaction.update({
        where: { id },
        data: { status: 'VALIDATED' },
        include: {
          citizen: { select: { id: true, name: true, email: true } },
          waste_category: true,
          admin: { select: { id: true, name: true } },
        },
      }),
      prisma.user.update({
        where: { id: transaction.citizen_id },
        data: { eco_points: { increment: transaction.points_awarded } },
      }),
    ]);
    
    res.json({
      success: true,
      message: `Transaksi tervalidasi! ${transaction.citizen.name} mendapatkan ${transaction.points_awarded} Eco-Points.`,
      data: updated,
    });
  } catch (error) {
    console.error('Validate transaction error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { createTransaction, getMyTransactions, getAllTransactions, validateTransaction };
