import api from './api';
import type { AuthCredentials, SystemConfig } from '../types';

const adminHeaders = (auth: AuthCredentials) => ({
  'X-Admin-Username': auth.username,
  'X-Admin-Password': auth.password,
});

export const configService = {
  getConfigs: async (auth: AuthCredentials): Promise<SystemConfig[]> => {
    const response = await api.get<SystemConfig[]>('/api/config', {
      headers: adminHeaders(auth),
    });
    return response.data;
  },

  saveConfig: async (config: SystemConfig, auth: AuthCredentials): Promise<SystemConfig> => {
    const response = await api.post<SystemConfig>('/api/config', config, {
      headers: adminHeaders(auth),
    });
    return response.data;
  },

  deleteConfig: async (id: number | string, auth: AuthCredentials) => {
    await api.delete(`/api/config/${id}`, {
      headers: adminHeaders(auth),
    });
  },

  uploadAsset: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<string>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
