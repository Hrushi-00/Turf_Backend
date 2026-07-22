const userService = require('./user.service');

const signup = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, profileImage } = req.body;

    if (!name || !email || !password || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'name, email, password, and contactNumber are required'
      });
    }

    const result = await userService.signup({ name, email, password, contactNumber, address, profileImage });
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

    const result = await userService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const result = await userService.getProfile(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { name, email, contactNumber, address, profileImage } = req.body;
    const result = await userService.updateProfile(userId, { name, email, contactNumber, address, profileImage });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required'
      });
    }

    const result = await userService.changePassword(userId, { currentPassword, newPassword });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const result = await userService.deleteAccount(userId);
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
  changePassword,
  deleteAccount
};
