const express = require('express');
const router = express.Router();
const { validateCreateBooking, validateBookingId, validateUpdateBookingStatus } = require('../booking/booking.validation');
const { protectUser } = require('../../middleware/userAuthMiddleware');
const { protectAny } = require('../../middleware/anyAuthMiddleware');
const bookingController = require('./booking.controller');
const { validate } = require('../../middleware/validate');

router.post('/', protectUser, validateCreateBooking, validate, bookingController.createBooking);
router.get('/me', protectUser, bookingController.getUserBookings);
router.get('/:id', protectAny, validateBookingId, validate, bookingController.getBookingById);
router.patch('/:id/cancel', protectUser, validateBookingId, validate, bookingController.cancelBooking);

module.exports = router;
