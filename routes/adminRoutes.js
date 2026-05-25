const express = require('express');
const router = express.Router();
const { protect, isAdmin, canManageMetaInfo } = require('../middleware/adminMiddleware');
const {
  addTurf,
  getAdminTurfs,
  updateTurf,
  deleteTurf,
  updateTurfMetaInfo,
  approveTurf,
  rejectTurf,
  getBookingStats
} = require('../controllers/turfController');
const {
  getAdminBookings,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

router.use(protect, isAdmin);

router.get('/turfs', getAdminTurfs);
router.post('/turfs', addTurf);
router.put('/turfs/:id', updateTurf);
router.delete('/turfs/:id', deleteTurf);
router.patch('/turfs/:id/meta', canManageMetaInfo, updateTurfMetaInfo);
router.patch('/turfs/:id/approve', approveTurf);
router.patch('/turfs/:id/reject', rejectTurf);

router.get('/bookings', getAdminBookings);
router.get('/bookings/stats', getBookingStats);
router.get('/bookings/all', getAllBookings);
router.patch('/bookings/:id', updateBookingStatus);

module.exports = router;
