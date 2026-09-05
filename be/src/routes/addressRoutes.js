const express = require('express');
const router = express.Router();
const { getMyAddresses, addAddress } = require('../controllers/addressController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/my', authenticate, getMyAddresses);
router.post('/', authenticate, addAddress);

module.exports = router;
