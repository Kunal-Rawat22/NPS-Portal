import api from './axios';
import { User, Role } from '../types';

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  businessUnitId?: string;
  reportingToId?: string;
  hrbpId?: string;
  competency?: string;
}

export const getUsers = async (): Promise<User[]> => (await api.get('/users')).data;
export const getMe = async (): Promise<User> => (await api.get('/users/me')).data;
export const createUser = async (data: CreateUserPayload): Promise<User> => (await api.post('/users', data)).data;
export const updateUser = async (id: string, data: Partial<CreateUserPayload> & { isActive?: boolean }): Promise<User> => (await api.put(`/users/${id}`, data)).data;
export const deactivateUser = async (id: string): Promise<void> => { await api.delete(`/users/${id}`); };
export const getUserHierarchy = async (id: string): Promise<User[]> => (await api.get(`/users/${id}/hierarchy`)).data;
export const getHrbpDirectReports = async (hrbpId: string): Promise<User[]> => (await api.get(`/users/hrbp/${hrbpId}/direct`)).data;
