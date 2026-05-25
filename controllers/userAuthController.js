const User = require('../models/userModel');

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  contactNumber: user.contactNumber,
  profileImage: user.profileImage,
  address: user.address,
  role: user.role
});

const buildToken = (user) => user.getSignedJwtToken();

// User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, profileImage } = req.body;

    if (!name || !email || !password || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password, and contactNumber are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      contactNumber,
      address,
      profileImage
    });

    const token = buildToken(user);

    res.status(201).json({
      success: true,
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = buildToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// Get logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('bookings');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, contactNumber, address, profileImage } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    if (address !== undefined) user.address = address;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: buildUserPayload(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
