import api from './api';
import type { AuthCredentials } from '../types';

const AUTH_FLAG_KEY = 'admin_auth';
const AUTH_CREDENTIALS_KEY = 'admin_credentials';
const EMPTY_CREDENTIALS: AuthCredentials = {
  username: '',
  password: '',
};

const normalizeCredentials = (credentials: AuthCredentials): AuthCredentials => ({
  username: credentials.username.trim(),
  password: credentials.password.trim(),
});

export const authService = {
  login: async (username: string, password: string): Promise<unknown> => {
    const normalized = normalizeCredentials({ username, password });
    const response = await api.post('/api/auth/login', normalized);
    localStorage.setItem(AUTH_FLAG_KEY, 'true');
    localStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(normalized));
    return response.data;
  },

  register: async (username: string, password: string): Promise<unknown> => {
    const response = await api.post('/api/auth/register', normalizeCredentials({ username, password }));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(AUTH_FLAG_KEY);
    localStorage.removeItem(AUTH_CREDENTIALS_KEY);
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem(AUTH_FLAG_KEY) === 'true' || !!localStorage.getItem('token');
  },

  getCredentials: (): AuthCredentials => {
    const raw = localStorage.getItem(AUTH_CREDENTIALS_KEY);

    if (!raw) {
      return EMPTY_CREDENTIALS;
    }

    try {
      return normalizeCredentials(JSON.parse(raw) as AuthCredentials);
    } catch {
      return EMPTY_CREDENTIALS;
    }
  },

  hasCredentials: (): boolean => {
    const credentials = authService.getCredentials();
    return Boolean(credentials.username && credentials.password);
  },

  setDevelopmentSession: (username = '', password = '') => {
    localStorage.setItem(AUTH_FLAG_KEY, 'true');
    localStorage.setItem(
      AUTH_CREDENTIALS_KEY,
      JSON.stringify(normalizeCredentials({ username, password }))
    );
  },
};
