const SmartGroup = require('../models/SmartGroup');
const Document = require('../models/Document');
const aiService = require('../services/aiService');

// 预设智能分组规则
const PRESET_RULES = {
  'recent-high-impact': {
    name: '近5年高影响力',
    icon: 'fire',
    color: '#ff6b6b',
    filter: {
      year: { $gte: new Date().getFullYear() - 5 }
    },
    sort: { year: -1, rating: -1 }
  },
  'unread': {
    name: '未读文献',
    icon: 'book',
    color: '#4ecdc4',
    filter: { status: '未读' },
    sort: { createdAt: -1 }
  },
  'this-month': {
    name: '本月添加',
    icon: 'calendar',
    color: '#45b7d1',
    filter: {
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    },
    sort: { createdAt: -1 }
  },
  'favorites': {
    name: '收藏文献',
    icon: 'heart',
    color: '#f7b731',
    filter: { isFavorite: true },
    sort: { updatedAt: -1 }
  },
  'important': {
    name: '重点文献',
    icon: 'star',
    color: '#eb3b5a',
    filter: { status: '重点' },
    sort: { updatedAt: -1 }
  },
  'recent-read': {
    name: '最近阅读',
    icon: 'eye',
    color: '#8854d0',
    filter: { status: { $in: ['已读', '重点'] } },
    sort: { updatedAt: -1 }
  }
};

// 获取所有智能分组
exports.getSmartGroups = async (req, res) => {
  try {
    const smartGroups = await SmartGroup.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // 为每个分组计算文档数量
    const groupsWithCount = await Promise.all(
      smartGroups.map(async (group) => {
        const count = await Document.countDocuments({
          owner: req.user._id,
          ...group.rules.filter
        });
        return {
          ...group.toObject(),
          documentCount: count
        };
      })
    );

    res.json({
      status: 'success',
      data: groupsWithCount
    });
  } catch (error) {
    console.error('获取智能分组失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取智能分组失败'
    });
  }
};

// 获取预设分组列表
exports.getPresets = async (req, res) => {
  try {
    const presetsWithCount = await Promise.all(
      Object.entries(PRESET_RULES).map(async ([key, preset]) => {
        const count = await Document.countDocuments({
          owner: req.user._id,
          ...preset.filter
        });
        return {
          key,
          ...preset,
          documentCount: count
        };
      })
    );

    res.json({
      status: 'success',
      data: presetsWithCount
    });
  } catch (error) {
    console.error('获取预设分组失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取预设分组失败'
    });
  }
};

// 创建智能分组
exports.createSmartGroup = async (req, res) => {
  try {
    const { name, type, icon, color, rules } = req.body;

    const smartGroup = await SmartGroup.create({
      user: req.user._id,
      name,
      type: type || 'custom',
      icon: icon || 'folder',
      color: color || '#00d4ff',
      rules: rules || {}
    });

    res.status(201).json({
      status: 'success',
      data: smartGroup
    });
  } catch (error) {
    console.error('创建智能分组失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '创建智能分组失败'
    });
  }
};

// 更新智能分组
exports.updateSmartGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, rules, isActive } = req.body;

    const smartGroup = await SmartGroup.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        name,
        icon,
        color,
        rules,
        isActive,
        lastUpdated: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!smartGroup) {
      return res.status(404).json({
        status: 'error',
        message: '智能分组不存在'
      });
    }

    res.json({
      status: 'success',
      data: smartGroup
    });
  } catch (error) {
    console.error('更新智能分组失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '更新智能分组失败'
    });
  }
};

// 删除智能分组
exports.deleteSmartGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const smartGroup = await SmartGroup.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!smartGroup) {
      return res.status(404).json({
        status: 'error',
        message: '智能分组不存在'
      });
    }

    res.json({
      status: 'success',
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除智能分组失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '删除智能分组失败'
    });
  }
};

// 获取分组内文献
exports.getSmartGroupDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let filter, sort;

    // 检查是否为预设分组
    if (PRESET_RULES[id]) {
      filter = PRESET_RULES[id].filter;
      sort = PRESET_RULES[id].sort;
    } else {
      // 自定义分组
      const smartGroup = await SmartGroup.findOne({
        _id: id,
        user: req.user._id
      });

      if (!smartGroup) {
        return res.status(404).json({
          status: 'error',
          message: '智能分组不存在'
        });
      }

      filter = smartGroup.rules.filter || {};
      sort = smartGroup.rules.sort || { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const documents = await Document.find({
      owner: req.user._id,
      ...filter
    })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('collectionId', 'name');

    const total = await Document.countDocuments({
      owner: req.user._id,
      ...filter
    });

    res.json({
      status: 'success',
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取分组文献失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '获取分组文献失败'
    });
  }
};

