const Booking = require('./booking.model');
const Turf = require('../turf/turf.model');
const User = require('../user/user.model');

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

const createBooking = async (data) => {
  const { userId, turfId, date, timeSlot, paymentMethod } = data;

  const turf = await Turf.findById(turfId);
  if (!turf || turf.status !== 'active' || !turf.metaInfo?.isApproved) {
    throw new Error('Turf not found or not available for booking');
  }

  const adminId = turf.ownerDetails?.businessUserId || turf.ownerDetails?.adminId;
  if (!adminId) {
    throw new Error('Turf owner not found, cannot create booking');
  }

  const bookingDate = new Date(date);
  if (Number.isNaN(bookingDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const { start, end } = normalizeDateRange(bookingDate);
  const existingBooking = await Booking.findOne({
    turf: turf._id,
    date: { $gte: start, $lte: end },
    timeSlot,
    bookingStatus: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED] }
  });

  if (existingBooking) {
    throw new Error('This time slot is already booked for the selected date');
  }

  const price = isWeekend(bookingDate)
    ? turf.pricing.weekendRate
    : turf.pricing.weekdayRate;

  const booking = await Booking.create({
    user: userId,
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
    User.findByIdAndUpdate(userId, {
      $addToSet: { bookings: booking._id }
    })
  ]);

  return {
    success: true,
    message: 'Booking created successfully',
    booking: populatedBooking
  };
};

const getAdminBookings = async (user) => {
  const query =
    user.role === 'Admin' || user.role === 'SuperAdmin'
      ? {}
      : { admin: user._id };

  const bookings = await Booking.find(query)
    .populate('user', 'name email contactNumber')
    .populate('turf', 'turfDetails.turfName location pricing')
    .sort({ date: -1, createdAt: -1 });

  return {
    success: true,
    count: bookings.length,
    bookings
  };
};

const getUserBookings = async (userId) => {
  const bookings = await Booking.find({ user: userId })
    .populate('turf', 'turfDetails.turfName location pricing gallery')
    .populate('admin', 'username email role')
    .sort({ date: -1, createdAt: -1 });

  return {
    success: true,
    count: bookings.length,
    bookings
  };
};

const getAllBookings = async () => {
  const bookings = await Booking.find()
    .populate('user', 'name email contactNumber')
    .populate('turf', 'turfDetails.turfName location')
    .populate('admin', 'username email role')
    .sort({ date: -1, createdAt: -1 });

  return {
    success: true,
    count: bookings.length,
    bookings
  };
};

const getBookingById = async (params, user) => {
  const booking = await Booking.findById(params.id)
    .populate('user', 'name email contactNumber')
    .populate('turf', 'turfDetails.turfName location pricing')
    .populate('admin', 'username email role');

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!canManageBooking(booking, user)) {
    throw new Error('You are not allowed to view this booking');
  }

  return { success: true, booking };
};

const updateBookingStatus = async (params, updates) => {
  const { id, bookingStatus, paymentStatus } = updates;

  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    { $set: { bookingStatus, paymentStatus } },
    { new: true, runValidators: true }
  )
    .populate('user', 'name email contactNumber')
    .populate('turf', 'turfDetails.turfName location pricing')
    .populate('admin', 'username email role');

  if (!updatedBooking) {
    throw new Error('Booking not found');
  }

  return {
    success: true,
    message: 'Booking updated successfully',
    booking: updatedBooking
  };
};

const cancelBooking = async (params, user) => {
  const booking = await Booking.findById(params.id);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (
    String(booking.user) !== String(user._id) &&
    user.role !== 'Admin' &&
    user.role !== 'SuperAdmin' &&
    !(user.role === 'BusinessUser' && String(booking.admin) === String(user._id))
  ) {
    throw new Error('You are not allowed to cancel this booking');
  }

  booking.bookingStatus = BOOKING_STATUS.CANCELLED;
  await booking.save();

  return {
    success: true,
    message: 'Booking cancelled successfully',
    booking
  };
};

module.exports = {
  createBooking,
  getAdminBookings,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};
