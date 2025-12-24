const OpenAI = require('openai');
const config = require('../config');
const User = require('../models/User');

// OpenAI client needs to be initialized per request or dynamically if key changes per user.
// Since we want to support per-user API Key, we should refactor this.
// But for now, let's keep the global one as fallback, and allow passing apiKey.

/**
 * 使用AI解析文本提取元数据
 * @param {string} text - 从PDF提取的文本
 * @param {string} [apiKey] - 可选的用户API Key
 * @returns {Promise<Object>} - 提取的元数据
 */
exports.extractMetadata = async (text, apiKey) => {
  try {
    const finalApiKey = apiKey || config.ai.apiKey;
    
    if (!finalApiKey) {
        console.warn('No API Key provided for AI service');
        return {
            title: null,
            authors: [],
            summary: "未配置 API Key，无法进行 AI 解析"
        };
    }

    const client = new OpenAI({
        baseURL: config.ai.baseURL,
        apiKey: finalApiKey
    });

    const prompt = `
请分析以下学术文献的开头部分文本，并提取关键元数据。
请返回严格的 JSON 格式，包含以下字段：
- title: 论文标题
- authors: 作者列表（数组）
- journal: 期刊或会议名称
- year: 发表年份（数字）
- doi: DOI标识符（如果有）
- summary: 简短的中文摘要（200字以内）

如果是无法识别的字段，请设为 null。
不要返回 Markdown 格式（如 \`\`\`json），只返回纯 JSON 字符串。

文本内容：
${text.substring(0, 4000)} // 限制文本长度以防超出Token限制
    `;

    const completion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('AI解析失败:', error);
    // 返回空结构以防报错
    return {
      title: null,
      authors: [],
      journal: null,
      year: null,
      doi: null,
      summary: "AI解析失败"
    };
  }
};

/**
 * 通用AI文本生成方法
 * @param {string} prompt - 提示词
 * @param {Object} options - 可选配置
 * @param {string} [options.apiKey] - 可选的用户API Key
 * @param {boolean} [options.json] - 是否强制返回JSON格式
 * @returns {Promise<string>} - AI生成的文本
 */
exports.generateText = async (prompt, options = {}) => {
  try {
    const finalApiKey = options.apiKey || config.ai.apiKey;
    
    if (!finalApiKey) {
      console.warn('No API Key provided for AI service');
      throw new Error('未配置 API Key');
    }

    const client = new OpenAI({
      baseURL: config.ai.baseURL,
      apiKey: finalApiKey
    });

    const completionOptions = {
      messages: [{ role: "user", content: prompt }],
      model: "deepseek-chat",
      temperature: 0.3,
    };

    // 如果需要JSON格式输出
    if (options.json) {
      completionOptions.response_format = { type: "json_object" };
    }

    const completion = await client.chat.completions.create(completionOptions);
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('AI生成失败:', error);
    throw error;
  }
};

/**
 * AI翻译功能
 * @param {string} text - 待翻译文本
 * @param {string} targetLang - 目标语言
 * @param {string} [apiKey] - 可选的用户API Key
 * @returns {Promise<string>} - 翻译结果
 */
exports.translate = async (text, targetLang = '中文', apiKey) => {
  const prompt = `请将以下文本翻译成${targetLang}，保持学术性和准确性：\n\n${text}`;
  return await exports.generateText(prompt, { apiKey });
};

/**
 * AI摘要生成
 * @param {string} text - 待摘要文本
 * @param {number} maxLength - 最大字数
 * @param {string} [apiKey] - 可选的用户API Key
 * @returns {Promise<string>} - 摘要结果
 */
exports.summarize = async (text, maxLength = 300, apiKey) => {
  const prompt = `请为以下学术文本生成一个简洁的中文摘要，不超过${maxLength}字：\n\n${text.substring(0, 6000)}`;
  return await exports.generateText(prompt, { apiKey });
};