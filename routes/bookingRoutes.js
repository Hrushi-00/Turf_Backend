const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');
const { protectUser } = require('../middleware/userAuthMiddleware');
const { protectAny } = require('../middleware/anyAuthMiddleware');

router.post('/', protectUser, createBooking);
router.get('/me', protectUser, getUserBookings);
router.get('/:id', protectAny, getBookingById);
router.patch('/:id/cancel', protectUser, cancelBooking);

module.exports = router;
