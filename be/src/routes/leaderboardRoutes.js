const express = require('express');
const router = express.Router();
const { getLeaderboard, getMonthlyStats, getBadges } = require('../controllers/leaderboardController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', getLeaderboard);
router.get('/monthly-stats', authenticate, getMonthlyStats);
router.get('/badges', authenticate, getBadges);

module.exports = router;
