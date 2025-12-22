const mongoose = require('mongoose');

// 数据库连接配置
const connectDB = async () => {
  try {
    // 从环境变量获取数据库URL，否则使用默认值
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/literature-management-system';
    
    await mongoose.connect(mongoURI);
    
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error.message);
    // 连接失败时退出进程
    process.exit(1);
  }
};

// 导出数据库连接函数
module.exports = connectDB;