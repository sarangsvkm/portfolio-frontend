import axios, { AxiosHeaders } from 'axios';
import { authService } from './authService';

const AUTH_FLAG_KEY = 'admin_auth';
const AUTH_CREDENTIALS_KEY = 'admin_credentials';
const DEFAULT_API_BASE_URL = 'https://api.sarangsvkm.in/portfolioApi';
const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
const apiBaseUrl =
  import.meta.env.DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\/portfolioApi$/i.test(rawApiBaseUrl)
    ? '/portfolioApi'
    : rawApiBaseUrl;
const PUBLIC_API_PREFIXES = [
  '/api/auth/',
  '/api/resume',
  '/api/profile',
  '/api/experience',
  '/api/education',
  '/api/skills',
  '/api/projects',
  '/api/contact/request-otp',
  '/api/contact/verify-otp',
];

const shouldAttachAdminHeaders = (requestUrl: string) =>
  !PUBLIC_API_PREFIXES.some((prefix) => requestUrl.startsWith(prefix));

const isPublicAuthLikeRequest = (requestUrl: string) =>
  requestUrl.includes('/api/auth/') || !shouldAttachAdminHeaders(requestUrl);

// Create a globally configured Axios instance
// Defaults to the hosted API when no env override is present
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicApi = axios.create({
  baseURL: apiBaseUrl,
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

  const requestUrl = String(config.url ?? '');
  const creds = authService.getCredentials();
  if (creds.username && creds.password && shouldAttachAdminHeaders(requestUrl)) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('X-Admin-Username', creds.username);
    headers.set('X-Admin-Password', creds.password);
    config.headers = headers;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url ?? '');
    const isAuthRequest = isPublicAuthLikeRequest(requestUrl);

    if ((status === 401 || status === 403) && !isAuthRequest && typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_FLAG_KEY);
      localStorage.removeItem(AUTH_CREDENTIALS_KEY);
      localStorage.removeItem('token');
      window.location.href = '/srg-gate';
    }

    return Promise.reject(error);
  }
);

export default api;
