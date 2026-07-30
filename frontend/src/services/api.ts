import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:1337/api`,
});

// Las rutas de /auth/local solo estan permitidas para el rol Public en Strapi:
// mandar un JWT en ellas hace que la peticion se resuelva como Authenticated y devuelva 403.
const isAuthRoute = (url?: string) => !!url && url.startsWith('/auth/local');

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token && !isAuthRoute(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
