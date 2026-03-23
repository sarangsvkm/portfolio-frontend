import axios from 'axios';

const AUTH_FLAG_KEY = 'admin_auth';
const AUTH_CREDENTIALS_KEY = 'admin_credentials';

// Create a globally configured Axios instance
// Defaults to localhost:8080 for Spring Boot local development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Future: Intercept requests to attach JWT token
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url ?? '');
    const isAuthRequest = requestUrl.includes('/api/auth/');

    if ((status === 401 || status === 403) && !isAuthRequest && typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_FLAG_KEY);
      localStorage.removeItem(AUTH_CREDENTIALS_KEY);
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

export default api;
