import api from './axios';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => (await api.get('/categories')).data;
export const createCategory = async (data: { name: string; description?: string }): Promise<Category> => (await api.post('/categories', data)).data;
export const updateCategory = async (id: string, data: { name: string; description?: string }): Promise<Category> => (await api.put(`/categories/${id}`, data)).data;
export const deleteCategory = async (id: string): Promise<void> => { await api.delete(`/categories/${id}`); };
