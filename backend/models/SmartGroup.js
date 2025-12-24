const mongoose = require('mongoose');

const SmartGroupSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, '请提供分组名称'],
    trim: true
  },
  type: {
    type: String,
    enum: ['preset', 'custom', 'ai'],
    default: 'custom'
  },
  icon: {
    type: String,
    default: 'folder'
  },
  color: {
    type: String,
    default: '#00d4ff'
  },
  rules: {
    filter: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    sort: {
      type: mongoose.Schema.Types.Mixed,
      default: { createdAt: -1 }
    },
    naturalLanguage: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documentCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
SmartGroupSchema.index({ user: 1 });
SmartGroupSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('SmartGroup', SmartGroupSchema);

