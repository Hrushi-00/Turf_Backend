const Auth = require('./auth.model');

const buildAdminPayload = (admin) => ({
  id: admin._id,
  username: admin.username,
  email: admin.email,
  role: admin.role
});

const createAdmin = async (adminData) => {
  return Auth.create(adminData);
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
  createAdmin,
  findByEmail,
  findById,
  findByIdAndUpdate,
  buildAdminPayload
};
