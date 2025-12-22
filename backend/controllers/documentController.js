const mongoose = require('mongoose');
const Document = require('../models/Document');
const Note = require('../models/Note');
const User = require('../models/User');

// @desc    获取用户文献列表
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const userId = req.user._id;
    const documents = await Document.find({ owner: userId }).sort({ updatedAt: -1 });
    res.status(200).json(documents);
  } catch (error) {
    console.error('获取文献列表失败:', error);
    res.status(500).json({ message: '获取文献列表失败' });
  }
};

// @desc    获取用户收藏的文献列表
// @route   GET /api/documents/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('favorites');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ message: '获取收藏列表失败' });
  }
};

// @desc    添加新文献
// @route   POST /api/documents
// @access  Private
const createDocument = async (req, res) => {
  try {
    const userId = req.user._id;
    const newDocument = new Document({
      ...req.body,
      owner: userId
    });
    
    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('添加文献失败:', error);
    res.status(500).json({ message: '添加文献失败' });
  }
};

// @desc    获取单个文献详情
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log('========== getDocumentById Debug Info (Enhanced) ==========');
    console.log('Request ID:', id);
    console.log('User ID:', userId);
    
    // Step 1: Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ObjectId format');
        return res.status(400).json({ message: '无效的文档ID' });
    }

    // Step 2: Find document by ID only (ignore owner first)
    const document = await Document.findById(id);
    
    // Step 3: Check existence
    if (!document) {
      console.log('Status: 404 - Database returned null (ID not found)');
      return res.status(404).json({ message: '文献不存在' });
    }
    
    console.log('Document found. Owner:', document.owner);

    // Step 4: Check ownership
    // MongoDB ObjectIds should be compared with .equals() or .toString()
    const isOwner = document.owner && (document.owner.toString() === userId.toString());
    
    if (!isOwner) {
      console.log('Status: 403 - Unauthorized: Owner mismatch');
      console.log(`Expected: ${userId}, Actual: ${document.owner}`);
      return res.status(403).json({ message: '无权访问该文献' });
    }

    // Step 5: Access Granted
    console.log('Status: 200 - Access Granted');
    res.status(200).json(document);
  } catch (error) {
    console.error('获取文献详情失败:', error);
    if (error.name === 'CastError') {
      console.error('CastError detected: Invalid ID format');
      return res.status(400).json({ message: '无效的ID格式' });
    }
    res.status(500).json({ message: '获取文献详情失败' });
  }
};

// @desc    更新文献信息
// @route   PUT /api/documents/:id
// @access  Private
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const updatedDocument = await Document.findOneAndUpdate(
      { _id: id, owner: userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedDocument) {
      return res.status(404).json({ message: '文献不存在' });
    }
    
    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error('更新文献失败:', error);
    res.status(500).json({ message: '更新文献失败' });
  }
};

// @desc    删除文献
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const deletedDocument = await Document.findOneAndDelete({ _id: id, owner: userId });
    
    if (!deletedDocument) {
      return res.status(404).json({ message: '文献不存在' });
    }
    
    // 删除关联的笔记
    await Note.deleteMany({ document: id, user: userId });
    
    // 从用户的收藏中移除
    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: id }
    });
    
    res.status(200).json({ message: '文献删除成功' });
  } catch (error) {
    console.error('删除文献失败:', error);
    res.status(500).json({ message: '删除文献失败' });
  }
};

// @desc    获取文献笔记
// @route   GET /api/documents/:id/notes
// @access  Private
const getDocumentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // 检查文献是否存在且属于当前用户
    const document = await Document.findOne({ _id: id, owner: userId });
    if (!document) {
      return res.status(404).json({ message: '文献不存在' });
    }
    
    const notes = await Note.find({ document: id, user: userId });
    res.status(200).json(notes);
  } catch (error) {
    console.error('获取笔记失败:', error);
    res.status(500).json({ message: '获取笔记失败' });
  }
};

// @desc    切换收藏状态
// @route   POST /api/documents/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 检查文献是否存在
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: '文献不存在' });
    }

    const user = await User.findById(userId);
    
    // 检查是否已收藏
    const isFavorited = user.favorites.includes(id);

    if (isFavorited) {
      // 取消收藏
      user.favorites.pull(id);
    } else {
      // 添加收藏
      user.favorites.push(id);
    }

    await user.save();

    res.status(200).json({ 
      isFavorited: !isFavorited,
      favorites: user.favorites 
    });
  } catch (error) {
    console.error('切换收藏状态失败:', error);
    res.status(500).json({ message: '操作失败' });
  }
};

module.exports = {
  getDocuments,
  getFavorites,
  createDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentNotes,
  toggleFavorite
};
