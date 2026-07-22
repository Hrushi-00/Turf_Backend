const express = require('express');
const router = express.Router();
const businessController = require('./business.controller');
const { validate } = require('../../middleware/validate');
const { protect } = require('../../middleware/authMiddleware');
const { validateBusinessSignup, validateBusinessLogin, validateBusinessUpdateProfile, validateBusinessChangePassword } = require('./business.validation');

router.post('/signup', validateBusinessSignup, validate, businessController.signup);
router.post('/login', validateBusinessLogin, validate, businessController.login);
router.get('/profile', protect, businessController.getProfile);
router.put('/profile', protect, validateBusinessUpdateProfile, validate, businessController.updateProfile);
router.patch('/password', protect, validateBusinessChangePassword, validate, businessController.changePassword);

module.exports = router;
