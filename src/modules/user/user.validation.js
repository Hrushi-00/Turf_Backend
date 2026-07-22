const { body } = require('express-validator');

const validateUserSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter and one number'),
  body('contactNumber')
    .trim()
    .notEmpty().withMessage('Contact number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Contact number must be between 10 and 15 digits')
    .matches(/^[0-9]+$/).withMessage('Contact number can only contain digits'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address must not exceed 200 characters'),
  body('profileImage')
    .optional()
    .trim()
    .isURL().withMessage('Profile image must be a valid URL')
];

const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('contactNumber')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Contact number must be between 10 and 15 digits')
    .matches(/^[0-9]+$/).withMessage('Contact number can only contain digits'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address must not exceed 200 characters'),
  body('profileImage')
    .optional()
    .trim()
    .isURL().withMessage('Profile image must be a valid URL')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one uppercase letter, one lowercase letter and one number')
];

module.exports = {
  validateUserSignup,
  validateUserLogin,
  validateUpdateProfile,
  validateChangePassword
};
