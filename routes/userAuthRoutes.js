const express = require('express');
const router = express.Router();
const { signup, login, getProfile } = require('../controllers/userAuthController');
const { protectUser } = require('../middleware/userAuthMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protectUser, getProfile);

module.exports = router;
