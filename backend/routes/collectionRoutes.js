const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  moveCollection,
  reorderCollections,
  getCollectionDocuments
} = require('../controllers/collectionController');
const { protect } = require('../middleware/auth');

// 所有路由都需要认证
router.use(protect);

// 目录 CRUD
router.route('/')
  .get(getCollections)
  .post(createCollection);

// 批量排序
router.put('/reorder', reorderCollections);

router.route('/:id')
  .get(getCollection)
  .put(updateCollection)
  .delete(deleteCollection);

// 移动目录
router.patch('/:id/move', moveCollection);

// 获取目录下的文档
router.get('/:id/documents', getCollectionDocuments);

module.exports = router;
