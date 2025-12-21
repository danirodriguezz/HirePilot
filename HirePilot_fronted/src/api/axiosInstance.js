import axios from "axios";

// 1. Configuración dinámica basada en entorno
// Crea un archivo .env con: VITE_API_URL=http://127.0.0.1:8000/api
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables para manejar la concurrencia (Race Conditions)
let isRefreshing = false;
let failedQueue = [];

// Función para procesar la cola de peticiones en espera
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de Request
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

// Interceptor de Response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error no es 401 o ya se reintentó, rechazamos
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Evitar bucles en el login o refresh
    if (originalRequest.url.includes("login") || originalRequest.url.includes("/token/refresh")) {
       return Promise.reject(error);
    }

    // 2. Lógica de Bloqueo (Mutex) para concurrencia
    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (!refreshToken) {
          throw new Error("No refresh token available");
      }

      // Usamos una instancia limpia de axios para evitar interceptores en el refresh
      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;

      localStorage.setItem("access_token", access);
      
      // Actualizamos el header por defecto para futuras peticiones
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      originalRequest.headers.Authorization = `Bearer ${access}`;

      // Procesamos la cola de peticiones que estaban esperando
      processQueue(null, access);
      
      return api(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // Limpieza de seguridad
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      
      // Redirección segura (mejor usar un evento o hook si fuera un componente)
      // Pero window.location es aceptable aquí
      window.location.href = "/login";
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;