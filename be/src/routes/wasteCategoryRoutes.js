const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/wasteCategoryController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', getAllCategories); // publik
router.post('/', authenticate, requireRole('ADMIN_RW'), createCategory);

module.exports = router;
