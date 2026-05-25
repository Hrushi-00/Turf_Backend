const jwt = require('jsonwebtoken');
const Admin = require('../models/authModel');
const User = require('../models/userModel');
require('dotenv').config();

const protectAny = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.user = admin;
      req.userId = admin._id;
      req.userRole = admin.role;
      req.authType = 'admin';
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      req.userId = user._id;
      req.userRole = user.role;
      req.authType = 'user';
      return next();
    }

    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: error.message });
  }
};

module.exports = { protectAny };
