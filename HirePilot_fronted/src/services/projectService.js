import api from '../api/axiosInstance';

export const mapToBackendProject = (proj) => ({
  title: proj.title,
  role: proj.role,
  organization: proj.organization,
  category: proj.category,
  description: proj.description,
  project_url: proj.url,
  resource_url: proj.resource,
  start_date: proj.startDate ? `${proj.startDate}-01` : null,
  end_date: proj.endDate ? `${proj.endDate}-01` : null,
  skills: proj.selectedSkills || [] 
})

export const mapToFrontendProject = (apiData) => ({
  id: apiData.id,
  title: apiData.title,
  role: apiData.role || "",
  organization: apiData.organization || "",
  category: apiData.category || "PROFESSIONAL",
  description: apiData.description || "",
  url: apiData.project_url || "",
  resource: apiData.resource_url || "",
  startDate: apiData.start_date ? apiData.start_date.substring(0, 7) : "",
  endDate: apiData.end_date ? apiData.end_date.substring(0, 7) : "",
  selectedSkills: apiData.skills || [] 
})

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