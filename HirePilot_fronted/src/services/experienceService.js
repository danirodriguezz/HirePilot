import api from '../api/axiosInstance'; // Usamos tu instancia configurada

export const experienceService = {
  // Obtener todas las experiencias
  getAll: async () => {
    const response = await api.get('/experience/');
    return response.data;
  },

  // Crear nueva experiencia
  create: async (data) => {
    const response = await api.post('/experience/', data);
    return response.data;
  },

  // Actualizar experiencia existente
  update: async (id, data) => {
    const response = await api.put(`/experience/${id}/`, data);
    return response.data;
  },

  // Eliminar
  delete: async (id) => {
    await api.delete(`/experience/${id}/`);
    return id; // Retornamos el id para actualizar el estado local
  }
};