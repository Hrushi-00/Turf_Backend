const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');
const { protectUser } = require('../middleware/userAuthMiddleware');

router.post('/book', protectUser, createBooking);

module.exports = router;
