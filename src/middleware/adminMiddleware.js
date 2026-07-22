const jwt = require('jsonwebtoken');
const { protect } = require('./authMiddleware');

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'SuperAdmin')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. Admin only.'
  });
};

const isBusinessUser = (req, res, next) => {
  if (req.user && req.user.role === 'BusinessUser') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. Business user only.'
  });
};

const canManageMetaInfo = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'SuperAdmin')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Only admin can manage turf approval and meta information'
  });
};

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied. SuperAdmin only.'
  });
};

module.exports = { protect, isAdmin, isBusinessUser, canManageMetaInfo, isSuperAdmin };
