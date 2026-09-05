const prisma = require('../lib/prisma');

// Get all addresses for logged in user
exports.getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await prisma.userAddress.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { label, recipient, phone, full_address, lat, lng, is_primary, city_id, province_id } = req.body;

    if (!label || !recipient || !phone || !full_address || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Semua kolom harus diisi' });
    }

    // If this is set as primary, unset other primary addresses
    if (is_primary) {
      await prisma.userAddress.updateMany({
        where: { user_id: userId, is_primary: true },
        data: { is_primary: false }
      });
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        user_id: userId,
        label,
        recipient,
        phone,
        full_address,
        city_id,
        province_id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        is_primary: is_primary || false
      }
    });

    res.status(201).json({ success: true, message: 'Alamat berhasil ditambahkan', data: newAddress });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
