const express = require('express');
const { 
  getDocuments, 
  createDocument, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  getFavorites,
  toggleFavorite,
  getDocumentNotes
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 收藏列表 (必须放在 /:id 之前，否则 favorites 会被识别为 id)
router.get('/favorites', protect, getFavorites);

// 基础 CRUD
router.route('/')
  .get(protect, getDocuments)
  .post(protect, createDocument);

router.route('/:id')
  .get(protect, getDocumentById)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

// 获取文献笔记
router.get('/:id/notes', protect, getDocumentNotes);

// 收藏操作
router.post('/:id/favorite', protect, toggleFavorite);

module.exports = router;
