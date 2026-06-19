import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSurveys } from '../../api/surveys';
import { getMySurveyResponseStatuses } from '../../api/responses';
import EmployeeSurveySections from '../../components/Survey/EmployeeSurveySections';
import { categorizeEmployeeSurveys } from '../../components/Survey/employeeSurveyUtils';

const EmployeeDashboard: React.FC = () => {
  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: getSurveys,
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

  const isLoading = surveysLoading || responsesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Surveys</h1>
        <p className="text-gray-500 mt-1">View active surveys, your submissions, and past survey history</p>
      </div>

      <EmployeeSurveySections
        categories={categories}
        responseBySurvey={responseBySurvey}
        layout="grid"
      />
    </div>
  );
};

export default EmployeeDashboard;
