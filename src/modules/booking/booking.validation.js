const { body, param } = require('express-validator');

const validateCreateBooking = [
  body('turfId')
    .notEmpty().withMessage('Turf ID is required')
    .isMongoId().withMessage('Invalid turf ID format'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO date string'),
  body('timeSlot')
    .trim()
    .notEmpty().withMessage('Time slot is required')
    .isLength({ min: 5, max: 50 }).withMessage('Time slot must be between 5 and 50 characters'),
  body('paymentMethod')
    .optional()
    .trim()
    .isIn(['cash', 'online', 'upi', 'card']).withMessage('Invalid payment method')
];

const validateBookingId = [
  param('id')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID format')
];

const validateUpdateBookingStatus = [
  param('id')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID format'),
  body('bookingStatus')
    .optional()
    .trim()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid booking status'),
  body('paymentStatus')
    .optional()
    .trim()
    .isIn(['pending', 'paid', 'failed']).withMessage('Invalid payment status')
];

module.exports = {
  validateCreateBooking,
  validateBookingId,
  validateUpdateBookingStatus
};
