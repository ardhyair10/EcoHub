const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, createBulkOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, createOrder);
router.post('/bulk', authenticate, createBulkOrder);
router.get('/my', authenticate, getMyOrders);

module.exports = router;
