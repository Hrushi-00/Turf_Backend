const { protect } = require('./authMiddleware');

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Access denied. SuperAdmin or Admin only.'
    });
  }
};

const canManageMetaInfo = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Only SuperAdmin can manage turf meta information'
    });
  }
};

module.exports = { protect, isAdmin, canManageMetaInfo };