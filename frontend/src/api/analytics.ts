import api from './axios';
import { AnalyticsOverview } from '../types';

export const getOrgAnalytics = async (surveyId: string): Promise<AnalyticsOverview> => (await api.get(`/analytics/surveys/${surveyId}/org`)).data;
export const getBUAnalytics = async (surveyId: string, buId: string): Promise<AnalyticsOverview> => (await api.get(`/analytics/surveys/${surveyId}/bu/${buId}`)).data;
export const getCompetencyAnalytics = async (surveyId: string, competency: string): Promise<AnalyticsOverview> => (await api.get(`/analytics/surveys/${surveyId}/competency/${competency}`)).data;
export const getHrbpDirectAnalytics = async (surveyId: string): Promise<AnalyticsOverview> => (await api.get(`/analytics/surveys/${surveyId}/hrbp/direct`)).data;
export const getHrbpHierarchyAnalytics = async (surveyId: string): Promise<AnalyticsOverview> => (await api.get(`/analytics/surveys/${surveyId}/hrbp/hierarchy`)).data;
