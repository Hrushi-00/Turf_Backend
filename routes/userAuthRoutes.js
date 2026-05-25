const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/userAuthController');
const { protectUser } = require('../middleware/userAuthMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protectUser, getProfile);
router.put('/profile', protectUser, updateProfile);
router.patch('/password', protectUser, changePassword);
router.delete('/account', protectUser, deleteAccount);

module.exports = router;
