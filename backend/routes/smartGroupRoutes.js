const express = require('express');
const {
  getSmartGroups,
  getPresets,
  createSmartGroup,
  updateSmartGroup,
  deleteSmartGroup,
  getSmartGroupDocuments,
  parseNaturalLanguage,
  createFromNaturalLanguage
} = require('../controllers/smartGroupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 预设分组
router.get('/presets', protect, getPresets);

// 自然语言解析
router.post('/parse', protect, parseNaturalLanguage);

// 从自然语言创建分组
router.post('/from-natural-language', protect, createFromNaturalLanguage);

// 获取分组内文献
router.get('/:id/documents', protect, getSmartGroupDocuments);

// 基础 CRUD
router.route('/')
  .get(protect, getSmartGroups)
  .post(protect, createSmartGroup);

router.route('/:id')
  .put(protect, updateSmartGroup)
  .delete(protect, deleteSmartGroup);

module.exports = router;

