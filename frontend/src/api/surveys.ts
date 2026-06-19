import api from './axios';
import { Survey } from '../types';

export interface SurveyQuestionPayload {
  id?: string;
  questionText: string;
  categoryId: string;
  questionOrder: number;
}

export interface SurveyPayload {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  questions: SurveyQuestionPayload[];
}

export const getSurveys = async (): Promise<Survey[]> => (await api.get('/surveys')).data;
export const getSurvey = async (id: string): Promise<Survey> => (await api.get(`/surveys/${id}`)).data;
export const createSurvey = async (data: SurveyPayload): Promise<Survey> => (await api.post('/surveys', data)).data;
export const updateSurvey = async (id: string, data: SurveyPayload): Promise<Survey> => (await api.put(`/surveys/${id}`, data)).data;
export const deleteSurvey = async (id: string): Promise<void> => { await api.delete(`/surveys/${id}`); };
export const activateSurvey = async (id: string): Promise<Survey> => (await api.put(`/surveys/${id}/activate`)).data;
export const closeSurvey = async (id: string): Promise<Survey> => (await api.put(`/surveys/${id}/close`)).data;
export const reopenSurvey = async (id: string): Promise<Survey> => (await api.put(`/surveys/${id}/reopen`)).data;
