import api from './api';

/**
 * 处理文献数据，自动拼接 PDF 预览地址
 * @param {Array|Object} data 
 */
// frontend/src/services/documentService.js

// frontend/src/services/documentService.js

const processDocuments = (data) => {
  // 🟢 核心修复：硬编码后端地址
  // 确保 PDF 请求一定是指向后端 3000 端口，而不是前端 3001
  const API_BASE_URL = 'http://localhost:3000'; 

  if (Array.isArray(data)) {
    return data.map(doc => ({
      ...doc,
      // 如果有 filename，就拼上 http://localhost:3000/api/files/...
      pdfUrl: doc.filename ? `${API_BASE_URL}/api/files/${doc.filename}` : doc.pdfUrl
    }));
  } else if (data && typeof data === 'object') {
    return {
      ...data,
      // 同上，强制拼接完整路径
      pdfUrl: data.filename ? `${API_BASE_URL}/api/files/${data.filename}` : data.pdfUrl
    };
  }
  return data;
};

/**
 * 解析 PDF 元数据
 * 对应后端 POST /upload/parse-pdf
 * @param {File} file - PDF文件对象
 */
export const parsePdfMetadata = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return await api.post('/upload/parse-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 创建文献 (确认信息后最终入库)
 * 对应后端 POST /documents
 * @param {Object} data - 文献数据 (title, authors, abstract, etc.)
 */
export const createDocument = async (data) => {
  const res = await api.post('/documents', data);
  return processDocuments(res);
};

/**
 * 获取文献列表
 * 对应后端 GET /documents
 */
export const getDocuments = async () => {
  const res = await api.get('/documents');
  return processDocuments(res);
};

/**
 * 获取收藏的文献列表
 * 对应后端 GET /api/documents/favorites
 */
export const getFavoriteDocuments = async () => {
  const res = await api.get('/documents/favorites');
  return processDocuments(res);
};

/**
 * 切换收藏状态
 * 对应后端 POST /api/documents/:id/favorite
 * @param {string} id - 文献ID
 */
export const toggleFavorite = async (id) => {
  const res = await api.post(`/documents/${id}/favorite`);
  return processDocuments(res);
};
// src/services/documentService.js

// ... (保留你原有的 createDocument, getDocuments 等函数)

/**
 * 通用文件上传 (用于头像等)
 * 对应后端路由: POST /api/upload
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // 注意：这里假设你的 api 实例 baseURL 已经是 '/api'
  // 后端路由我们在之前的 Prompt 中定义过：POST /api/upload (对应 generic upload)
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // 预期返回 { path: 'uploads/xxx.png', filename: '...' }
};

/**
 * 根据 ID 获取单篇文献详情
 * 对应后端路由: GET /api/documents/:id
 */
/**
 * 根据 ID 获取单篇文献详情
 * 对应后端路由: GET /api/documents/:id
 */
export const getDocumentById = async (id) => {
  // 1. 发起请求
  const response = await api.get(`/documents/${id}`);
  
  // 2. 智能解包：
  // 如果 api.js 拦截器处理过，response 就是数据本身(data)
  // 如果没处理过，数据在 response.data 里
  // 我们优先取 response.data，取不到就用 response 自己
  const docData = response.data ? response.data : response;

  // 3. 关键补丁：必须调用 processDocuments！
  // 否则前端拿不到 /api/files/xxx.pdf 这个路径，阅读器就打不开
  return processDocuments(docData); 
};

/**
 * 删除文献
 * 对应后端 DELETE /api/documents/:id
 * @param {string} id - 文献ID
 */
export const deleteDocument = async (id) => {
  return await api.delete(`/documents/${id}`);
};