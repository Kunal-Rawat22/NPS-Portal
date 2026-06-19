export type Role = 'ADMIN' | 'BU_HEAD' | 'HRBP' | 'EMPLOYEE';
export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type ResponseStatus = 'IN_PROGRESS' | 'SUBMITTED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: Role;
  businessUnitId?: string;
  businessUnitName?: string;
  hrbpId?: string;
  hrbpName?: string;
  reportingToId?: string;
  reportingToName?: string;
  competency?: string;
  isActive: boolean;
}

export interface BusinessUnit {
  id: string;
  name: string;
  headUserId?: string;
  headUserName?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Question {
  id: string;
  questionText: string;
  questionOrder: number;
  category: Category;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: SurveyStatus;
  createdById: string;
  createdByName: string;
  createdAt: string;
  questions: Question[];
}

export interface QuestionAnswer {
  questionId: string;
  questionText: string;
  rating: number;
  comment?: string;
  categoryId: string;
  categoryName: string;
}

export interface SurveyResponseData {
  id: string;
  surveyId: string;
  userId: string;
  status: ResponseStatus;
  submittedAt?: string;
  answers: QuestionAnswer[];
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  averageScore: number;
  responseCount: number;
  totalResponses: number;
}

export interface AnalyticsOverview {
  surveyId: string;
  surveyTitle: string;
  totalEmployees: number;
  completedResponses: number;
  completionRate: number;
  categoryScores: CategoryScore[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
