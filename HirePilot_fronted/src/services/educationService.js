import api from '../api/axiosInstance';

// --- MAPPERS ---
export const mapToBackend = (edu) => ({
  institution: edu.institution,
  degree: edu.degree,
  field_of_study: edu.field, 
  grade: edu.gpa,            
  description: edu.description,
  start_date: edu.startDate ? `${edu.startDate}-01` : null,
  end_date: edu.endDate ? `${edu.endDate}-01` : null,
  current: edu.current,
})

export const mapToFrontendEducation = (apiData) => ({
  id: apiData.id,
  institution: apiData.institution,
  degree: apiData.degree,
  field: apiData.field_of_study || "", 
  gpa: apiData.grade || "",          
  description: apiData.description || "",
  startDate: apiData.start_date ? apiData.start_date.substring(0, 7) : "",
  endDate: apiData.end_date ? apiData.end_date.substring(0, 7) : "",
  current: apiData.current,
})

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