const express = require('express');
const router = express.Router();
const {
  getAllTurfs,
  getTurf,
  getApprovedTurfs,
  getFeaturedTurfs,
  getTrendingTurfs,
  getTurfAvailability
} = require('../controllers/turfController');

// Public routes
router.get('/', getAllTurfs);
router.get('/approved/list', getApprovedTurfs);
router.get('/featured', getFeaturedTurfs);
router.get('/trending', getTrendingTurfs);
router.get('/:id/availability', getTurfAvailability);
router.get('/:id', getTurf);

module.exports = router;
