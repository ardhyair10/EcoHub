const express = require('express');
const router = express.Router();
const { getEvents, getMyEvents, getEventById, createEvent, joinEvent, markAttendance } = require('../controllers/eventController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/my', authenticate, getMyEvents);
router.get('/:id', getEventById);
router.post('/', authenticate, requireRole('ADMIN_RW'), createEvent);
router.post('/:id/join', authenticate, joinEvent);
router.post('/attendance', authenticate, requireRole('ADMIN_RW'), markAttendance);

module.exports = router;
