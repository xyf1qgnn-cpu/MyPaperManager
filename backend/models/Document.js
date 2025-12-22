const mongoose = require('mongoose');

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

module.exports = mongoose.model('Document', DocumentSchema);