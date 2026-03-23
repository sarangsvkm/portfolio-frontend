import api from './api';
import type { OtpRequest, OtpVerification, ContactRequest } from '../types';

export const contactService = {
  requestOtp: async (data: OtpRequest) => {
    const response = await api.post('/api/contact/request-otp', data);
    return response.data;
  },

  verifyOtp: async (data: OtpVerification) => {
    const response = await api.post('/api/contact/verify-otp', data);
    return response.data;
  },

  getContactReport: async (): Promise<ContactRequest[]> => {
    const response = await api.get<ContactRequest[]>('/api/contact/report');
    return response.data;
  },

  deleteContact: async (id: number | string) => {
    await api.delete(`/api/contact/${id}`, { data: { username: "admin", password: "password" } });
  }
};
