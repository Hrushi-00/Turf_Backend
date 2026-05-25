const Admin = require('../models/authModel');

const buildAdminPayload = (admin) => ({
  id: admin._id,
  username: admin.username,
  email: admin.email,
  role: admin.role
});

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({
      username,
      email,
      password,
      role: 'Admin'
    });

    const token = admin.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      admin: buildAdminPayload(admin)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

    const admin = await Admin.findOne({ email });
    if (!admin || admin.role === 'BusinessUser') {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = admin.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      admin: buildAdminPayload(admin)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const adminId = req.userId || req.user?._id;
    const admin = await Admin.findById(adminId).select('-password');

    if (!admin || (admin.role !== 'Admin' && admin.role !== 'SuperAdmin')) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.status(200).json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const adminId = req.userId || req.user?._id;
    const admin = await Admin.findById(adminId);

    if (!admin || (admin.role !== 'Admin' && admin.role !== 'SuperAdmin')) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const { username, email } = req.body;

    if (username !== undefined) admin.username = username;
    if (email !== undefined) admin.email = email;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      admin: buildAdminPayload(admin)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const adminId = req.userId || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin || (admin.role !== 'Admin' && admin.role !== 'SuperAdmin')) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
