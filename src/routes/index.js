const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const authBusinessRoutes = require('../modules/auth/business.routes');
const turfRoutes = require('../modules/turf/turf.public.routes');
const adminRoutes = require('../modules/turf/admin.routes');
const userRoutes = require('../modules/user/user.routes');
const businessRoutes = require('../modules/business/business.routes');
const bookingRoutes = require('../modules/booking/booking.routes');

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

router.use('/auth', authRoutes);
router.use('/admin/auth', authRoutes);
router.use('/business/auth', authBusinessRoutes);
router.use('/turfs', turfRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/user/auth', userRoutes);
router.use('/business', businessRoutes);
router.use('/user/bookings', bookingRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
