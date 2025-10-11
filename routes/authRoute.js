const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authCotroller');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/register', register);
router.post('/login', login);

module.exports = router;
