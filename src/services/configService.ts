import api from './api';
import type { SystemConfig } from '../types';

export const configService = {
  getConfigs: async (auth: { username: string, password: string }): Promise<SystemConfig[]> => {
    const response = await api.get<SystemConfig[]>('/api/config', {
      headers: {
        'username': auth.username,
        'password': auth.password
      }
    });
    return response.data;
  },

  saveConfig: async (config: SystemConfig, auth: { username: string, password: string }): Promise<SystemConfig> => {
    const response = await api.post<SystemConfig>('/api/config', config, {
      headers: {
        'username': auth.username,
        'password': auth.password
      }
    });
    return response.data;
  },

  deleteConfig: async (id: number | string, auth: { username: string, password: string }) => {
    await api.delete(`/api/config/${id}`, {
      headers: {
        'username': auth.username,
        'password': auth.password
      }
    });
  }
};
