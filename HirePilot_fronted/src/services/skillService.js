import api from '../api/axiosInstance';

export const skillService = {
  // Obtener todas
  getAll: async () => {
    const response = await api.get('/skills/');
    return response.data;
  },

  // Crear
  create: async (data) => {
    const response = await api.post('/skills/', data);
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/skills/${id}/`, data);
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    await api.delete(`/skills/${id}/`);
    return id;
  }
};