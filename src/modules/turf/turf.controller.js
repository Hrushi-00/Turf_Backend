const turfService = require('./turf.service');

const addTurf = async (req, res) => {
  try {
    const turfData = JSON.parse(JSON.stringify(req.body));
    const result = await turfService.addTurf({
      turfData,
      files: req.files,
      user: req.user
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllTurfs = async (req, res) => {
  try {
    const result = await turfService.getAllTurfs(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAdminTurfs = async (req, res) => {
  try {
    const result = await turfService.getAdminTurfs(req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTurf = async (req, res) => {
  try {
    const result = await turfService.getTurf({ id: req.params.id }, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTurf = async (req, res) => {
  try {
    const turfData = JSON.parse(JSON.stringify(req.body));
    const result = await turfService.updateTurf(
      { id: req.params.id, turfData, files: req.files },
      req.user
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateTurfMetaInfo = async (req, res) => {
  try {
    const result = await turfService.updateTurfMetaInfo(
      { id: req.params.id },
      req.body
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteTurf = async (req, res) => {
  try {
    const result = await turfService.deleteTurf({ id: req.params.id }, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBookingStats = async (req, res) => {
  try {
    const result = await turfService.getBookingStats(req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const approveTurf = async (req, res) => {
  try {
    const result = await turfService.approveTurf(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const rejectTurf = async (req, res) => {
  try {
    const result = await turfService.rejectTurf(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFeaturedTurfs = async (req, res) => {
  try {
    const result = await turfService.getFeaturedTurfs();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTrendingTurfs = async (req, res) => {
  try {
    const result = await turfService.getTrendingTurfs();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getApprovedTurfs = async (req, res) => {
  try {
    const result = await turfService.getApprovedTurfs();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTurfAvailability = async (req, res) => {
  try {
    const result = await turfService.getTurfAvailability({
      id: req.params.id,
      date: req.query.date
    }, req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
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
