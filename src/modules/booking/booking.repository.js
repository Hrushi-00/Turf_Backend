const Booking = require('./booking.model');

const create = async (data) => {
  return Booking.create(data);
};

const findById = async (id) => {
  return Booking.findById(id);
};

const findOne = async (query) => {
  return Booking.findOne(query);
};

const find = async (query) => {
  return Booking.find(query);
};

const findByIdAndUpdate = async (id, update, options) => {
  return Booking.findByIdAndUpdate(id, update, options);
};

const updateById = async (id, update, options) => {
  return Booking.findByIdAndUpdate(id, update, options);
};

const countDocuments = async (query) => {
  return Booking.countDocuments(query);
};

const aggregate = async (pipeline) => {
  return Booking.aggregate(pipeline);
};

module.exports = {
  create,
  findById,
  findOne,
  find,
  findByIdAndUpdate,
  updateById,
  countDocuments,
  aggregate
};
