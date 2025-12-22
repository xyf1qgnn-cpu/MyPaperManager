import api from './api';

export const translateText = async (text) => {
  return await api.post('/ai/translate', { text });
};

export const getDocSummary = async (documentId) => {
  return await api.post('/ai/summarize', { documentId });
};
