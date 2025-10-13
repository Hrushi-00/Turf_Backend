const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNumber: { type: String, required: true },
    role: { type: String, enum: ['user'], default: 'user' },

    profileImage: { type: String, default: '' },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    // Reference to bookings
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
