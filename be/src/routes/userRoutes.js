const express = require('express');
const router = express.Router();
const { getMe, getUserByQr, searchUser } = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/me', authenticate, getMe);
router.get('/search', authenticate, requireRole('ADMIN_RW'), searchUser);
router.get('/by-qr/:qr_code_id', authenticate, requireRole('ADMIN_RW'), getUserByQr);

module.exports = router;
