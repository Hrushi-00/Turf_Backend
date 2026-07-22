const Auth = require('./auth.model');

const createBusinessUser = async (userData) => {
  return Auth.create(userData);
};

const findByEmail = async (email) => {
  return Auth.findOne({ email });
};

const findById = async (id) => {
  return Auth.findById(id).select('-password');
};

const findByIdAndUpdate = async (id, update) => {
  return Auth.findByIdAndUpdate(id, update, { new: true });
};

module.exports = {
  createBusinessUser,
  findByEmail,
  findById,
  findByIdAndUpdate
};
