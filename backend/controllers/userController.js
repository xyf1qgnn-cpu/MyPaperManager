const User = require('../models/User');

// @desc    获取当前用户详细信息
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('获取个人信息失败:', error);
    res.status(500).json({ message: '获取个人信息失败' });
  }
};

// @desc    更新用户信息 (改名、头像URL、简介)
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, avatar, bio } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (username) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      role: updatedUser.role,
      favorites: updatedUser.favorites
    });
  } catch (error) {
    console.error('更新个人信息失败:', error);
    res.status(500).json({ message: '更新个人信息失败' });
  }
};

// @desc    更新用户设置 (API Key)
// @route   PUT /api/user/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { deepseekApiKey } = req.body;
    const userId = req.user._id;

    // 简单验证
    if (!deepseekApiKey) {
      return res.status(400).json({ message: 'API Key 不能为空' });
    }

    // 更新用户设置
    // 注意：这里我们直接存储了 API Key。在生产环境中，应该加密存储。
    const user = await User.findById(userId);
    
    if (!user) {
        return res.status(404).json({ message: '用户不存在' });
    }

    if (!user.settings) {
        user.settings = {};
    }
    
    user.settings.deepseekApiKey = deepseekApiKey;
    await user.save();

    res.status(200).json({ message: '设置更新成功' });
  } catch (error) {
    console.error('更新设置失败:', error);
    res.status(500).json({ message: '更新设置失败，请稍后重试' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateSettings
};
