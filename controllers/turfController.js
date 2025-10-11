const Turf = require('../models/turfModel');
const cloudinary = require('../config/cloudinary');

// Create new turf
exports.addTurf = async (req, res) => {
  try {
    const turfData = { ...req.body };
    
    // Handle image uploads
    if (req.files) {
      // Upload main image
      if (req.files.mainImage) {
        const mainImageResult = await cloudinary.uploader.upload(
          req.files.mainImage.tempFilePath,
          { folder: 'turfs/main' }
        );
        turfData.gallery = turfData.gallery || {};
        turfData.gallery.mainImage = mainImageResult.secure_url;
      }
      
      // Upload thumbnail images
      if (req.files.thumbnailImages) {
        const thumbnailImages = Array.isArray(req.files.thumbnailImages) 
          ? req.files.thumbnailImages 
          : [req.files.thumbnailImages];
          
        const thumbnailPromises = thumbnailImages.map(image => 
          cloudinary.uploader.upload(image.tempFilePath, { folder: 'turfs/thumbnails' })
        );
        
        const thumbnailResults = await Promise.all(thumbnailPromises);
        turfData.gallery = turfData.gallery || {};
        turfData.gallery.thumbnailImages = thumbnailResults.map(result => result.secure_url);
      }
    }
    
    const turf = new Turf(turfData);
    await turf.save();
    res.status(201).json({
      success: true,
      data: turf,
      message: 'Turf created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all turfs
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find();
    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
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
    const turfData = { ...req.body };
    
    // Handle image uploads
    if (req.files) {
      // Upload main image
      if (req.files.mainImage) {
        const mainImageResult = await cloudinary.uploader.upload(
          req.files.mainImage.tempFilePath,
          { folder: 'turfs/main' }
        );
        turfData.gallery = turfData.gallery || {};
        turfData.gallery.mainImage = mainImageResult.secure_url;
      }
      
      // Upload thumbnail images
      if (req.files.thumbnailImages) {
        const thumbnailImages = Array.isArray(req.files.thumbnailImages) 
          ? req.files.thumbnailImages 
          : [req.files.thumbnailImages];
          
        const thumbnailPromises = thumbnailImages.map(image => 
          cloudinary.uploader.upload(image.tempFilePath, { folder: 'turfs/thumbnails' })
        );
        
        const thumbnailResults = await Promise.all(thumbnailPromises);
        turfData.gallery = turfData.gallery || {};
        turfData.gallery.thumbnailImages = thumbnailResults.map(result => result.secure_url);
      }
    }
    
    const turf = await Turf.findByIdAndUpdate(req.params.id, turfData, {
      new: true,
      runValidators: true
    });
    
    if (!turf) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: turf,
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
    const allowedUpdates = [
      'isApproved',
      'isFeatured',
      'isTrending',
      'popularityScore'
    ];

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
    const turf = await Turf.findByIdAndDelete(req.params.id);
    if (!turf) {
      return res.status(404).json({
        success: false,
        error: 'Turf not found'
      });
    }
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