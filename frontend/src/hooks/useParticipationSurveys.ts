import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getParticipationSurveys } from '../api/surveys';
import { getMySurveyResponseStatuses } from '../api/responses';
import { categorizeEmployeeSurveys } from '../components/Survey/employeeSurveyUtils';

export const useParticipationSurveys = () => {
  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ['surveys', 'participation'],
    queryFn: getParticipationSurveys,
  });

  const { data: myResponses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['my-survey-responses'],
    queryFn: getMySurveyResponseStatuses,
  });

  const responseBySurvey = useMemo(
    () => new Map(myResponses.map(r => [r.surveyId, r])),
    [myResponses]
  );

  const categories = useMemo(
    () => categorizeEmployeeSurveys(surveys, responseBySurvey),
    [surveys, responseBySurvey]
  );

  return {
    surveys,
    myResponses,
    responseBySurvey,
    categories,
    isLoading: surveysLoading || responsesLoading,
  };
};
