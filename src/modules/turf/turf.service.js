const Turf = require('./turf.model');
const Booking = require('../booking/booking.model');
const cloudinary = require('../../config/cloudinary');

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

const addTurf = async (data) => {
  const { turfData, files, user } = data;

  turfData.ownerDetails = turfData.ownerDetails || {};
  if (user.role === 'BusinessUser') {
    turfData.ownerDetails.businessUserId = user._id;
  } else {
    turfData.ownerDetails.adminId = user._id;
  }
  if (!turfData.ownerDetails.name) turfData.ownerDetails.name = user.username;
  if (!turfData.ownerDetails.email) turfData.ownerDetails.email = user.email;

  await uploadGallery(files, turfData);

  const turf = await Turf.create(turfData);

  return {
    success: true,
    message: 'Turf created successfully',
    data: turf
  };
};

const getAllTurfs = async (filters) => {
  const { city, sport, q, featured, trending, page = 1, limit = 20 } = filters;
  const query = { status: 'active', 'metaInfo.isApproved': true };

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

  return {
    success: true,
    count: turfs.length,
    total,
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
    data: turfs
  };
};

const getAdminTurfs = async (user) => {
  let query = {};
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
    query = {
      $or: [
        { 'ownerDetails.businessUserId': user._id },
        { 'ownerDetails.adminId': user._id }
      ]
    };
  }

  const turfs = await Turf.find(query).sort({ createdAt: -1 });

  return {
    success: true,
    count: turfs.length,
    data: turfs
  };
};

const getTurf = async (params, user) => {
  const turf = await Turf.findById(params.id);
  if (!turf) {
    throw new Error('Turf not found');
  }

  if (!canAccessTurf(turf, user)) {
    throw new Error('Turf not found');
  }

  return {
    success: true,
    data: turf
  };
};

const updateTurf = async (params, user, updateData) => {
  const { id, turfData, files } = params;
  
  const turf = await Turf.findById(id);
  if (!turf) {
    throw new Error('Turf not found');
  }

  if (!canAccessTurf(turf, user)) {
    throw new Error('You are not allowed to update this turf');
  }

  await uploadGallery(files, turfData);

  const updatedTurf = await Turf.findByIdAndUpdate(id, turfData, {
    new: true,
    runValidators: true
  });

  return {
    success: true,
    data: updatedTurf,
    message: 'Turf updated successfully'
  };
};

const updateTurfMetaInfo = async (params, body) => {
  const { id } = params;
  const allowedUpdates = ['isApproved', 'isFeatured', 'isTrending', 'popularityScore'];
  const updates = {};

  for (const key of allowedUpdates) {
    if (body[key] !== undefined) {
      updates[`metaInfo.${key}`] = body[key];
    }
  }

  const turf = await Turf.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!turf) {
    throw new Error('Turf not found');
  }

  return {
    success: true,
    data: turf.metaInfo,
    message: 'Turf meta info updated successfully'
  };
};

const deleteTurf = async (params, user) => {
  const { id } = params;
  const turf = await Turf.findById(id);
  if (!turf) {
    throw new Error('Turf not found');
  }

  if (!canAccessTurf(turf, user)) {
    throw new Error('You are not allowed to delete this turf');
  }

  await turf.deleteOne();

  return {
    success: true,
    message: 'Turf deleted successfully'
  };
};

const getBookingStats = async (user) => {
  const match =
    user.role === 'Admin' || user.role === 'SuperAdmin'
      ? {}
      : { admin: user._id };

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

  return {
    success: true,
    data: stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      paidBookings: 0,
      pendingBookings: 0
    }
  };
};

const approveTurf = async (id) => {
  const turf = await Turf.findByIdAndUpdate(
    id,
    {
      status: 'active',
      'metaInfo.isApproved': true
    },
    { new: true }
  );

  if (!turf) {
    throw new Error('Turf not found');
  }

  return {
    success: true,
    data: turf,
    message: 'Turf approved successfully'
  };
};

const rejectTurf = async (id) => {
  const turf = await Turf.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      'metaInfo.isApproved': false
    },
    { new: true }
  );

  if (!turf) {
    throw new Error('Turf not found');
  }

  return {
    success: true,
    data: turf,
    message: 'Turf rejected successfully'
  };
};

const getFeaturedTurfs = async () => {
  const turfs = await Turf.find({
    status: 'active',
    'metaInfo.isApproved': true,
    'metaInfo.isFeatured': true
  }).sort({ 'metaInfo.popularityScore': -1 });

  return { success: true, count: turfs.length, data: turfs };
};

const getTrendingTurfs = async () => {
  const turfs = await Turf.find({
    status: 'active',
    'metaInfo.isApproved': true,
    'metaInfo.isTrending': true
  }).sort({ 'metaInfo.popularityScore': -1 });

  return { success: true, count: turfs.length, data: turfs };
};

const getApprovedTurfs = async () => {
  const turfs = await Turf.find({ status: 'active', 'metaInfo.isApproved': true });
  return {
    success: true,
    count: turfs.length,
    data: turfs
  };
};

const getTurfAvailability = async (params, user) => {
  const { id, date } = params;
  const turf = await Turf.findById(id).select('availability pricing turfDetails location status metaInfo');
  if (!turf) {
    throw new Error('Turf not found');
  }

  if (!canAccessTurf(turf, user)) {
    throw new Error('Turf not found');
  }

  let bookedSlots = [];

  if (date) {
    bookedSlots = await Booking.find({
      turf: turf._id,
      date: new Date(date),
      bookingStatus: { $ne: 'cancelled' }
    }).select('timeSlot bookingStatus paymentStatus');
  }

  return {
    success: true,
    data: {
      turf,
      bookedSlots
    }
  };
};

module.exports = {
  addTurf,
  getAllTurfs,
  getAdminTurfs,
  getTurf,
  updateTurf,
  updateTurfMetaInfo,
  deleteTurf,
  getBookingStats,
  approveTurf,
  rejectTurf,
  getFeaturedTurfs,
  getTrendingTurfs,
  getApprovedTurfs,
  getTurfAvailability
};
