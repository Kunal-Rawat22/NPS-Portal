import api from './axios';
import { SurveyResponseData } from '../types';

export interface QuestionAnswerPayload { questionId: string; rating: number; comment?: string; }

export const getMyResponse = async (surveyId: string): Promise<SurveyResponseData | null> => {
  const res = await api.get(`/surveys/${surveyId}/my-response`);
  return res.data ?? null;
};
export const startResponse = async (surveyId: string): Promise<SurveyResponseData> => (await api.post(`/surveys/${surveyId}/responses`)).data;
export const saveDraft = async (responseId: string, answers: QuestionAnswerPayload[]): Promise<SurveyResponseData> => (await api.put(`/responses/${responseId}`, { answers })).data;
export const submitResponse = async (responseId: string): Promise<SurveyResponseData> => (await api.post(`/responses/${responseId}/submit`)).data;
export const getSurveyResponses = async (surveyId: string): Promise<SurveyResponseData[]> => (await api.get(`/surveys/${surveyId}/responses`)).data;