// 自然语言解析为查询条件
exports.parseNaturalLanguage = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: '请提供查询条件'
      });
    }

    const prompt = `你是一个文献管理系统的查询解析器。请将以下自然语言查询条件转换为MongoDB查询语句。

用户查询: "${query}"

可用的文档字段:
- title: 标题 (字符串)
- authors: 作者列表 (字符串数组)
- journal: 期刊名 (字符串)
- year: 发表年份 (数字)
- status: 阅读状态 (枚举: "未读", "已读", "重点")
- rating: 评分 (数字 1-5)
- keywords: 关键词 (字符串数组)
- tags: 标签 (字符串数组)
- isFavorite: 是否收藏 (布尔值)
- createdAt: 添加时间 (日期)
- updatedAt: 更新时间 (日期)

请返回JSON格式:
{
  "filter": { MongoDB查询条件 },
  "sort": { 排序条件 },
  "description": "解析说明"
}

注意:
1. 年份相关: 使用 $gte, $lte 等操作符
2. 文本匹配: 使用 $regex 配合 $options: "i" 实现模糊匹配
3. 数组字段: 使用 $in 或 $elemMatch
4. 日期计算: 使用相对于当前日期的计算

只返回JSON，不要其他内容。`;

    const response = await aiService.generateText(prompt);
    
    // 尝试解析AI返回的JSON
    let parsed;
    try {
      // 提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的结果');
      }
    } catch (parseError) {
      console.error('解析AI返回失败:', parseError);
      return res.status(400).json({
        status: 'error',
        message: '无法解析查询条件，请尝试更明确的描述'
      });
    }

    // 验证并执行查询获取文档数量
    const count = await Document.countDocuments({
      owner: req.user._id,
      ...parsed.filter
    });

    res.json({
      status: 'success',
      data: {
        ...parsed,
        matchCount: count
      }
    });
  } catch (error) {
    console.error('解析自然语言查询失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '解析查询失败'
    });
  }
};

// 从自然语言创建智能分组
exports.createFromNaturalLanguage = async (req, res) => {
  try {
    const { query, name } = req.body;

    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: '请提供查询条件'
      });
    }

    // 先解析自然语言
    const prompt = `你是一个文献管理系统的查询解析器。请将以下自然语言查询条件转换为MongoDB查询语句。

用户查询: "${query}"

可用的文档字段:
- title: 标题 (字符串)
- authors: 作者列表 (字符串数组)
- journal: 期刊名 (字符串)
- year: 发表年份 (数字)
- status: 阅读状态 (枚举: "未读", "已读", "重点")
- rating: 评分 (数字 1-5)
- keywords: 关键词 (字符串数组)
- tags: 标签 (字符串数组)
- isFavorite: 是否收藏 (布尔值)
- createdAt: 添加时间 (日期)
- updatedAt: 更新时间 (日期)

请返回JSON格式:
{
  "filter": { MongoDB查询条件 },
  "sort": { 排序条件 },
  "suggestedName": "建议的分组名称",
  "suggestedIcon": "建议的图标名称(fire/book/calendar/heart/star/folder/search)",
  "suggestedColor": "建议的颜色(十六进制)"
}

只返回JSON，不要其他内容。`;

    const response = await aiService.generateText(prompt);
    
    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回的结果');
      }
    } catch (parseError) {
      return res.status(400).json({
        status: 'error',
        message: '无法解析查询条件'
      });
    }

    // 创建智能分组
    const smartGroup = await SmartGroup.create({
      user: req.user._id,
      name: name || parsed.suggestedName || '自定义分组',
      type: 'ai',
      icon: parsed.suggestedIcon || 'search',
      color: parsed.suggestedColor || '#00d4ff',
      rules: {
        filter: parsed.filter,
        sort: parsed.sort,
        naturalLanguage: query
      }
    });

    // 获取匹配的文档数量
    const count = await Document.countDocuments({
      owner: req.user._id,
      ...parsed.filter
    });

    res.status(201).json({
      status: 'success',
      data: {
        ...smartGroup.toObject(),
        documentCount: count
      }
    });
  } catch (error) {
    console.error('从自然语言创建分组失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '创建分组失败'
    });
  }
};

