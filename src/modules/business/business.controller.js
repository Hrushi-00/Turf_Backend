const turfController = require('../turf/turf.controller');
const bookingController = require('../booking/booking.controller');

const getTurfs = async (req, res) => {
  const result = await turfController.getAdminTurfs(req, res);
};

const addTurf = async (req, res) => {
  const result = await turfController.addTurf(req, res);
};

const updateTurf = async (req, res) => {
  const result = await turfController.updateTurf(req, res);
};

const deleteTurf = async (req, res) => {
  const result = await turfController.deleteTurf(req, res);
};

const getBookings = async (req, res) => {
  const result = await bookingController.getAdminBookings(req, res);
};

const getBookingStats = async (req, res) => {
  const result = await turfController.getBookingStats(req, res);
};

const updateBookingStatus = async (req, res) => {
  const result = await bookingController.updateBookingStatus(req, res);
};

module.exports = {
  getTurfs,
  addTurf,
  updateTurf,
  deleteTurf,
  getBookings,
  getBookingStats,
  updateBookingStatus
};
