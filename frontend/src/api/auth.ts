import api from './axios';
import { AuthResponse } from '../types';

export type { AuthResponse };

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/google', { idToken });
  return res.data;
};

export const emailLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};
