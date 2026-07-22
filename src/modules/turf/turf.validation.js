const { body, param } = require('express-validator');

const validateAddTurf = [
  body('ownerDetails.name')
    .trim()
    .notEmpty().withMessage('Owner name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Owner name must be between 2 and 50 characters'),
  body('ownerDetails.contactNumber')
    .trim()
    .notEmpty().withMessage('Owner contact number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Contact number must be between 10 and 15 digits'),
  body('ownerDetails.email')
    .trim()
    .notEmpty().withMessage('Owner email is required')
    .isEmail().withMessage('Please provide a valid email address'),
  body('turfDetails.turfName')
    .trim()
    .notEmpty().withMessage('Turf name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Turf name must be between 3 and 100 characters'),
  body('turfDetails.description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('turfDetails.sportsAvailable')
    .optional()
    .isArray().withMessage('Sports available must be an array'),
  body('turfDetails.surfaceType')
    .trim()
    .notEmpty().withMessage('Surface type is required'),
  body('turfDetails.dimensions.length')
    .notEmpty().withMessage('Length is required')
    .isFloat({ min: 1 }).withMessage('Length must be a positive number'),
  body('turfDetails.dimensions.width')
    .notEmpty().withMessage('Width is required')
    .isFloat({ min: 1 }).withMessage('Width must be a positive number'),
  body('turfDetails.dimensions.unit')
    .trim()
    .notEmpty().withMessage('Dimension unit is required'),
  body('turfDetails.capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('location.address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 200 }).withMessage('Address must not exceed 200 characters'),
  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('location.zipCode')
    .trim()
    .notEmpty().withMessage('Zip code is required')
    .matches(/^[0-9]{5,10}$/).withMessage('Zip code must be 5-10 digits'),
  body('pricing.weekdayRate')
    .notEmpty().withMessage('Weekday rate is required')
    .isFloat({ min: 0 }).withMessage('Weekday rate must be a non-negative number'),
  body('pricing.weekendRate')
    .notEmpty().withMessage('Weekend rate is required')
    .isFloat({ min: 0 }).withMessage('Weekend rate must be a non-negative number'),
  body('pricing.currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('pricing.minimumBookingHours')
    .optional()
    .isInt({ min: 1 }).withMessage('Minimum booking hours must be at least 1'),
  body('availability.openingTime')
    .trim()
    .notEmpty().withMessage('Opening time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Opening time must be in HH:MM format'),
  body('availability.closingTime')
    .trim()
    .notEmpty().withMessage('Closing time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Closing time must be in HH:MM format'),
  body('gallery.mainImage')
    .optional()
    .trim()
    .isURL().withMessage('Main image must be a valid URL')
];

const validateTurfId = [
  param('id')
    .notEmpty().withMessage('Turf ID is required')
    .isMongoId().withMessage('Invalid turf ID format')
];

const validateUpdateTurf = [
  param('id')
    .notEmpty().withMessage('Turf ID is required')
    .isMongoId().withMessage('Invalid turf ID format'),
  body('turfDetails.turfName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Turf name must be between 3 and 100 characters'),
  body('turfDetails.description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
  body('pricing.weekdayRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weekday rate must be a non-negative number'),
  body('pricing.weekendRate')
    .optional()
    .isFloat({ min: 0 }).withMessage('Weekend rate must be a non-negative number')
];

const validateMetaInfo = [
  param('id')
    .notEmpty().withMessage('Turf ID is required')
    .isMongoId().withMessage('Invalid turf ID format'),
  body('isApproved')
    .optional()
    .isBoolean().withMessage('isApproved must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean().withMessage('isFeatured must be a boolean'),
  body('isTrending')
    .optional()
    .isBoolean().withMessage('isTrending must be a boolean'),
  body('popularityScore')
    .optional()
    .isInt({ min: 0 }).withMessage('Popularity score must be a non-negative integer')
];

module.exports = {
  validateAddTurf,
  validateTurfId,
  validateUpdateTurf,
  validateMetaInfo
};
