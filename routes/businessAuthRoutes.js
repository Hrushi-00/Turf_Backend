const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/businessAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/password', protect, changePassword);

module.exports = router;
