import React from 'react';
import EmployeeSurveySections from '../../components/Survey/EmployeeSurveySections';
import { useParticipationSurveys } from '../../hooks/useParticipationSurveys';

const EmployeeDashboard: React.FC = () => {
  const { responseBySurvey, categories, isLoading } = useParticipationSurveys();

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
