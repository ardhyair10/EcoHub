const express = require('express');
const router = express.Router();
const { getMe, getUserByQr, searchUser, getCitizens, getCitizenDetail } = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/me', authenticate, getMe);
router.get('/search', authenticate, requireRole('ADMIN_RW'), searchUser);
router.get('/citizens', authenticate, requireRole('ADMIN_RW'), getCitizens);
router.get('/citizens/:id', authenticate, requireRole('ADMIN_RW'), getCitizenDetail);
router.get('/by-qr/:qr_code_id', authenticate, requireRole('ADMIN_RW'), getUserByQr);

module.exports = router;
