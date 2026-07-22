const User = require('./user.model');

const create = async (userData) => {
  return User.create(userData);
};

const findByEmail = async (email) => {
  return User.findOne({ email });
};

const findById = async (id) => {
  return User.findById(id).select('-password');
};

const findByIdAndUpdate = async (id, update) => {
  return User.findByIdAndUpdate(id, update, { new: true });
};

const deleteById = async (id) => {
  return User.findByIdAndDelete(id);
};

module.exports = {
  create,
  findByEmail,
  findById,
  findByIdAndUpdate,
  deleteById
};
