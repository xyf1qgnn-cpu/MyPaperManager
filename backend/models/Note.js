const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, '请提供笔记内容'],
    trim: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: [true, '请提供关联的文献']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请提供笔记作者']
  },
  page: {
    type: Number,
    min: 1
  },
  highlights: [
    {
      text: {
        type: String,
        trim: true
      },
      page: {
        type: Number,
        min: 1
      },
      color: {
        type: String,
        default: '#ffeb3b'
      }
    }
  ],
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
NoteSchema.index({ document: 1, user: 1 });
NoteSchema.index({ user: 1 });

module.exports = mongoose.model('Note', NoteSchema);