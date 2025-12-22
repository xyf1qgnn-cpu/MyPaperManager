const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// @desc    用户注册
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      return res.status(400).json({ message: '邮箱已被注册' });
    }
    
    // 创建新用户
    const user = await User.create({ username, email, password });
    
    // 生成令牌
    const token = generateToken(user._id);
    
    // 返回用户信息和令牌
    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  console.log('Login request body:', req.body); // 添加日志
  try {
    const { email, password } = req.body;
    
    // 检查用户是否存在
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }
    
    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }
    
    // 生成令牌
    const token = generateToken(user._id);
    
    // 返回用户信息和令牌
    res.status(200).json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
};

// @desc    获取当前用户信息
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // 从req.user中获取用户信息（由protect中间件设置）
    const user = req.user;
    res.status(200).json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ message: '获取用户信息失败，请稍后重试' });
  }
};

// @desc    更新用户信息
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user._id;
    
    // 检查用户名和邮箱是否已被其他用户使用
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: userId }
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      return res.status(400).json({ message: '邮箱已被注册' });
    }
    
    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: '用户信息更新成功',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ message: '更新用户信息失败，请稍后重试' });
  }
};

// @desc    更改密码
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // 获取用户并包含密码
    const user = await User.findById(userId).select('+password');
    
    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码失败:', error);
    res.status(500).json({ message: '更改密码失败，请稍后重试' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword
};