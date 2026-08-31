const express = require('express');
const router = express.Router();
const { getCommunityAnalytics, getNotifications } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/community', getCommunityAnalytics);
router.get('/notifications', authenticate, getNotifications);

module.exports = router;

