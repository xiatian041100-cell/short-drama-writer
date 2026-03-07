import api from './api';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const scriptAPI = {
  getAll: () => api.get('/scripts'),
  getById: (id) => api.get(`/scripts/${id}`),
  generate: (data) => api.post('/scripts/generate', data),
  delete: (id) => api.delete(`/scripts/${id}`),
};

export const adminAPI = {
  getPromptVersions: () => api.get('/admin/prompts'),
  createPromptVersion: (data) => api.post('/admin/prompts', data),
  activatePromptVersion: (id) => api.put(`/admin/prompts/${id}/activate`),
};