import api from '../api/axiosInstance';

export const educationService = {
  // Obtener toda la educación
  getAll: async () => {
    const response = await api.get('/education/');
    return response.data;
  },

  // Crear nueva
  create: async (data) => {
    const response = await api.post('/education/', data);
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/education/${id}/`, data);
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    await api.delete(`/education/${id}/`);
    return id;
  }
};