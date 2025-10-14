const Booking = require('../models/bookingModel');
const Turf = require('../models/turfModel');

// Helper to determine if a date is weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

// Booking status constants
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

exports.createBooking = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required to book a turf' });
    }

    const { turfId, date, timeSlot, paymentMethod } = req.body;

    // Validate required fields
    if (!turfId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Please provide turfId, date, and timeSlot' });
    }

    // Find the turf
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    // ✅ Automatically assign admin from turf ownerDetails
    const adminId = turf.ownerDetails.adminId;
    if (!adminId) {
      return res.status(400).json({ message: 'Turf owner not found, cannot create booking' });
    }

    // Determine price automatically
    const bookingDate = new Date(date);
    const isWeekend = [0, 6].includes(bookingDate.getDay()); // Sunday (0) or Saturday (6)
    const price = isWeekend ? turf.pricing.weekendRate : turf.pricing.weekdayRate;

    // Create booking
    const booking = new Booking({
      user: req.user?._id, // Logged-in user (from protect middleware)
      turf: turf._id,
      admin: adminId,
      date,
      timeSlot,
      price,
      paymentMethod: paymentMethod || 'online'
    });

    const savedBooking = await booking.save();
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: savedBooking
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

// Get bookings for a specific admin
exports.getAdminBookings = async (req, res) => {
  try {
    // Only return bookings assigned to the logged-in admin
    const bookings = await Booking.find({ admin: req.user.id })
      .populate('user', 'name email contactNumber')
      .populate('turf', 'turfDetails.turfName location')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    // Only return bookings made by the logged-in user
    const bookings = await Booking.find({ user: req.user._id })
      .populate('turf', 'turfDetails.turfName location pricing')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch your bookings',
      error: error.message 
    });
  }
};

// Get all bookings (for super admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email contactNumber')
      .populate('turf', 'turfDetails.turfName location')
      .populate('admin', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch all bookings',
      error: error.message 
    });
  }
};


