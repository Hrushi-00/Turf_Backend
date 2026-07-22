const Auth = require('./auth.model');

const buildAdminPayload = (admin) => ({
  id: admin._id,
  username: admin.username,
  email: admin.email,
  role: admin.role
});

const register = async (data) => {
  const { username, email, password } = data;

  const existingAdmin = await Auth.findOne({ email });
  if (existingAdmin) {
    throw new Error('Admin already exists');
  }

  const admin = await Auth.create({
    username,
    email,
    password,
    role: 'Admin'
  });

  const token = admin.getSignedJwtToken();
  return { success: true, token, admin: buildAdminPayload(admin) };
};

const login = async (data) => {
  const { email, password } = data;

  const admin = await Auth.findOne({ email });
  if (!admin || admin.role === 'BusinessUser') {
    throw new Error('Invalid credentials');
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = admin.getSignedJwtToken();
  return { success: true, token, admin: buildAdminPayload(admin) };
};

const getProfile = async (adminId) => {
  const admin = await Auth.findById(adminId).select('-password');
  if (!admin || (admin.role !== 'Admin' && admin.role !== 'SuperAdmin')) {
    throw new Error('Admin not found');
  }
  return { success: true, admin };
};

const updateProfile = async (adminId, data) => {
  const admin = await Auth.findById(adminId);
  if (!admin || (admin.role !== 'Admin' && admin.role !== 'SuperAdmin')) {
    throw new Error('Admin not found');
  }

  const { username, email } = data;
  if (username !== undefined) admin.username = username;
  if (email !== undefined) admin.email = email;
  await admin.save();

  return {
    success: true,
    message: 'Profile updated successfully',
    admin: buildAdminPayload(admin)
  };
};

const changePassword = async (adminId, data) => {
  const { currentPassword, newPassword } = data;
  const admin = await Auth.findById(adminId);
  if (!admin || (admin.role !== 'Admin' && admin.role !== 'SuperAdmin')) {
    throw new Error('Admin not found');
  }

  const isMatch = await admin.matchPassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  admin.password = newPassword;
  await admin.save();
  return { success: true, message: 'Password changed successfully' };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  buildAdminPayload
};
