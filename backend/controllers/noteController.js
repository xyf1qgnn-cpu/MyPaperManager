const Note = require('../models/Note');
const Document = require('../models/Document');

// @desc    添加笔记
// @route   POST /api/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { document } = req.body;
    
    // 检查文献是否存在且属于当前用户
    const doc = await Document.findOne({ _id: document, owner: userId });
    if (!doc) {
      return res.status(404).json({ message: '文献不存在' });
    }
    
    const newNote = new Note({
      ...req.body,
      user: userId
    });
    
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error('添加笔记失败:', error);
    res.status(500).json({ message: '添加笔记失败' });
  }
};
