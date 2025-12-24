import api from './api';

// 导出单个文献
export const exportSingle = async (id, format = 'bibtex') => {
  const response = await api.get(`/export/${id}`, {
    params: { format },
    responseType: 'blob'
  });
  return response;
};

// 批量导出
export const exportBatch = async (ids, format = 'bibtex') => {
  const response = await api.post('/export/batch', 
    { ids, format },
    { responseType: 'blob' }
  );
  return response;
};

// 导出收藏夹
export const exportFavorites = async (format = 'bibtex') => {
  const response = await api.get('/export/favorites', {
    params: { format },
    responseType: 'blob'
  });
  return response;
};

// 导出全部
export const exportAll = async (format = 'bibtex') => {
  const response = await api.get('/export/all', {
    params: { format },
    responseType: 'blob'
  });
  return response;
};

// 预览导出内容
export const previewExport = async (ids = [], format = 'bibtex') => {
  const response = await api.post('/export/preview', { ids, format });
  return response.data;
};

// 下载文件工具函数
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// 格式信息
export const EXPORT_FORMATS = [
  { key: 'bibtex', label: 'BibTeX', ext: '.bib', description: 'LaTeX 引用格式' },
  { key: 'ris', label: 'RIS', ext: '.ris', description: '通用引文格式' },
  { key: 'gbt7714', label: 'GB/T 7714', ext: '.txt', description: '中国国家标准' }
];

