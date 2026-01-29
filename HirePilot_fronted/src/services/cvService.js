// src/services/cvService.js
import axios from '../api/axiosInstance';

export const generateCVApi = async (jobDescription) => {
  try {
    // El backend espera 'job_description' en snake_case
    const response = await axios.post('/cv/generate/', { 
      job_description: jobDescription 
    });
    
    // Tu backend devuelve un objeto que contiene 'structured_cv_data'
    // Retornamos todo para tener acceso a los metadatos si hace falta
    return response.data;
  } catch (error) {
    console.error("Error generating CV:", error);
    throw error;
  }
};