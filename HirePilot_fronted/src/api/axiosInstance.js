import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: true, // 🚨 ESTO ES CLAVE: Permite enviar y recibir cookies (como el refresh_token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Variables para manejar la concurrencia (Race Conditions)
let isRefreshing = false;
let failedQueue = [];

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

// Interceptor de Request (Se queda igual, enviamos el access_token guardado)
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

    // Evitar bucles infinitos en endpoints de auth
    if (originalRequest.url.includes("login") || originalRequest.url.includes("/token/refresh/")) {
       return Promise.reject(error);
    }

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
      // 🚨 CAMBIO AQUÍ: Ya no leemos de localStorage.
      // Hacemos un POST vacío. El navegador inyectará la cookie 'refresh_token' automáticamente.
      // Debemos usar axios estándar y pasarle withCredentials.
      const response = await axios.post(`${baseURL}/token/refresh/`, {}, {
        withCredentials: true 
      });

      const { access } = response.data;

      // Actualizamos storage solo con el nuevo access token
      localStorage.setItem("access_token", access);
      
      // Actualizamos la petición original
      originalRequest.headers.Authorization = `Bearer ${access}`;

      // Procesamos la cola
      processQueue(null, access);
      
      return api(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // Limpieza total: el refresh token falló o expiró
      localStorage.removeItem("access_token");
      // Ya no hacemos removeItem de refresh_token porque no está en localStorage
      
      window.dispatchEvent(new Event("auth:logout"));
      
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;