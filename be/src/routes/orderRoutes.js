const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, createBulkOrder, payOrder, cancelOrder, completeOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, createOrder);
router.post('/bulk', authenticate, createBulkOrder);
router.get('/my', authenticate, getMyOrders);
router.post('/:id/pay', authenticate, payOrder);
router.post('/:id/cancel', authenticate, cancelOrder);
router.post('/:id/complete', authenticate, completeOrder);

module.exports = router;
