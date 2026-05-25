const BusinessUser = require('../models/authModel');

const buildBusinessPayload = (businessUser) => ({
  id: businessUser._id,
  username: businessUser.username,
  email: businessUser.email,
  role: businessUser.role
});

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    const existingUser = await BusinessUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Business user already exists' });
    }

    const businessUser = await BusinessUser.create({
      username,
      email,
      password,
      role: 'BusinessUser'
    });

    const token = businessUser.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      businessUser: buildBusinessPayload(businessUser)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required'
      });
    }

    const businessUser = await BusinessUser.findOne({ email });
    if (!businessUser || businessUser.role !== 'BusinessUser') {
      return res.status(404).json({ success: false, message: 'Business user not found' });
    }

    const isMatch = await businessUser.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = businessUser.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      businessUser: buildBusinessPayload(businessUser)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const businessUserId = req.userId || req.user?._id;
    const businessUser = await BusinessUser.findById(businessUserId).select('-password');

    if (!businessUser || businessUser.role !== 'BusinessUser') {
      return res.status(404).json({ success: false, message: 'Business user not found' });
    }

    res.status(200).json({ success: true, businessUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const businessUserId = req.userId || req.user?._id;
    const businessUser = await BusinessUser.findById(businessUserId);

    if (!businessUser || businessUser.role !== 'BusinessUser') {
      return res.status(404).json({ success: false, message: 'Business user not found' });
    }

    const { username, email } = req.body;

    if (username !== undefined) businessUser.username = username;
    if (email !== undefined) businessUser.email = email;

    await businessUser.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      businessUser: buildBusinessPayload(businessUser)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const businessUserId = req.userId || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    const businessUser = await BusinessUser.findById(businessUserId);
    if (!businessUser || businessUser.role !== 'BusinessUser') {
      return res.status(404).json({ success: false, message: 'Business user not found' });
    }

    const isMatch = await businessUser.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    businessUser.password = newPassword;
    await businessUser.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
