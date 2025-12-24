const express = require('express');
const {
  getOverview,
  getKeywordStats,
  getJournalStats,
  getTagStats,
  getReadingStats,
  generateReport
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 统计总览
router.get('/overview', protect, getOverview);

// 关键词统计
router.get('/keywords', protect, getKeywordStats);

// 期刊分布
router.get('/journals', protect, getJournalStats);

// 标签统计
router.get('/tags', protect, getTagStats);

// 阅读统计
router.get('/reading', protect, getReadingStats);

// 生成报告
router.post('/report', protect, generateReport);

module.exports = router;

