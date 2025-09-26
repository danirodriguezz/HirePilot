import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar expiración del token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evitar interceptar el login
    if (originalRequest.url.includes("/login")) {
      return Promise.reject(error);
    }

    // Si es 401 y no hemos intentado renovar ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const { data } = await axios.post("http://127.0.0.1:8000/api/token/refresh", {
          refresh: refreshToken,
        });

        // Guardar nuevo access token
        localStorage.setItem("access_token", data.access);

        // Reintentar petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Si también falla el refresh, cerrar sesión
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
