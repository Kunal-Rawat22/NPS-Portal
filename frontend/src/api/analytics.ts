import api from './axios';
import {
  AnalyticsAnswerDetail,
  AnalyticsOverview,
  AnalyticsScope,
  EnrichedSurveyResponse,
} from '../types';

export const getOrgAnalytics = async (surveyId: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/org`)).data;

export const getBUAnalytics = async (surveyId: string, buId: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/bu/${buId}`)).data;

export const getCompetencyAnalytics = async (surveyId: string, competency: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/competency/${encodeURIComponent(competency)}`)).data;

export const getCompetencies = async (): Promise<string[]> =>
  (await api.get('/analytics/competencies')).data;

export const getHrbpDirectAnalytics = async (surveyId: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/hrbp/direct`)).data;

export const getHrbpHierarchyAnalytics = async (surveyId: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/hrbp/hierarchy`)).data;

const buildParams = (filters?: { categoryId?: string; questionId?: string }) => {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.questionId) params.set('questionId', filters.questionId);
  const query = params.toString();
  return query ? `?${query}` : '';
};

const responsesPath = (surveyId: string, scope: AnalyticsScope, suffix: 'responses' | 'answers') => {
  switch (scope.type) {
    case 'org':
      return `/analytics/surveys/${surveyId}/org/${suffix}`;
    case 'bu':
      return `/analytics/surveys/${surveyId}/bu/${scope.buId}/${suffix}`;
    case 'competency':
      return `/analytics/surveys/${surveyId}/competency/${encodeURIComponent(scope.competency)}/${suffix}`;
    case 'hrbp-direct':
      return `/analytics/surveys/${surveyId}/hrbp/direct/${suffix}`;
    case 'hrbp-hierarchy':
      return `/analytics/surveys/${surveyId}/hrbp/hierarchy/${suffix}`;
  }
};

export const getAnalyticsResponses = async (
  surveyId: string,
  scope: AnalyticsScope,
  filters?: { categoryId?: string; questionId?: string }
): Promise<EnrichedSurveyResponse[]> =>
  (await api.get(`${responsesPath(surveyId, scope, 'responses')}${buildParams(filters)}`)).data;

export const getAnalyticsAnswerDetails = async (
  surveyId: string,
  scope: AnalyticsScope,
  filters: { categoryId?: string; questionId?: string }
): Promise<AnalyticsAnswerDetail[]> =>
  (await api.get(`${responsesPath(surveyId, scope, 'answers')}${buildParams(filters)}`)).data;

export const resolveAnalyticsScope = (
  role: string | undefined,
  selectedBU: string,
  selectedCompetency: string,
  hrbpMode: 'direct' | 'hierarchy',
  userBusinessUnitId?: string
): AnalyticsScope | null => {
  if (role === 'ADMIN') {
    if (selectedCompetency) return { type: 'competency', competency: selectedCompetency };
    if (selectedBU) return { type: 'bu', buId: selectedBU };
    return { type: 'org' };
  }
  if (role === 'BU_HEAD' && userBusinessUnitId) {
    return { type: 'bu', buId: userBusinessUnitId };
  }
  if (role === 'HRBP') {
    return hrbpMode === 'direct' ? { type: 'hrbp-direct' } : { type: 'hrbp-hierarchy' };
  }
  return null;
};

export const fetchAnalyticsOverview = async (
  surveyId: string,
  role: string | undefined,
  selectedBU: string,
  selectedCompetency: string,
  hrbpMode: 'direct' | 'hierarchy',
  userBusinessUnitId?: string
): Promise<AnalyticsOverview | null> => {
  if (role === 'ADMIN') {
    if (selectedCompetency) return getCompetencyAnalytics(surveyId, selectedCompetency);
    if (selectedBU) return getBUAnalytics(surveyId, selectedBU);
    return getOrgAnalytics(surveyId);
  }
  if (role === 'BU_HEAD' && userBusinessUnitId) {
    return getBUAnalytics(surveyId, userBusinessUnitId);
  }
  if (role === 'HRBP') {
    return hrbpMode === 'direct'
      ? getHrbpDirectAnalytics(surveyId)
      : getHrbpHierarchyAnalytics(surveyId);
  }
  return null;
};

export const getScopeLabel = (scope: AnalyticsScope | null): string | null => {
  if (!scope) return null;
  switch (scope.type) {
    case 'org':
      return 'All Organisation';
    case 'bu':
      return 'Business Unit';
    case 'competency':
      return `Competency: ${scope.competency}`;
    case 'hrbp-direct':
      return 'Direct Reports';
    case 'hrbp-hierarchy':
      return 'Full Hierarchy';
  }
};
