import api from './api';

export const saveAnnotation = async (annotation) => {
  // annotation contains: { id, documentId, content, position, comment, type }
  return await api.post('/annotations', annotation);
};

export const getAnnotations = async (documentId) => {
  return await api.get(`/annotations/${documentId}`);
};

export const deleteAnnotation = async (id) => {
  return await api.delete(`/annotations/${id}`);
};
