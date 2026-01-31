import api from '../api/axiosInstance';

// --- MAPPERS (Frontend <-> Backend) ---
export const mapToBackendLenguage = (lang) => ({
  language: lang.name,          // Front: name -> Back: language
  level: lang.proficiency,      // Front: proficiency -> Back: level
  certificate: lang.certificates // Front: certificates -> Back: certificate
})

export const mapToFrontendLanguage = (apiData) => ({
  id: apiData.id,
  name: apiData.language,
  proficiency: apiData.level || "B1", // Valor por defecto si viene nulo
  certificates: apiData.certificate || "",
})


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