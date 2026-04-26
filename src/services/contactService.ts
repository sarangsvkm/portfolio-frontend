import api, { publicApi } from './api';
import type { OtpRequest, OtpVerification, OtpVerificationResponse, ContactRequest, AuthCredentials } from '../types';

const adminHeaders = (auth: AuthCredentials) => ({
  'X-Admin-Username': auth.username,
  'X-Admin-Password': auth.password,
});

export const contactService = {
  requestOtp: async (data: OtpRequest) => {
    const response = await publicApi.post('/api/contact/request-otp', data);
    return response.data;
  },

  verifyOtp: async (data: OtpVerification): Promise<OtpVerificationResponse> => {
    const response = await publicApi.post<OtpVerificationResponse>('/api/contact/verify-otp', data);
    return response.data;
  },

  getContactReport: async (): Promise<ContactRequest[]> => {
    const response = await api.get<ContactRequest[]>('/api/contact/report');
    return response.data;
  },

  deleteContact: async (id: number | string, auth: AuthCredentials) => {
    await api.delete(`/api/contact/${id}`, {
      headers: adminHeaders(auth),
    });
  }
};
