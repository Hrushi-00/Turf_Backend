const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { protect } = require('../../middleware/authMiddleware');
const { validateRegister, validateLogin, validateUpdateProfile, validateChangePassword } = require('./auth.validation');

router.post('/register', validateRegister, validate, authController.register);
router.post('/login', validateLogin, validate, authController.login);
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validateUpdateProfile, validate, authController.updateProfile);
router.patch('/password', protect, validateChangePassword, validate, authController.changePassword);

module.exports = router;
