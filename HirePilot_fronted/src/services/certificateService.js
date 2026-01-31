import api from '../api/axiosInstance';

// --- MAPPERS (Frontend <-> Backend) ---
export const mapToBackendCertificate = (cert) => ({
  name: cert.name,
  issuing_organization: cert.issuer, 
  issue_date: cert.date ? `${cert.date}-01` : null,
  expiration_date: cert.expiryDate ? `${cert.expiryDate}-01` : null,
  credential_id: cert.credentialId,
  credential_url: cert.url,          
  description: cert.description,
})

export const mapToFrontendCertificate = (apiData) => ({
  id: apiData.id,
  name: apiData.name,
  issuer: apiData.issuing_organization,
  date: apiData.issue_date ? apiData.issue_date.substring(0, 7) : "",
  expiryDate: apiData.expiration_date ? apiData.expiration_date.substring(0, 7) : "",
  credentialId: apiData.credential_id || "",
  url: apiData.credential_url || "",
  description: apiData.description || "",
})

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