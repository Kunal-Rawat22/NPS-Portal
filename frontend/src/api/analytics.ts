import api from './axios';
import {
  AnalyticsAnswerDetail,
  AnalyticsOverview,
  AnalyticsScope,
  EnrichedSurveyResponse,
} from '../types';

const withCompetency = (competency?: string) =>
  competency ? { params: { competency } } : undefined;

export const getOrgAnalytics = async (surveyId: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/org`)).data;

export const getBUAnalytics = async (
  surveyId: string,
  buId: string,
  competency?: string
): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/bu/${buId}`, withCompetency(competency))).data;

export const getCompetencyAnalytics = async (surveyId: string, competency: string): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/competency/${encodeURIComponent(competency)}`)).data;

export const getCompetencies = async (
  hrbpMode?: 'direct' | 'hierarchy',
  buId?: string
): Promise<string[]> =>
  (await api.get('/analytics/competencies', {
    params: {
      ...(hrbpMode ? { hrbpMode } : {}),
      ...(buId ? { buId } : {}),
    },
  })).data;

export const getHrbpDirectAnalytics = async (
  surveyId: string,
  competency?: string
): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/hrbp/direct`, withCompetency(competency))).data;

export const getHrbpHierarchyAnalytics = async (
  surveyId: string,
  competency?: string
): Promise<AnalyticsOverview> =>
  (await api.get(`/analytics/surveys/${surveyId}/hrbp/hierarchy`, withCompetency(competency))).data;

const buildParams = (filters?: { categoryId?: string; questionId?: string; competency?: string }) => {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.questionId) params.set('questionId', filters.questionId);
  if (filters?.competency) params.set('competency', filters.competency);
  const query = params.toString();
  return query ? `?${query}` : '';
};

const scopeCompetency = (scope: AnalyticsScope): string | undefined => {
  if (scope.type === 'competency') return scope.competency;
  if ('competency' in scope && scope.competency) return scope.competency;
  return undefined;
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
  (await api.get(
    `${responsesPath(surveyId, scope, 'responses')}${buildParams({
      ...filters,
      competency: scopeCompetency(scope),
    })}`
  )).data;

export const getAnalyticsAnswerDetails = async (
  surveyId: string,
  scope: AnalyticsScope,
  filters: { categoryId?: string; questionId?: string }
): Promise<AnalyticsAnswerDetail[]> =>
  (await api.get(
    `${responsesPath(surveyId, scope, 'answers')}${buildParams({
      ...filters,
      competency: scopeCompetency(scope),
    })}`
  )).data;

export const resolveAnalyticsScope = (
  role: string | undefined,
  selectedBU: string,
  selectedCompetency: string,
  hrbpMode: 'direct' | 'hierarchy',
  userBusinessUnitId?: string
): AnalyticsScope | null => {
  if (role === 'ADMIN') {
    if (selectedBU) {
      return {
        type: 'bu',
        buId: selectedBU,
        competency: selectedCompetency || undefined,
      };
    }
    if (selectedCompetency) return { type: 'competency', competency: selectedCompetency };
    return { type: 'org' };
  }
  if (role === 'BU_HEAD' && userBusinessUnitId) {
    return {
      type: 'bu',
      buId: userBusinessUnitId,
      competency: selectedCompetency || undefined,
    };
  }
  if (role === 'HRBP') {
    return hrbpMode === 'direct'
      ? { type: 'hrbp-direct', competency: selectedCompetency || undefined }
      : { type: 'hrbp-hierarchy', competency: selectedCompetency || undefined };
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
    if (selectedBU) {
      return getBUAnalytics(surveyId, selectedBU, selectedCompetency || undefined);
    }
    if (selectedCompetency) return getCompetencyAnalytics(surveyId, selectedCompetency);
    return getOrgAnalytics(surveyId);
  }
  if (role === 'BU_HEAD' && userBusinessUnitId) {
    return getBUAnalytics(surveyId, userBusinessUnitId, selectedCompetency || undefined);
  }
  if (role === 'HRBP') {
    return hrbpMode === 'direct'
      ? getHrbpDirectAnalytics(surveyId, selectedCompetency || undefined)
      : getHrbpHierarchyAnalytics(surveyId, selectedCompetency || undefined);
  }
  return null;
};

export const getScopeLabel = (scope: AnalyticsScope | null): string | null => {
  if (!scope) return null;
  const competencySuffix =
    'competency' in scope && scope.competency ? ` · ${scope.competency}` : '';
  switch (scope.type) {
    case 'org':
      return 'All Organisation';
    case 'bu':
      return scope.competency
        ? `Business Unit · Competency: ${scope.competency}`
        : 'Business Unit';
    case 'competency':
      return `Competency: ${scope.competency}`;
    case 'hrbp-direct':
      return `Direct Reports${competencySuffix}`;
    case 'hrbp-hierarchy':
      return `Full Hierarchy${competencySuffix}`;
  }
};
