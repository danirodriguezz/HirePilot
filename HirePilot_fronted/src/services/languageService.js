import api from '../api/axiosInstance';

export const languageService = {
  // Listar
  getAll: async () => {
    const response = await api.get('/languages/');
    return response.data;
  },

  // Crear
  create: async (data) => {
    const response = await api.post('/languages/', data);
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/languages/${id}/`, data);
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    await api.delete(`/languages/${id}/`);
    return id;
  }
};