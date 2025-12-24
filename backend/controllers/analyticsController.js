const Document = require('../models/Document');
const mongoose = require('mongoose');

// 获取总览统计
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalCount,
      byYear,
      byAuthor,
      byStatus,
      byRating,
      recentlyAdded,
      favoriteCount
    ] = await Promise.all([
      // 总文献数
      Document.countDocuments({ owner: userId }),
      
      // 按年份分布
      Document.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 20 }
      ]),
      
      // 高产作者 TOP10
      Document.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $unwind: '$authors' },
        { $group: { _id: '$authors', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // 按状态分布
      Document.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // 按评分分布
      Document.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      
      // 最近30天添加趋势
      Document.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // 收藏数量
      Document.countDocuments({ owner: userId, isFavorite: true })
    ]);

    // 计算阅读进度
    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });
    const readCount = (statusMap['已读'] || 0) + (statusMap['重点'] || 0);
    const readingProgress = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

    res.json({
      status: 'success',
      data: {
        summary: {
          totalCount,
          favoriteCount,
          readCount,
          unreadCount: statusMap['未读'] || 0,
          readingProgress
        },
        byYear: byYear.map(item => ({
          year: item._id || '未知',
          count: item.count
        })),
        byAuthor: byAuthor.map(item => ({
          author: item._id || '未知作者',
          count: item.count
        })),
        byStatus: byStatus.map(item => ({
          status: item._id || '未知',
          count: item.count
        })),
        byRating: byRating.map(item => ({
          rating: item._id || 0,
          count: item.count
        })),
        recentlyAdded: recentlyAdded.map(item => ({
          date: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('获取统计总览失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取统计数据失败'
    });
  }
};

// 获取关键词统计
exports.getKeywordStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const keywords = await Document.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$keywords' },
      { $group: { _id: '$keywords', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      status: 'success',
      data: keywords.map(item => ({
        keyword: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('获取关键词统计失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取关键词统计失败'
    });
  }
};

// 获取期刊分布
exports.getJournalStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const journals = await Document.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId), journal: { $ne: null, $ne: '' } } },
      { $group: { _id: '$journal', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json({
      status: 'success',
      data: journals.map(item => ({
        journal: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('获取期刊统计失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取期刊统计失败'
    });
  }
};

// 获取标签统计
exports.getTagStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const tags = await Document.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      status: 'success',
      data: tags.map(item => ({
        tag: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('获取标签统计失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取标签统计失败'
    });
  }
};

// 获取阅读统计
exports.getReadingStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // 按日期统计更新的文献（近似阅读活动）
    const readingActivity = await Document.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
          updatedAt: { $gte: startDate },
          status: { $in: ['已读', '重点'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 计算本周阅读数
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekCount = await Document.countDocuments({
      owner: userId,
      updatedAt: { $gte: weekStart },
      status: { $in: ['已读', '重点'] }
    });

    // 计算本月阅读数
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthCount = await Document.countDocuments({
      owner: userId,
      updatedAt: { $gte: monthStart },
      status: { $in: ['已读', '重点'] }
    });

    res.json({
      status: 'success',
      data: {
        activity: readingActivity.map(item => ({
          date: item._id,
          count: item.count
        })),
        thisWeekCount,
        thisMonthCount
      }
    });
  } catch (error) {
    console.error('获取阅读统计失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取阅读统计失败'
    });
  }
};

// 生成分析报告
exports.generateReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.body;

    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 获取期间内的文献数据
    const [added, read, topAuthors, topKeywords] = await Promise.all([
      Document.countDocuments({
        owner: userId,
        createdAt: { $gte: startDate }
      }),
      Document.countDocuments({
        owner: userId,
        updatedAt: { $gte: startDate },
        status: { $in: ['已读', '重点'] }
      }),
      Document.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$authors' },
        { $group: { _id: '$authors', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Document.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: startDate }
          }
        },
        { $unwind: '$keywords' },
        { $group: { _id: '$keywords', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    const periodName = period === 'week' ? '本周' : period === 'month' ? '本月' : '今年';

    res.json({
      status: 'success',
      data: {
        period: periodName,
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
        summary: {
          addedCount: added,
          readCount: read
        },
        highlights: {
          topAuthors: topAuthors.map(a => ({ name: a._id, count: a.count })),
          topKeywords: topKeywords.map(k => ({ name: k._id, count: k.count }))
        }
      }
    });
  } catch (error) {
    console.error('生成报告失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '生成报告失败'
    });
  }
};

