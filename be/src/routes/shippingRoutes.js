const express = require('express');
const router = express.Router();
const { getProvinces, getCities, calculateCost } = require('../controllers/shippingController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/provinces', authenticate, getProvinces);
router.get('/cities/:provinceId', authenticate, getCities);
router.post('/cost', authenticate, calculateCost);

module.exports = router;
