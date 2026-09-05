const axios = require('axios');

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_BASE_URL = 'https://api.rajaongkir.com/starter';

// Get all provinces
exports.getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${RAJAONGKIR_BASE_URL}/province`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    res.json({ success: true, data: response.data.rajaongkir.results });
  } catch (error) {
    console.error('Error fetching provinces:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Gagal memuat provinsi dari RajaOngkir' });
  }
};

// Get cities by province
exports.getCities = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const response = await axios.get(`${RAJAONGKIR_BASE_URL}/city?province=${provinceId}`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    res.json({ success: true, data: response.data.rajaongkir.results });
  } catch (error) {
    console.error('Error fetching cities:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Gagal memuat kota dari RajaOngkir' });
  }
};

// Calculate shipping cost
exports.calculateCost = async (req, res) => {
  try {
    const { courier } = req.body;
    let data = [];

    // Return mock data for MVP to avoid RajaOngkir API key issues
    if (courier === "pos") {
      data = [{
        code: "pos",
        name: "POS Indonesia",
        costs: [
          { service: "KILAT", description: "Pos Kilat Khusus", cost: [{ value: 12000, etd: "2-4", note: "" }] },
          { service: "EXPRESS", description: "Pos Express", cost: [{ value: 20000, etd: "1-2", note: "" }] }
        ]
      }];
    } else if (courier === "tiki") {
      data = [{
        code: "tiki",
        name: "Citra Van Titipan Kilat (TIKI)",
        costs: [
          { service: "ECO", description: "Economy Service", cost: [{ value: 14000, etd: "4-5", note: "" }] },
          { service: "REG", description: "Regular Service", cost: [{ value: 18000, etd: "2-3", note: "" }] }
        ]
      }];
    } else if (courier === "sicepat") {
      data = [{
        code: "sicepat",
        name: "SiCepat Ekspres",
        costs: [
          { service: "HALU", description: "Harga Mulai Lima Ribu", cost: [{ value: 10000, etd: "1-3", note: "" }] },
          { service: "BEST", description: "Besok Sampai Tujuan", cost: [{ value: 22000, etd: "1-1", note: "" }] }
        ]
      }];
    } else {
      // Default JNE
      data = [{
        code: "jne",
        name: "Jalur Nugraha Ekakurir (JNE)",
        costs: [
          { service: "REG", description: "Layanan Reguler (Flat Rate)", cost: [{ value: 15000, etd: "2-3", note: "" }] },
          { service: "YES", description: "Yakin Esok Sampai", cost: [{ value: 25000, etd: "1-1", note: "" }] }
        ]
      }];
    }

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error calculating cost:', error?.message);
    res.status(500).json({ success: false, message: 'Gagal menghitung ongkos kirim' });
  }
};
