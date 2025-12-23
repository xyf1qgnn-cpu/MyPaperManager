const Collection = require('../models/Collection');
const Document = require('../models/Document');

// 获取用户的所有目录（树形结构）
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user.id })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // 构建树形结构
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => {
          if (parentId === null) {
            return item.parentId === null || item.parentId === undefined;
          }
          return item.parentId && item.parentId.toString() === parentId.toString();
        })
        .map(item => ({
          ...item,
          children: buildTree(items, item._id)
        }));
    };

    const tree = buildTree(collections);

    res.json({
      success: true,
      data: tree,
      total: collections.length
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: '获取目录失败',
      error: error.message
    });
  }
};

// 获取单个目录详情
exports.getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '目录不存在'
      });
    }

    // 获取该目录下的文档数量
    const documentsCount = await Document.countDocuments({
      collectionId: collection._id,
      owner: req.user.id
    });

    // 获取子目录数量
    const childrenCount = await Collection.countDocuments({
      parentId: collection._id,
      owner: req.user.id
    });

    res.json({
      success: true,
      data: {
        ...collection.toObject(),
        documentsCount,
        childrenCount
      }
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      message: '获取目录详情失败',
      error: error.message
    });
  }
};

// 创建目录
exports.createCollection = async (req, res) => {
  try {
    const { name, parentId, icon, color, description } = req.body;

    // 如果有父目录，验证父目录存在且属于当前用户
    if (parentId) {
      const parentCollection = await Collection.findOne({
        _id: parentId,
        owner: req.user.id
      });
      if (!parentCollection) {
        return res.status(404).json({
          success: false,
          message: '父目录不存在'
        });
      }
    }

    // 获取同级目录的最大 order
    const maxOrderDoc = await Collection.findOne({
      owner: req.user.id,
      parentId: parentId || null
    }).sort({ order: -1 });

    const order = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const collection = await Collection.create({
      name,
      parentId: parentId || null,
      owner: req.user.id,
      order,
      icon: icon || 'folder',
      color: color || '#00d4ff',
      description
    });

    res.status(201).json({
      success: true,
      data: collection,
      message: '目录创建成功'
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({
      success: false,
      message: '创建目录失败',
      error: error.message
    });
  }
};

// 更新目录
exports.updateCollection = async (req, res) => {
  try {
    const { name, icon, color, description } = req.body;

    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { name, icon, color, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '目录不存在'
      });
    }

    res.json({
      success: true,
      data: collection,
      message: '目录更新成功'
    });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({
      success: false,
      message: '更新目录失败',
      error: error.message
    });
  }
};

// 删除目录（包括子目录和文档处理）
exports.deleteCollection = async (req, res) => {
  try {
    const { moveDocumentsTo } = req.query; // 可选：将文档移动到其他目录

    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '目录不存在'
      });
    }

    // 获取所有子目录ID（递归）
    const getAllChildIds = async (parentId) => {
      const children = await Collection.find({ parentId, owner: req.user.id });
      let ids = children.map(c => c._id);
      for (const child of children) {
        const grandChildren = await getAllChildIds(child._id);
        ids = ids.concat(grandChildren);
      }
      return ids;
    };

    const allChildIds = await getAllChildIds(collection._id);
    const allCollectionIds = [collection._id, ...allChildIds];

    // 处理这些目录下的文档
    if (moveDocumentsTo) {
      // 移动到指定目录
      await Document.updateMany(
        { collectionId: { $in: allCollectionIds }, owner: req.user.id },
        { collectionId: moveDocumentsTo === 'root' ? null : moveDocumentsTo }
      );
    } else {
      // 移动到根目录
      await Document.updateMany(
        { collectionId: { $in: allCollectionIds }, owner: req.user.id },
        { collectionId: null }
      );
    }

    // 删除所有相关目录
    await Collection.deleteMany({ _id: { $in: allCollectionIds } });

    res.json({
      success: true,
      message: '目录删除成功',
      deletedCount: allCollectionIds.length
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({
      success: false,
      message: '删除目录失败',
      error: error.message
    });
  }
};

// 移动目录
exports.moveCollection = async (req, res) => {
  try {
    const { targetParentId } = req.body;

    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: '目录不存在'
      });
    }

    // 验证目标父目录
    if (targetParentId && targetParentId !== 'root') {
      const targetParent = await Collection.findOne({
        _id: targetParentId,
        owner: req.user.id
      });
      if (!targetParent) {
        return res.status(404).json({
          success: false,
          message: '目标目录不存在'
        });
      }

      // 防止循环：不能移动到自己的子目录下
      const isChild = async (parentId, checkId) => {
        if (parentId.toString() === checkId.toString()) return true;
        const children = await Collection.find({ parentId, owner: req.user.id });
        for (const child of children) {
          if (await isChild(child._id, checkId)) return true;
        }
        return false;
      };

      if (await isChild(collection._id, targetParentId)) {
        return res.status(400).json({
          success: false,
          message: '不能将目录移动到其子目录下'
        });
      }
    }

    collection.parentId = targetParentId === 'root' ? null : targetParentId;
    await collection.save();

    res.json({
      success: true,
      data: collection,
      message: '目录移动成功'
    });
  } catch (error) {
    console.error('Move collection error:', error);
    res.status(500).json({
      success: false,
      message: '移动目录失败',
      error: error.message
    });
  }
};

// 重新排序目录
exports.reorderCollections = async (req, res) => {
  try {
    const { orders } = req.body; // [{ id: 'xxx', order: 0 }, ...]

    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id, owner: req.user.id },
        update: { order: item.order }
      }
    }));

    await Collection.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('Reorder collections error:', error);
    res.status(500).json({
      success: false,
      message: '排序更新失败',
      error: error.message
    });
  }
};

// 获取目录下的文档
exports.getCollectionDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = {
      owner: req.user.id,
      collectionId: id === 'root' ? null : id
    };

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get collection documents error:', error);
    res.status(500).json({
      success: false,
      message: '获取目录文档失败',
      error: error.message
    });
  }
};
