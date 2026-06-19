import { Survey } from '../../types';
import { MySurveyResponseStatus } from '../../api/responses';

export type EmployeeParticipation = 'new' | 'in_progress' | 'submitted' | 'closed_draft' | 'not_participated';

export interface CategorizedEmployeeSurveys {
  activeNew: Survey[];
  activeInProgress: Survey[];
  activeCompleted: Survey[];
  pastCompleted: Survey[];
  pastClosedDraft: Survey[];
  pastMissed: Survey[];
}

export const getParticipation = (
  survey: Survey,
  response?: MySurveyResponseStatus
): EmployeeParticipation => {
  if (!response) {
    return survey.status === 'CLOSED' ? 'not_participated' : 'new';
  }
  if (response.status === 'SUBMITTED') return 'submitted';
  return survey.status === 'CLOSED' ? 'closed_draft' : 'in_progress';
};

export const categorizeEmployeeSurveys = (
  surveys: Survey[],
  responseBySurvey: Map<string, MySurveyResponseStatus>
): CategorizedEmployeeSurveys => {
  const result: CategorizedEmployeeSurveys = {
    activeNew: [],
    activeInProgress: [],
    activeCompleted: [],
    pastCompleted: [],
    pastClosedDraft: [],
    pastMissed: [],
  };

  surveys.forEach(survey => {
    const response = responseBySurvey.get(survey.id);
    const participation = getParticipation(survey, response);

    switch (participation) {
      case 'new':
        result.activeNew.push(survey);
        break;
      case 'in_progress':
        result.activeInProgress.push(survey);
        break;
      case 'submitted':
        if (survey.status === 'ACTIVE') result.activeCompleted.push(survey);
        else result.pastCompleted.push(survey);
        break;
      case 'closed_draft':
        result.pastClosedDraft.push(survey);
        break;
      case 'not_participated':
        result.pastMissed.push(survey);
        break;
    }
  });

  return result;
};
