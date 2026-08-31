const express = require('express');
const router = express.Router();
const { getWasteStock, submitBuyRequest, getB2bRequests, approveB2bRequest } = require('../controllers/b2bController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/waste-stock', getWasteStock);
router.post('/buy-request', authenticate, submitBuyRequest);
router.get('/requests', authenticate, getB2bRequests);
router.patch('/requests/:id/approve', authenticate, approveB2bRequest);

module.exports = router;
