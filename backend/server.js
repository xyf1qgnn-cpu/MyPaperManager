const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/database');
const config = require('./config');

// 初始化Express应用
const app = express();
const PORT = config.server.port;

// 中间件配置
app.use(cors({
  origin: true, // 允许任何来源，并自动设置 Access-Control-Allow-Origin 为请求的 Origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));
// 开启 /api/files 静态文件服务
app.use('/api/files', express.static(path.resolve(config.upload.path)));

// 数据库连接
connectDB();

// 导入路由
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const annotationRoutes = require('./routes/annotationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const collectionRoutes = require('./routes/collectionRoutes');

// 确保uploads目录存在
const fs = require('fs');
const uploadDir = config.upload.path;
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// API路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '文献管理系统后端服务运行正常' });
});

// 使用认证路由
app.use('/api/auth', authRoutes);

// 使用上传路由
app.use('/api/upload', uploadRoutes);

// 使用用户路由
app.use('/api/user', userRoutes);

// 使用文献路由
app.use('/api/documents', documentRoutes);

// 使用笔记路由
app.use('/api/notes', noteRoutes);

// 使用标注路由
app.use('/api/annotations', annotationRoutes);

// 使用AI路由
app.use('/api/ai', aiRoutes);

// 使用目录路由
app.use('/api/collections', collectionRoutes);

// 静态文件服务 - 提供前端页面和上传的文件
app.use('/uploads', express.static(path.resolve(config.upload.path)));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message || '服务器内部错误' 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`文件上传目录: ${uploadDir}`);
});
