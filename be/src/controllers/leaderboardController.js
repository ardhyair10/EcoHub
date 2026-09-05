const prisma = require('../lib/prisma');

// GET /api/leaderboard — Top 20 users by points this month
const getLeaderboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 1);
    
    // Aggregate points from validated transactions this month
    const leaderboard = await prisma.dropOffTransaction.groupBy({
      by: ['citizen_id'],
      where: {
        created_at: { gte: startDate, lt: endDate },
        status: 'VALIDATED',
      },
      _sum: { weight_kg: true, points_awarded: true },
      _count: { id: true },
      orderBy: { _sum: { points_awarded: 'desc' } },
      take: 20,
    });
    
    // Fetch user details
    const userIds = leaderboard.map(l => l.citizen_id);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, eco_points: true },
    });
    
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    
    const data = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: userMap[entry.citizen_id] || { name: 'Unknown' },
      monthly_points: entry._sum.points_awarded || 0,
      monthly_weight_kg: Math.round((entry._sum.weight_kg || 0) * 100) / 100,
      transaction_count: entry._count.id || 0,
    }));
    
    res.json({
      success: true,
      data: {
        leaderboard: data,
        period: {
          month: targetMonth + 1,
          year: targetYear,
          label: new Date(targetYear, targetMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        },
      },
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/leaderboard/monthly-stats — Personal stats for current user
const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Get user's monthly stats
    const monthlyAgg = await prisma.dropOffTransaction.aggregate({
      where: {
        citizen_id: userId,
        created_at: { gte: startDate, lt: endDate },
        status: 'VALIDATED',
      },
      _sum: { points_awarded: true, weight_kg: true },
      _count: { id: true },
    });
    
    // Calculate user's rank this month
    const allMonthly = await prisma.dropOffTransaction.groupBy({
      by: ['citizen_id'],
      where: {
        created_at: { gte: startDate, lt: endDate },
        status: 'VALIDATED',
      },
      _sum: { points_awarded: true },
      orderBy: { _sum: { points_awarded: 'desc' } },
    });
    
    const rank = allMonthly.findIndex(e => e.citizen_id === userId) + 1;
    
    res.json({
      success: true,
      data: {
        monthly_points: monthlyAgg._sum.points_awarded || 0,
        monthly_weight_kg: Math.round((monthlyAgg._sum.weight_kg || 0) * 100) / 100,
        monthly_transactions: monthlyAgg._count.id || 0,
        rank: rank || null,
        total_participants: allMonthly.length,
        target_points: 500,
      },
    });
  } catch (error) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/leaderboard/badges — Dynamic badges for current user
const getBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { eco_points: true },
    });
    
    const totalTransactions = await prisma.dropOffTransaction.count({
      where: { citizen_id: userId, status: 'VALIDATED' },
    });
    
    // Check weekly streak (4+ consecutive weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentTx = await prisma.dropOffTransaction.findMany({
      where: {
        citizen_id: userId,
        status: 'VALIDATED',
        created_at: { gte: fourWeeksAgo },
      },
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });
    
    // Calculate weeks with activity
    const weeksWithActivity = new Set();
    recentTx.forEach(tx => {
      const date = new Date(tx.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weeksWithActivity.add(weekStart.toISOString().split('T')[0]);
    });
    const hasStreak = weeksWithActivity.size >= 4;
    
    // Check if top 3 this month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const topMonthly = await prisma.dropOffTransaction.groupBy({
      by: ['citizen_id'],
      where: {
        created_at: { gte: startDate, lt: endDate },
        status: 'VALIDATED',
      },
      _sum: { points_awarded: true },
      orderBy: { _sum: { points_awarded: 'desc' } },
      take: 3,
    });
    const isTop3 = topMonthly.some(e => e.citizen_id === userId);
    
    const badges = [
      {
        id: 'pemula_eco',
        name: 'Pemula Eco',
        description: 'Pertama kali drop-off (≥1 transaksi)',
        icon: '🌱',
        unlocked: totalTransactions >= 1,
        progress: Math.min(totalTransactions, 1),
        target: 1,
      },
      {
        id: 'rajin_daur_ulang',
        name: 'Rajin Daur Ulang',
        description: '≥10 transaksi total',
        icon: '♻️',
        unlocked: totalTransactions >= 10,
        progress: Math.min(totalTransactions, 10),
        target: 10,
      },
      {
        id: 'eco_champion',
        name: 'Eco Champion',
        description: '≥500 poin total',
        icon: '🏆',
        unlocked: (user?.eco_points || 0) >= 500,
        progress: Math.min(user?.eco_points || 0, 500),
        target: 500,
      },
      {
        id: 'bintang_bulan',
        name: 'Bintang Bulan',
        description: 'Top 3 di leaderboard bulan ini',
        icon: '⭐',
        unlocked: isTop3,
        progress: isTop3 ? 1 : 0,
        target: 1,
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: '≥4 minggu berturut-turut ada transaksi',
        icon: '🔥',
        unlocked: hasStreak,
        progress: weeksWithActivity.size,
        target: 4,
      },
      {
        id: 'eco_legend',
        name: 'Eco Legend',
        description: '≥2000 poin total',
        icon: '💎',
        unlocked: (user?.eco_points || 0) >= 2000,
        progress: Math.min(user?.eco_points || 0, 2000),
        target: 2000,
      },
    ];
    
    res.json({ success: true, data: badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getLeaderboard, getMonthlyStats, getBadges };
