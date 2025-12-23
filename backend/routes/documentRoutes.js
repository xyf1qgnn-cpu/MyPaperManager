const express = require('express');
const { 
  getDocuments, 
  createDocument, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  getFavorites,
  toggleFavorite,
  getDocumentNotes,
  moveDocument,
  renameDocument,
  addAttachment,
  deleteAttachment,
  batchMoveDocuments
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// 收藏列表 (必须放在 /:id 之前，否则 favorites 会被识别为 id)
router.get('/favorites', protect, getFavorites);

// 批量操作
router.patch('/batch/move', protect, batchMoveDocuments);

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

// 移动文档到目录
router.patch('/:id/move', protect, moveDocument);

// 自动重命名
router.patch('/:id/rename', protect, renameDocument);

// 附件管理
router.post('/:id/attachments', protect, upload.single('file'), addAttachment);
router.delete('/:id/attachments/:attachmentId', protect, deleteAttachment);

module.exports = router;
