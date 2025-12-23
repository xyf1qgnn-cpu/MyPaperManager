const mongoose = require('mongoose');

// 附件子文档 Schema
const AttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    trim: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String
  },
  size: {
    type: Number
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请提供文献标题'],
    trim: true
  },
  filename: {
    type: String,
    trim: true
  },
  originalFilename: {
    type: String,
    trim: true
  },
  authors: [
    {
      type: String,
      required: [true, '请提供至少一位作者'],
      trim: true
    }
  ],
  journal: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear() + 1
  },
  doi: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  abstract: {
    type: String,
    trim: true
  },
  keywords: [
    {
      type: String,
      trim: true
    }
  ],
  status: {
    type: String,
    enum: ['未读', '已读', '重点'],
    default: '未读'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  pdfPath: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请提供文献所有者']
  },
  // 新增：所属目录
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    default: null  // null 表示在根目录
  },
  // 新增：收藏状态
  isFavorite: {
    type: Boolean,
    default: false
  },
  // 新增：附件列表
  attachments: [AttachmentSchema],
  // 新增：文件名模板（用于自动重命名）
  filenameTemplate: {
    type: String,
    default: '[Year] [Author] - [Title]'
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

// 索引设置，提高查询性能
DocumentSchema.index({ title: 'text', authors: 'text', journal: 'text', abstract: 'text' });
DocumentSchema.index({ owner: 1 });
DocumentSchema.index({ owner: 1, collectionId: 1 });
DocumentSchema.index({ owner: 1, isFavorite: 1 });

// 更新时间中间件
DocumentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', DocumentSchema);