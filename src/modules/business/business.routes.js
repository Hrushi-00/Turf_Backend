const express = require('express');
const router = express.Router();
const businessController = require('./business.controller');
const { validate } = require('../../middleware/validate');
const { protect, isBusinessUser } = require('../../middleware/adminMiddleware');

router.use(protect, isBusinessUser);

router.post('/turfs', require('../turf/turf.validation').validateAddTurf, validate, businessController.addTurf);
router.put('/turfs/:id', require('../turf/turf.validation').validateUpdateTurf, validate, businessController.updateTurf);
router.patch('/bookings/:id', require('../booking/booking.validation').validateUpdateBookingStatus, validate, businessController.updateBookingStatus);

module.exports = router;
