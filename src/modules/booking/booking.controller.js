const bookingService = require('./booking.service');

const getAdminBookings = async (req, res) => {
  try {
    const result = await bookingService.getAdminBookings(req.user);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const result = await bookingService.getAllBookings();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all bookings',
      error: error.message
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const result = await bookingService.createBooking({
      userId: req.user._id,
      turfId: req.body.turfId,
      date: req.body.date,
      timeSlot: req.body.timeSlot,
      paymentMethod: req.body.paymentMethod
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const result = await bookingService.getUserBookings(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your bookings',
      error: error.message
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const result = await bookingService.getBookingById({ id: req.params.id }, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const result = await bookingService.updateBookingStatus(
      { id: req.params.id },
      {
        bookingStatus: req.body.bookingStatus,
        paymentStatus: req.body.paymentStatus
      }
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const result = await bookingService.cancelBooking({ id: req.params.id }, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
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
