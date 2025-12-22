const express = require('express');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// 基础文件上传 - POST /api/upload
router.post('/', protect, upload.single('file'), uploadController.uploadFile);

// PDF解析上传 - POST /api/upload/parse-pdf
router.post('/parse-pdf', protect, upload.single('file'), uploadController.parsePdf);

module.exports = router;
