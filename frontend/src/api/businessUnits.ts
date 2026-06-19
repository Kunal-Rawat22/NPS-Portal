import api from './axios';
import { BusinessUnit } from '../types';

export const getBusinessUnits = async (): Promise<BusinessUnit[]> => (await api.get('/business-units')).data;
export const createBusinessUnit = async (data: { name: string; headUserId?: string }): Promise<BusinessUnit> => (await api.post('/business-units', data)).data;
export const updateBusinessUnit = async (id: string, data: { name: string; headUserId?: string }): Promise<BusinessUnit> => (await api.put(`/business-units/${id}`, data)).data;
export const deleteBusinessUnit = async (id: string): Promise<void> => { await api.delete(`/business-units/${id}`); };
