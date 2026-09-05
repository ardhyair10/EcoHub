const prisma = require('../lib/prisma');

// GET /api/users/me — Profil user sendiri
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        eco_points: true,
        qr_code_id: true,
        is_verified: true,
        created_at: true,
        _count: {
          select: { transactions_as_citizen: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/users/by-qr/:qr_code_id — Admin lookup user by QR
const getUserByQr = async (req, res) => {
  try {
    const { qr_code_id } = req.params;

    const user = await prisma.user.findUnique({
      where: { qr_code_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        eco_points: true,
        qr_code_id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan dengan QR ini' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by QR error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/users/search?q=... — Admin search user by name/email/id
const searchUser = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Minimal 2 karakter untuk pencarian' });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { id: { contains: q, mode: 'insensitive' } },
          { qr_code_id: { contains: q, mode: 'insensitive' } },
        ],
        role: 'CITIZEN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        eco_points: true,
        qr_code_id: true,
      },
      take: 10,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/users/citizens — Admin: daftar semua warga
const getCitizens = async (req, res) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      role: 'CITIZEN',
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };
    
    const [citizens, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          eco_points: true,
          qr_code_id: true,
          created_at: true,
          _count: { select: { transactions_as_citizen: true } },
          transactions_as_citizen: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: { created_at: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);
    
    const data = citizens.map(c => ({
      ...c,
      last_transaction: c.transactions_as_citizen[0]?.created_at || null,
      transactions_as_citizen: undefined,
    }));
    
    res.json({
      success: true,
      data: {
        citizens: data,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get citizens error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/users/citizens/:id — Admin: detail warga + transaksi terakhir
const getCitizenDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const citizen = await prisma.user.findUnique({
      where: { id, role: 'CITIZEN' },
      select: {
        id: true,
        name: true,
        email: true,
        eco_points: true,
        qr_code_id: true,
        created_at: true,
        _count: { select: { transactions_as_citizen: true } },
        transactions_as_citizen: {
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            waste_category: { select: { name: true, icon_url: true } },
            admin: { select: { name: true } },
          },
        },
      },
    });
    
    if (!citizen) {
      return res.status(404).json({ success: false, message: 'Warga tidak ditemukan' });
    }
    
    res.json({ success: true, data: citizen });
  } catch (error) {
    console.error('Get citizen detail error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getMe, getUserByQr, searchUser, getCitizens, getCitizenDetail };
