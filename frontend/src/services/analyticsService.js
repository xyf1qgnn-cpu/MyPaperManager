import api from './api';

// 获取统计总览
export const getOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

// 获取关键词统计
export const getKeywordStats = async () => {
  const response = await api.get('/analytics/keywords');
  return response.data;
};

// 获取期刊分布
export const getJournalStats = async () => {
  const response = await api.get('/analytics/journals');
  return response.data;
};

// 获取标签统计
export const getTagStats = async () => {
  const response = await api.get('/analytics/tags');
  return response.data;
};

// 获取阅读统计
export const getReadingStats = async (days = 30) => {
  const response = await api.get('/analytics/reading', { params: { days } });
  return response.data;
};

// 生成报告
export const generateReport = async (period = 'month') => {
  const response = await api.post('/analytics/report', { period });
  return response.data;
};

