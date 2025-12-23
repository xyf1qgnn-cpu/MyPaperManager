const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供目录名称'],
    trim: true,
    maxlength: [100, '目录名称不能超过100个字符']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null  // null 表示根目录
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请提供目录所有者']
  },
  order: {
    type: Number,
    default: 0  // 用于排序
  },
  icon: {
    type: String,
    default: 'folder'  // 图标类型
  },
  color: {
    type: String,
    default: '#00d4ff'  // 目录颜色
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '描述不能超过500个字符']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
CollectionSchema.index({ owner: 1, parentId: 1 });
CollectionSchema.index({ owner: 1, name: 1 });

// 更新时间中间件
CollectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 虚拟字段：子目录数量（需要手动填充）
CollectionSchema.virtual('childrenCount', {
  ref: 'Collection',
  localField: '_id',
  foreignField: 'parentId',
  count: true
});

// 虚拟字段：文档数量
CollectionSchema.virtual('documentsCount', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'collectionId',
  count: true
});

// 确保虚拟字段在 JSON 中显示
CollectionSchema.set('toJSON', { virtuals: true });
CollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Collection', CollectionSchema);
