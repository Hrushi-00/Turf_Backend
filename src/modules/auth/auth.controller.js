const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    const result = await authService.register({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required'
      });
    }

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const adminId = req.userId || req.user?._id;
    const result = await authService.getProfile(adminId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const adminId = req.userId || req.user?._id;
    const { username, email } = req.body;
    const result = await authService.updateProfile(adminId, { username, email });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const adminId = req.userId || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    const result = await authService.changePassword(adminId, { currentPassword, newPassword });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
