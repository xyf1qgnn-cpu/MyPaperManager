import api from './api';

// 获取目录树
export const getCollections = async () => {
  const response = await api.get('/collections');
  return response.data || response;
};

// 获取单个目录
export const getCollection = async (id) => {
  const response = await api.get(`/collections/${id}`);
  return response.data || response;
};

// 创建目录
export const createCollection = async (data) => {
  const response = await api.post('/collections', data);
  return response.data || response;
};

// 更新目录
export const updateCollection = async (id, data) => {
  const response = await api.put(`/collections/${id}`, data);
  return response.data || response;
};

// 删除目录
export const deleteCollection = async (id, moveDocumentsTo = null) => {
  const params = moveDocumentsTo ? `?moveDocumentsTo=${moveDocumentsTo}` : '';
  const response = await api.delete(`/collections/${id}${params}`);
  return response.data || response;
};

// 移动目录
export const moveCollection = async (id, targetParentId) => {
  const response = await api.patch(`/collections/${id}/move`, { targetParentId });
  return response.data || response;
};

// 重排序目录
export const reorderCollections = async (orders) => {
  const response = await api.put('/collections/reorder', { orders });
  return response.data || response;
};

// 获取目录下的文档
export const getCollectionDocuments = async (id, page = 1, limit = 20) => {
  const response = await api.get(`/collections/${id}/documents`, {
    params: { page, limit }
  });
  return response.data || response;
};

// 移动文档到目录
export const moveDocument = async (documentId, collectionId) => {
  const response = await api.patch(`/documents/${documentId}/move`, { collectionId });
  return response;
};

// 批量移动文档
export const batchMoveDocuments = async (documentIds, collectionId) => {
  const response = await api.patch('/documents/batch/move', { documentIds, collectionId });
  return response;
};

// 重命名文档
export const renameDocument = async (documentId, template) => {
  const response = await api.patch(`/documents/${documentId}/rename`, { template });
  return response;
};

// 添加附件
export const addAttachment = async (documentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/documents/${documentId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

// 删除附件
export const deleteAttachment = async (documentId, attachmentId) => {
  const response = await api.delete(`/documents/${documentId}/attachments/${attachmentId}`);
  return response;
};
