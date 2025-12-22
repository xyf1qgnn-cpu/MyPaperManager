const multer = require('multer');
const path = require('path');
const config = require('../config');

// 确保上传目录存在
const fs = require('fs');
const uploadPath = config.upload.path;
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // 使用时间戳和原始文件名生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
    // 只允许PDF文件
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('只允许上传PDF文件'), false);
    }
};

// 创建上传中间件
const upload = multer({
    storage: storage,
    limits: {
        fileSize: config.upload.maxFileSize // 50MB
    },
    fileFilter: fileFilter
});

module.exports = upload;