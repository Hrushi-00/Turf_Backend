const Turf = require('../models/turfModel');
const Booking = require('../models/bookingModel');
const cloudinary = require('../config/cloudinary');

const parseBoolean = (value) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

const getAllowedFields = (body) => {
  const turfData = { ...body };

  if (typeof turfData.sportsAvailable === 'string') {
    try {
      turfData.sportsAvailable = JSON.parse(turfData.sportsAvailable);
    } catch (_) {
      turfData.sportsAvailable = turfData.sportsAvailable.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  if (typeof turfData.amenities === 'string') {
    try {
      turfData.amenities = JSON.parse(turfData.amenities);
    } catch (_) {
      turfData.amenities = turfData.amenities.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return turfData;
};

const uploadGallery = async (files, turfData) => {
  if (!files) return turfData;

  if (files.mainImage) {
    const mainImageResult = await cloudinary.uploader.upload(files.mainImage.tempFilePath, {
      folder: 'turfs/main'
    });
    turfData.gallery = turfData.gallery || {};
    turfData.gallery.mainImage = mainImageResult.secure_url;
  }

  if (files.thumbnailImages) {
    const thumbnailImages = Array.isArray(files.thumbnailImages)
      ? files.thumbnailImages
      : [files.thumbnailImages];

    const thumbnailResults = await Promise.all(
      thumbnailImages.map((image) =>
        cloudinary.uploader.upload(image.tempFilePath, { folder: 'turfs/thumbnails' })
      )
    );

    turfData.gallery = turfData.gallery || {};
    turfData.gallery.thumbnailImages = thumbnailResults.map((result) => result.secure_url);
  }

  return turfData;
};

const canAccessTurf = (turf, user) => {
  if (!user) return turf.status === 'active' && turf.metaInfo?.isApproved;
  if (user.role === 'Admin' || user.role === 'SuperAdmin') return true;
  const ownerId = turf.ownerDetails?.businessUserId || turf.ownerDetails?.adminId;
  return String(ownerId) === String(user._id);
};

// Create new turf
exports.addTurf = async (req, res) => {
  try {
    const turfData = getAllowedFields(req.body);

    turfData.ownerDetails = turfData.ownerDetails || {};
    if (req.user.role === 'BusinessUser') {
      turfData.ownerDetails.businessUserId = req.user._id;
    } else {
      turfData.ownerDetails.adminId = req.user._id;
    }
    if (!turfData.ownerDetails.name) turfData.ownerDetails.name = req.user.username;
    if (!turfData.ownerDetails.email) turfData.ownerDetails.email = req.user.email;

    await uploadGallery(req.files, turfData);

    const turf = await Turf.create(turfData);

    res.status(201).json({
      success: true,
      message: 'Turf created successfully',
      data: turf
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Public turf listing with filters
exports.getAllTurfs = async (req, res) => {
  try {
    const { city, sport, q, featured, trending, page = 1, limit = 20 } = req.query;

    const query = {
      status: 'active',
      'metaInfo.isApproved': true
    };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (sport) query['turfDetails.sportsAvailable'] = new RegExp(sport, 'i');
    if (parseBoolean(featured) !== undefined) query['metaInfo.isFeatured'] = parseBoolean(featured);
    if (parseBoolean(trending) !== undefined) query['metaInfo.isTrending'] = parseBoolean(trending);
    if (q) {
      query.$or = [
        { 'turfDetails.turfName': new RegExp(q, 'i') },
        { 'location.city': new RegExp(q, 'i') },
        { 'location.address': new RegExp(q, 'i') },
        { 'turfDetails.description': new RegExp(q, 'i') }
      ];
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [turfs, total] = await Promise.all([
      Turf.find(query).sort({ 'metaInfo.createdAt': -1 }).skip(skip).limit(pageSize),
      Turf.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: turfs.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: turfs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAdminTurfs = async (req, res) => {
  try {
    const query =
      req.user.role === 'Admin' || req.user.role === 'SuperAdmin'
        ? {}
        : {
            $or: [
              { 'ownerDetails.businessUserId': req.user._id },
              { 'ownerDetails.adminId': req.user._id }
            ]
          };

    const turfs = await Turf.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single turf
exports.getTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }

    if (!canAccessTurf(turf, req.user)) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }

    res.status(200).json({
      success: true,
      data: turf
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update turf
exports.updateTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }

    if (!canAccessTurf(turf, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'You are not allowed to update this turf'
      });
    }

    const turfData = getAllowedFields(req.body);
    await uploadGallery(req.files, turfData);

    const updatedTurf = await Turf.findByIdAndUpdate(req.params.id, turfData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedTurf,
      message: 'Turf updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update turf meta info (Admin only)
exports.updateTurfMetaInfo = async (req, res) => {
  try {
    const allowedUpdates = ['isApproved', 'isFeatured', 'isTrending', 'popularityScore'];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[`metaInfo.${key}`] = req.body[key];
      }
    }

    const turf = await Turf.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!turf) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }

    res.status(200).json({
      success: true,
      data: turf.metaInfo,
      message: 'Turf meta info updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete turf
exports.deleteTurf = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }

    if (!canAccessTurf(turf, req.user)) {
      return res.status(403).json({
        success: false,
        error: 'You are not allowed to delete this turf'
      });
    }

    await turf.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Turf deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    const match =
      req.userRole === 'Admin' || req.userRole === 'SuperAdmin'
        ? {}
        : { admin: req.user._id };

    const stats = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$price' },
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$bookingStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        paidBookings: 0,
        pendingBookings: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.approveTurf = async (req, res) => {
  try {
    const turf = await Turf.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        'metaInfo.isApproved': true
      },
      { new: true }
    );

    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    res.status(200).json({
      success: true,
      data: turf,
      message: 'Turf approved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getApprovedTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find({ status: 'active', 'metaInfo.isApproved': true });
    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rejectTurf = async (req, res) => {
  try {
    const turf = await Turf.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        'metaInfo.isApproved': false
      },
      { new: true }
    );

    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    res.status(200).json({
      success: true,
      data: turf,
      message: 'Turf rejected successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeaturedTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find({
      status: 'active',
      'metaInfo.isApproved': true,
      'metaInfo.isFeatured': true
    }).sort({ 'metaInfo.popularityScore': -1 });

    res.status(200).json({ success: true, count: turfs.length, data: turfs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTrendingTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find({
      status: 'active',
      'metaInfo.isApproved': true,
      'metaInfo.isTrending': true
    }).sort({ 'metaInfo.popularityScore': -1 });

    res.status(200).json({ success: true, count: turfs.length, data: turfs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTurfAvailability = async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id).select('availability pricing turfDetails location status metaInfo');
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    if (!canAccessTurf(turf, req.user)) {
      return res.status(404).json({ success: false, error: 'Turf not found' });
    }

    const { date } = req.query;
    let bookedSlots = [];

    if (date) {
      bookedSlots = await Booking.find({
        turf: turf._id,
        date: new Date(date),
        bookingStatus: { $ne: 'cancelled' }
      }).select('timeSlot bookingStatus paymentStatus');
    }

    res.status(200).json({
      success: true,
      data: {
        turf,
        bookedSlots
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
