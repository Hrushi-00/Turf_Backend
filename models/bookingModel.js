const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true // Example: "06:00 AM - 07:00 AM"
    },
    price: {
      type: Number,
     
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'upi', 'card'],
      default: 'online'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
