const express = require('express');
const router = express.Router();
const { register, login,getProfile, updateProfile } = require('../controllers/authCotroller');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
