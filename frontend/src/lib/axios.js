import axios from 'axios';

/**
 * ==================================================
 * Cliente HTTP centralizado (Axios)
 * ==================================================
 **/

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true, // Envía cookies HttpOnly automáticamente
  //  COMUNICACIÓN ENTRE PUERTOS EN DESARROLLO
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de respuesta: manejo global de errores HTTP.
 * Si la API responde 401 (no autenticado), redirigir al login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;