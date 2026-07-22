const businessService = require('./business.service');

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    const result = await businessService.signup({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
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

    const result = await businessService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const businessUserId = req.userId || req.user?._id;
    const result = await businessService.getProfile(businessUserId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const businessUserId = req.userId || req.user?._id;
    const { username, email } = req.body;
    const result = await businessService.updateProfile(businessUserId, { username, email });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const businessUserId = req.userId || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    const result = await businessService.changePassword(businessUserId, { currentPassword, newPassword });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword
};
