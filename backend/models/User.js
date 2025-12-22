const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请提供用户名'],
    unique: true,
    trim: true,
    minlength: [3, '用户名长度不能少于3个字符'],
    maxlength: [20, '用户名长度不能超过20个字符']
  },
  email: {
    type: String,
    required: [true, '请提供邮箱'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请提供有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: [6, '密码长度不能少于6个字符'],
    select: false // 查询时不返回密码
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: [200, '简介长度不能超过200个字符']
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  settings: {
    deepseekApiKey: {
      type: String,
      select: false // 查询时不返回 API Key
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有当密码被修改或创建时才加密
  if (!this.isModified('password')) {
    next();
    return;
  }
  
  // 生成盐并加密密码
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);