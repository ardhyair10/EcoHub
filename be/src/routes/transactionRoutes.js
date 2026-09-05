const express = require('express');
const router = express.Router();
const { createTransaction, getMyTransactions, getAllTransactions, validateTransaction } = require('../controllers/transactionController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// User: lihat transaksi sendiri
router.get('/my', authenticate, getMyTransactions);

// Admin: lihat semua transaksi
router.get('/', authenticate, requireRole('ADMIN_RW'), getAllTransactions);

// Admin: buat transaksi baru
router.post('/', authenticate, requireRole('ADMIN_RW'), createTransaction);

// Admin: validasi transaksi
router.patch('/:id/validate', authenticate, requireRole('ADMIN_RW'), validateTransaction);

module.exports = router;
