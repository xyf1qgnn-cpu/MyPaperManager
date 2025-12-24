import api from './api';

// 获取所有智能分组
export const getSmartGroups = async () => {
  const response = await api.get('/smart-groups');
  return response.data;
};

// 获取预设分组
export const getPresets = async () => {
  const response = await api.get('/smart-groups/presets');
  return response.data;
};

// 创建智能分组
export const createSmartGroup = async (data) => {
  const response = await api.post('/smart-groups', data);
  return response.data;
};

// 更新智能分组
export const updateSmartGroup = async (id, data) => {
  const response = await api.put(`/smart-groups/${id}`, data);
  return response.data;
};

// 删除智能分组
export const deleteSmartGroup = async (id) => {
  const response = await api.delete(`/smart-groups/${id}`);
  return response.data;
};

// 获取分组内文献
export const getSmartGroupDocuments = async (id, params = {}) => {
  const response = await api.get(`/smart-groups/${id}/documents`, { params });
  return response;
};

// 解析自然语言查询
export const parseNaturalLanguage = async (query) => {
  const response = await api.post('/smart-groups/parse', { query });
  return response.data;
};

// 从自然语言创建分组
export const createFromNaturalLanguage = async (query, name) => {
  const response = await api.post('/smart-groups/from-natural-language', { query, name });
  return response.data;
};

