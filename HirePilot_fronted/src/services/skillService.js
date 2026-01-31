import api from '../api/axiosInstance';

// --- MAPPERS ---
// Convertimos los valores del select (lowercase) a lo que espera Django (UPPERCASE)
export const mapToBackendSkill = (skill, type) => ({
  name: skill.name,
  skill_type: type === "technical" ? "TECHNICAL" : "SOFT",
  level: skill.level ? skill.level.toUpperCase() : "INTERMEDIATE" 
})

export const mapToFrontendSkill = (apiData) => ({
  id: apiData.id,
  name: apiData.name,
  level: apiData.level.toLowerCase(),
  type: apiData.skill_type 
})

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