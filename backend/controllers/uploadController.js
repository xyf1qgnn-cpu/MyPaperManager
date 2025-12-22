const fs = require('fs');
const pdf = require('pdf-parse');
const aiService = require('../services/aiService');
const User = require('../models/User');

/**
 * 普通文件上传处理
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的文件' });
    }
    
    res.status(200).json({
      message: '文件上传成功',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ message: '文件上传失败，请稍后重试' });
  }
};

/**
 * 处理PDF上传并解析
 */
exports.parsePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传PDF文件' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // 解析PDF
    // pdf-parse max option is not page count, it is max page index to render?
    // pdf-parse documentation says it renders all pages by default.
    // We can use the version callback to limit, or just parse everything and take substring, 
    // or use options.max which limits number of pages to parse.
    const options = {
      max: 2 // 限制解析前2页
    };
    
    const data = await pdf(dataBuffer, options);
    const text = data.text;

    // 获取用户的 API Key
    let apiKey = null;
    if (req.user && req.user._id) {
        const user = await User.findById(req.user._id).select('+settings.deepseekApiKey');
        if (user && user.settings && user.settings.deepseekApiKey) {
            apiKey = user.settings.deepseekApiKey;
        }
    }

    // 调用AI提取元数据
    const metadata = await aiService.extractMetadata(text, apiKey);

    // 返回结果
    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      metadata
    });

  } catch (error) {
    console.error('PDF处理失败:', error);
    res.status(500).json({ message: 'PDF解析失败', error: error.message });
  }
};
