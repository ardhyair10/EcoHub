const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getMyOrders);

module.exports = router;
