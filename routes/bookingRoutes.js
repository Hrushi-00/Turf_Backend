const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getAdminBookings, 
  getUserBookings, 
  getAllBookings 
} = require('../controllers/bookingController');
const { protectUser } = require('../middleware/userAuthMiddleware');
const { protect, isAdmin, isSuperAdmin } = require('../middleware/adminMiddleware');
const {getBookingStats,} = require('../controllers/turfController');

// User booking routes - authentication required
router.post('/bookturf', protectUser, createBooking);
router.get('/userbookings', protectUser, getUserBookings); 

// Admin booking routes
router.get('/admin/turfbookings', protect, isAdmin, getAdminBookings);
router.get('/bookings/stats', protect, isAdmin, getBookingStats);

// Super admin routes
router.get('/all', protect, isSuperAdmin, getAllBookings); 

module.exports = router;
