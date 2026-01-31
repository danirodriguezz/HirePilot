import api from '../api/axiosInstance'; // Usamos tu instancia configurada

// --- MAPPERS ---
export const mapToBackend = (exp) => ({
  company: exp.company,
  role: exp.position,
  location: exp.location,
  description: exp.description,
  start_date: exp.startDate ? `${exp.startDate}-01` : null,
  end_date: exp.endDate ? `${exp.endDate}-01` : null,
  current_job: exp.current,
  achievements: exp.achievements.map(text => ({ description: text, keywords: [] }))
})

export const mapToFrontend = (apiData) => ({
  id: apiData.id,
  company: apiData.company,
  position: apiData.role,
  location: apiData.location,
  description: apiData.description || "",
  startDate: apiData.start_date ? apiData.start_date.substring(0, 7) : "",
  endDate: apiData.end_date ? apiData.end_date.substring(0, 7) : "",
  current: apiData.current_job,
  achievements: apiData.achievements ? apiData.achievements.map(a => a.description) : [""]
})

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