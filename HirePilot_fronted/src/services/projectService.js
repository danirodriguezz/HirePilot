import api from '../api/axiosInstance';

export const projectService = {
  getAll: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/projects/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/projects/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/projects/${id}/`);
    return id;
  }
};