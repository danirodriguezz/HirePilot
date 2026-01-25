import api from '../api/axiosInstance';

export const certificateService = {
  // Listar
  getAll: async () => {
    const response = await api.get('/certificates/');
    return response.data;
  },

  // Crear
  create: async (data) => {
    const response = await api.post('/certificates/', data);
    return response.data;
  },

  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/certificates/${id}/`, data);
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    await api.delete(`/certificates/${id}/`);
    return id;
  }
};