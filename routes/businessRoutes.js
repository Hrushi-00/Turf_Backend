const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isBusinessUser } = require('../middleware/adminMiddleware');
const {
  addTurf,
  getAdminTurfs,
  updateTurf,
  deleteTurf,
  getBookingStats
} = require('../controllers/turfController');
const {
  getAdminBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

router.use(protect, isBusinessUser);

router.get('/turfs', getAdminTurfs);
router.post('/turfs', addTurf);
router.put('/turfs/:id', updateTurf);
router.delete('/turfs/:id', deleteTurf);

router.get('/bookings', getAdminBookings);
router.get('/bookings/stats', getBookingStats);
router.patch('/bookings/:id', updateBookingStatus);

module.exports = router;
