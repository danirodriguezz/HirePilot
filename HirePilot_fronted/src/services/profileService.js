import api from "../api/axiosInstance"

// --- MAPPERS (Transformadores de datos) ---

// Convierte lo que llega del Backend (Snake_case) al formato de tu Frontend (CamelCase)
export const mapProfileToFrontend = (apiData) => {
  const profile = apiData.profile || {};
  return {
    firstName: apiData.first_name || "",
    lastName: apiData.last_name || "",
    email: apiData.email || "",
    // Campos anidados en 'profile'
    profession: profile.headline || "",
    phone: profile.phone || "",
    linkedin: profile.linkedin_url || "",
    website: profile.personal_website || "",
    summary: profile.summary || "",
    yearsOfExperience: profile.years_of_experience || "",
  }
}

// Convierte tus datos del formulario al formato que espera el Backend
export const mapProfileToBackend = (formData) => {
  return {
    first_name: formData.firstName,
    last_name: formData.lastName,
    profile: {
      headline: formData.profession,
      phone: formData.phone,
      linkedin_url: formData.linkedin,
      personal_website: formData.website,
      summary: formData.summary,
      years_of_experience: formData.yearsOfExperience,
    }
  }
}

// --- SERVICIO ---
export const profileService = {
  getProfile: async () => {
    const response = await api.get("/me/")
    return response.data
  },

  updateProfile: async (data) => {
    // Aceptamos datos ya mapeados o crudos, pero idealmente el componente pasa el objeto limpio
    // y aquí lo transformamos antes de enviarlo.
    const payload = mapProfileToBackend(data)
    const response = await api.patch("/me/", payload)
    return response.data
  }
}