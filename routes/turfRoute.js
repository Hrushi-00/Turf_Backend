const express = require('express');
const router = express.Router();
const { protect, isAdmin, canManageMetaInfo, isSuperAdmin } = require('../middleware/adminMiddleware');
const {
  addTurf,
  getAllTurfs,
  getTurf,
  updateTurf,
  deleteTurf,
  updateTurfMetaInfo,
  approveTurf,
  rejectTurf,
  getApprovedTurfs
} = require('../controllers/turfController');

// Public routes - only returns approved turfs
// router.get('/', getAllTurfs);
router.get('/:id', getTurf);
router.get('/approved/list', getApprovedTurfs);

// Protected routes (admin only)
router.post('/', protect, isAdmin, addTurf);
router.put('/:id', protect, isAdmin, isSuperAdmin, updateTurf);
router.delete('/:id', protect, isSuperAdmin, deleteTurf);

// Meta info routes (admin only)
router.patch('/:id/meta', protect, canManageMetaInfo, updateTurfMetaInfo);

// Super admin approval routes
router.patch('/:id/approve', protect, isSuperAdmin, approveTurf);
router.patch('/:id/reject', protect, isSuperAdmin, rejectTurf);


module.exports = router;