const dotenv = require('dotenv');
const path = require('path');

// 加载.env文件
dotenv.config({
  path: path.join(__dirname, '../.env')
});

// 配置导出
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    allowedOrigins: process.env.ALLOWED_ORIGINS || '*'
  },
  
  // 数据库配置
  database: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/literature-management-system'
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || './public/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // AI配置
  ai: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
  }
};