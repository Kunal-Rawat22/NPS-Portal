import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSurveys } from '../../api/surveys';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
  const { data: surveys = [], isLoading } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });
  const activeSurveys = surveys.filter(s => s.status === 'ACTIVE');

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Surveys</h1>
        <p className="text-gray-500 mt-1">Complete your assigned pulse surveys</p>
      </div>

      {activeSurveys.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
          <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
          <p className="text-gray-500 mt-1">No active surveys at the moment. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSurveys.map(survey => (
            <div key={survey.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-primary-50 p-2 rounded-lg">
                  <ClipboardList className="text-primary-600" size={20} />
                </div>
                <span className="badge-active">ACTIVE</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{survey.title}</h3>
              {survey.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{survey.description}</p>}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Clock size={14} />
                <span>{survey.questions.length} questions</span>
                {survey.endDate && <span>· Due {new Date(survey.endDate).toLocaleDateString()}</span>}
              </div>
              <Link to={`/surveys/${survey.id}/take`} className="btn-primary w-full text-center block">
                Take Survey
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
