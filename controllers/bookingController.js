const Booking = require('../models/bookingModel');
const Turf = require('../models/turfModel');

// Helper to determine if a date is weekend
const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

exports.createBooking = async (req, res) => {
  try {
    const { turfId, date, timeSlot, paymentMethod } = req.body;

    // Find the turf
    const turf = await Turf.findById(turfId);
    if (!turf) return res.status(404).json({ message: "Turf not found" });

    // Decide price automatically
    const price =
      new Date(date).getDay() === 0 || new Date(date).getDay() === 6
        ? turf.pricing.weekendRate
        : turf.pricing.weekdayRate;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      turf: turf._id,
      date,
      timeSlot,
      price,
      paymentMethod,
      bookingStatus: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

