const prisma = require('../lib/prisma');

// In-memory B2B requests store
let b2bRequests = [
  {
    id: 'b2b-req-1',
    buyer_id: 'db1b8745-126c-496d-843d-90cae4310374',
    buyer_name: 'PT EcoRecycle Industri',
    category_id: 'cat-plastik',
    category_name: 'Plastik PET Bening',
    target_weight_kg: 50,
    status: 'PENDING',
    notes: 'Penjemputan armada truk bak Sabtu pkl 09.00 WIB',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// GET /api/b2b/waste-stock — Aggregated waste collected grouped by category
const getWasteStock = async (req, res) => {
  try {
    const stockByCategory = await prisma.dropOffTransaction.groupBy({
      by: ['waste_category_id'],
      where: { status: 'VALIDATED' },
      _sum: { weight_kg: true },
      _count: { id: true },
    });
    
    const categoryIds = stockByCategory.map(s => s.waste_category_id);
    const categories = await prisma.wasteCategory.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));
    
    const stockData = stockByCategory.map(s => {
      const cat = categoryMap[s.waste_category_id] || { name: 'Lainnya', point_per_kg: 0 };
      const weightKg = Math.round((s._sum.weight_kg || 0) * 10) / 10;
      const estCarbonSavedKg = Math.round(weightKg * 1.2 * 10) / 10;
      
      return {
        category_id: s.waste_category_id,
        category_name: cat.name,
        point_per_kg: cat.point_per_kg,
        total_weight_kg: weightKg,
        transaction_count: s._count.id || 0,
        est_carbon_saved_kg: estCarbonSavedKg,
      };
    });
    
    const grandTotalWeight = stockData.reduce((acc, curr) => acc + curr.total_weight_kg, 0);
    const grandTotalCarbon = Math.round(grandTotalWeight * 1.2 * 10) / 10;
    
    res.json({
      success: true,
      data: {
        stock: stockData,
        summary: {
          total_weight_kg: Math.round(grandTotalWeight * 10) / 10,
          total_carbon_saved_kg: grandTotalCarbon,
          total_categories: stockData.length,
        },
      },
    });
  } catch (error) {
    console.error('Get B2B waste stock error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/b2b/buy-request — Submit B2B bulk buy interest
const submitBuyRequest = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const buyerName = req.user.name || 'PT EcoRecycle Industri';
    const { waste_category_id, target_weight_kg, notes } = req.body;
    
    if (!waste_category_id || !target_weight_kg) {
      return res.status(400).json({ success: false, message: 'waste_category_id dan target_weight_kg wajib diisi' });
    }
    
    const category = await prisma.wasteCategory.findUnique({ where: { id: waste_category_id } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }
    
    const newReq = {
      id: `b2b-req-${Date.now()}`,
      buyer_id: buyerId,
      buyer_name: buyerName,
      category_id: waste_category_id,
      category_name: category.name,
      target_weight_kg: parseFloat(target_weight_kg),
      status: 'PENDING',
      notes: notes || 'Permintaan penjemputan armada industri',
      created_at: new Date().toISOString(),
    };

    b2bRequests.unshift(newReq);
    
    res.status(201).json({
      success: true,
      message: `Permintaan pembelian bulk ${target_weight_kg}kg ${category.name} berhasil dikirim ke Admin RW!`,
      data: newReq,
    });
  } catch (error) {
    console.error('Submit B2B buy request error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/b2b/requests — Admin RW / B2B view requests list
const getB2bRequests = async (req, res) => {
  try {
    res.json({
      success: true,
      data: b2bRequests,
    });
  } catch (error) {
    console.error('Get B2B requests error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PATCH /api/b2b/requests/:id/approve — Admin RW approves request
const approveB2bRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const item = b2bRequests.find(r => r.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Permintaan tidak ditemukan' });
    }
    item.status = 'APPROVED';
    res.json({
      success: true,
      message: `Permintaan pembelian dari ${item.buyer_name} berhasil disetujui!`,
      data: item,
    });
  } catch (error) {
    console.error('Approve B2B request error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getWasteStock, submitBuyRequest, getB2bRequests, approveB2bRequest };
