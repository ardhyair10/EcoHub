const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct } = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRole('ADMIN_RW', 'B2B_BUYER'), createProduct);
router.patch('/:id', authenticate, updateProduct);

module.exports = router;
