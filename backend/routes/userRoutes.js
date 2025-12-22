const express = require('express');
const { getProfile, updateProfile, updateSettings } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 个人信息
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// 更新用户设置
router.put('/settings', protect, updateSettings);

module.exports = router;
