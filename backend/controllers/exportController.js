const Document = require('../models/Document');
const CitationService = require('../services/citationService');

// 导出单个文献
exports.exportSingle = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'bibtex' } = req.query;

    const doc = await Document.findOne({
      _id: id,
      owner: req.user._id
    });

    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: '文献不存在'
      });
    }

    const exported = CitationService.export(doc, format);

    res.setHeader('Content-Type', exported.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.send(exported.content);
  } catch (error) {
    console.error('导出文献失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '导出失败'
    });
  }
};

// 批量导出文献
exports.exportBatch = async (req, res) => {
  try {
    const { ids, format = 'bibtex' } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '请提供要导出的文献ID列表'
      });
    }

    const docs = await Document.find({
      _id: { $in: ids },
      owner: req.user._id
    });

    if (docs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '未找到指定的文献'
      });
    }

    const exported = CitationService.export(docs, format);

    res.setHeader('Content-Type', exported.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exported.filename}"`);
    res.send(exported.content);
  } catch (error) {
    console.error('批量导出失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '导出失败'
    });
  }
};

// 导出收藏夹
exports.exportFavorites = async (req, res) => {
  try {
    const { format = 'bibtex' } = req.query;

    const docs = await Document.find({
      owner: req.user._id,
      isFavorite: true
    });

    if (docs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '收藏夹为空'
      });
    }

    const exported = CitationService.export(docs, format);

    res.setHeader('Content-Type', exported.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="favorites_${exported.filename}"`);
    res.send(exported.content);
  } catch (error) {
    console.error('导出收藏夹失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '导出失败'
    });
  }
};

// 导出全部文献
exports.exportAll = async (req, res) => {
  try {
    const { format = 'bibtex' } = req.query;

    const docs = await Document.find({ owner: req.user._id });

    if (docs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '文献库为空'
      });
    }

    const exported = CitationService.export(docs, format);

    res.setHeader('Content-Type', exported.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="all_${exported.filename}"`);
    res.send(exported.content);
  } catch (error) {
    console.error('导出全部文献失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '导出失败'
    });
  }
};

// 预览导出内容（不下载）
exports.preview = async (req, res) => {
  try {
    const { ids, format = 'bibtex' } = req.body;

    let docs;
    if (ids && Array.isArray(ids) && ids.length > 0) {
      docs = await Document.find({
        _id: { $in: ids },
        owner: req.user._id
      });
    } else {
      // 默认预览前5篇
      docs = await Document.find({ owner: req.user._id }).limit(5);
    }

    if (docs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '未找到文献'
      });
    }

    const exported = CitationService.export(docs, format);

    res.json({
      status: 'success',
      data: {
        format,
        count: docs.length,
        content: exported.content,
        filename: exported.filename
      }
    });
  } catch (error) {
    console.error('预览导出失败:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || '预览失败'
    });
  }
};

