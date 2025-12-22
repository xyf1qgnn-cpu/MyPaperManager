const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// 认证中间件 - 验证JWT令牌
const protect = async (req, res, next) => {
  let token;
  
  // 从请求头获取令牌
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 提取令牌
      token = req.headers.authorization.split(' ')[1];
      
      // 验证令牌
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // 获取用户信息但不包含密码
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error('JWT验证失败:', error);
      res.status(401).json({ message: '未授权访问 - 令牌无效' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: '未授权访问 - 缺少令牌' });
  }
};

// 权限中间件 - 验证用户角色
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足，无法访问此资源' });
    }
    next();
  };
};

module.exports = { protect, authorize };