const express = require('express');
const router = express.Router();
const { protect, isAdmin, canManageMetaInfo } = require('../middleware/adminMiddleware');
const {
  addTurf,
  getAllTurfs,
  getTurf,
  updateTurf,
  deleteTurf,
  updateTurfMetaInfo
} = require('../controllers/turfController');

// Public routes
router.get('/', getAllTurfs);
router.get('/:id', getTurf);

// Protected routes (admin only)
router.post('/', protect, isAdmin, addTurf);
router.put('/:id', protect, isAdmin, updateTurf);
router.delete('/:id', protect, isAdmin, deleteTurf);

// Meta info routes (admin only)
router.patch('/:id/meta', protect, canManageMetaInfo, updateTurfMetaInfo);

module.exports = router;