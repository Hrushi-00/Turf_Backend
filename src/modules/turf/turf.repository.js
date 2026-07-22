const Turf = require('./turf.model');

const create = async (data) => {
  return Turf.create(data);
};

const findById = async (id) => {
  return Turf.findById(id);
};

const findByIdAndUpdate = async (id, update, options) => {
  return Turf.findByIdAndUpdate(id, update, options);
};

const find = async (query) => {
  return Turf.find(query);
};

const countDocuments = async (query) => {
  return Turf.countDocuments(query);
};

const deleteOne = async (query) => {
  return Turf.deleteOne(query);
};

module.exports = {
  create,
  findById,
  findByIdAndUpdate,
  find,
  countDocuments,
  deleteOne
};
