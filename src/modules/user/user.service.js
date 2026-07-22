const User = require('./user.model');

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  contactNumber: user.contactNumber,
  profileImage: user.profileImage,
  address: user.address,
  role: user.role
});

const signup = async (data) => {
  const { name, email, password, contactNumber, address, profileImage } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    contactNumber,
    address,
    profileImage
  });

  const token = user.getSignedJwtToken();
  return {
    success: true,
    token,
    user: buildUserPayload(user)
  };
};

const login = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = user.getSignedJwtToken();
  return {
    success: true,
    message: 'Login successful',
    token,
    user: buildUserPayload(user)
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('bookings');

  if (!user) {
    throw new Error('User not found');
  }
  return { success: true, user };
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const { name, email, contactNumber, address, profileImage } = data;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (contactNumber !== undefined) user.contactNumber = contactNumber;
  if (address !== undefined) user.address = address;
  if (profileImage !== undefined) user.profileImage = profileImage;
  await user.save();

  return {
    success: true,
    message: 'Profile updated successfully',
    user: buildUserPayload(user)
  };
};

const changePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data;
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  return { success: true, message: 'Password changed successfully' };
};

const deleteAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  await user.deleteOne();
  return { success: true, message: 'Account deleted successfully' };
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  buildUserPayload
};
