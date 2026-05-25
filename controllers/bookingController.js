const Booking = require('../models/bookingModel');
const Turf = require('../models/turfModel');
const User = require('../models/userModel');

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const normalizeDateRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

const canManageBooking = (booking, user) => {
  if (!user) return false;
  if (user.role === 'Admin' || user.role === 'SuperAdmin') return true;
  if (user.role === 'BusinessUser') return String(booking.admin) === String(user._id);
  return String(booking.user) === String(user._id);
};

exports.createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required to book a turf' });
    }

    const { turfId, date, timeSlot, paymentMethod } = req.body;

    if (!turfId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'turfId, date, and timeSlot are required'
      });
    }

    const turf = await Turf.findById(turfId);
    if (!turf || turf.status !== 'active' || !turf.metaInfo?.isApproved) {
      return res.status(404).json({ success: false, message: 'Turf not found or not available for booking' });
    }

    const adminId = turf.ownerDetails?.businessUserId || turf.ownerDetails?.adminId;
    if (!adminId) {
      return res.status(400).json({ success: false, message: 'Turf owner not found, cannot create booking' });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const { start, end } = normalizeDateRange(bookingDate);
    const existingBooking = await Booking.findOne({
      turf: turf._id,
      date: { $gte: start, $lte: end },
      timeSlot,
      bookingStatus: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked for the selected date'
      });
    }

    const price = isWeekend(bookingDate)
      ? turf.pricing.weekendRate
      : turf.pricing.weekdayRate;

    const booking = await Booking.create({
      user: req.user._id,
      turf: turf._id,
      admin: adminId,
      date: bookingDate,
      timeSlot,
      price,
      paymentMethod: paymentMethod || 'online'
    });

    const populatedBooking = await Booking.populate(booking, [
      { path: 'user', select: 'name email contactNumber' },
      { path: 'turf', select: 'turfDetails.turfName location pricing' },
      { path: 'admin', select: 'username email role' }
    ]);

    await Promise.all([
      Turf.findByIdAndUpdate(turf._id, {
        $inc: {
          'metaInfo.totalBookings': 1,
          'metaInfo.popularityScore': 1
        }
      }),
      User.findByIdAndUpdate(req.user._id, {
        $addToSet: { bookings: booking._id }
      })
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getAdminBookings = async (req, res) => {
  try {
    const query =
      req.user.role === 'Admin' || req.user.role === 'SuperAdmin'
        ? {}
        : { admin: req.user._id };

    const bookings = await Booking.find(query)
      .populate('user', 'name email contactNumber')
      .populate('turf', 'turfDetails.turfName location pricing')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'turfDetails.turfName location pricing gallery')
      .populate('admin', 'username email role')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your bookings',
      error: error.message
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email contactNumber')
      .populate('turf', 'turfDetails.turfName location')
      .populate('admin', 'username email role')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all bookings',
      error: error.message
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email contactNumber')
      .populate('turf', 'turfDetails.turfName location pricing')
      .populate('admin', 'username email role');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'You are not allowed to view this booking' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canManageBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'You are not allowed to update this booking' });
    }

    const { bookingStatus, paymentStatus } = req.body;
    const updates = {};

    if (bookingStatus && Object.values(BOOKING_STATUS).includes(bookingStatus)) {
      updates.bookingStatus = bookingStatus;
    }

    if (paymentStatus && ['pending', 'paid', 'failed'].includes(paymentStatus)) {
      updates.paymentStatus = paymentStatus;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email contactNumber')
      .populate('turf', 'turfDetails.turfName location pricing')
      .populate('admin', 'username email role');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      String(booking.user) !== String(req.user._id) &&
      req.user.role !== 'Admin' &&
      req.user.role !== 'SuperAdmin' &&
      !(req.user.role === 'BusinessUser' && String(booking.admin) === String(req.user._id))
    ) {
      return res.status(403).json({ success: false, message: 'You are not allowed to cancel this booking' });
    }

    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
