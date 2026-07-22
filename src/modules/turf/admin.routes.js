const express = require('express');
const router = express.Router();
const turfController = require('./turf.controller');
const { validate } = require('../../middleware/validate');
const { protect, isAdmin, canManageMetaInfo } = require('../../middleware/adminMiddleware');
const { validateAddTurf, validateTurfId, validateUpdateTurf, validateMetaInfo } = require('./turf.validation');

router.use(protect, isAdmin);

router.post('/turfs', validateAddTurf, validate, turfController.addTurf);
router.put('/turfs/:id', validateUpdateTurf, validate, turfController.updateTurf);
router.patch('/turfs/:id/meta', canManageMetaInfo, validateMetaInfo, validate, turfController.updateTurfMetaInfo);

module.exports = router;
