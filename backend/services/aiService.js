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
