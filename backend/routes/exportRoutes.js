const express = require('express');
const {
  exportSingle,
  exportBatch,
  exportFavorites,
  exportAll,
  preview
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 预览导出
router.post('/preview', protect, preview);

// 批量导出
router.post('/batch', protect, exportBatch);

// 导出收藏夹
router.get('/favorites', protect, exportFavorites);

// 导出全部
router.get('/all', protect, exportAll);

// 导出单个文献
router.get('/:id', protect, exportSingle);

module.exports = router;

