import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSurveys } from '../../api/surveys';
import { getMySurveyResponseStatuses } from '../../api/responses';
import { ClipboardList, CheckCircle, Clock, FileEdit } from 'lucide-react';

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

  const activeSurveys = surveys.filter(s => s.status === 'ACTIVE');
  const pendingSurveys = activeSurveys.filter(s => responseBySurvey.get(s.id)?.status !== 'SUBMITTED');
  const submittedSurveys = activeSurveys.filter(s => responseBySurvey.get(s.id)?.status === 'SUBMITTED');

  const isLoading = surveysLoading || responsesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const renderSurveyCard = (survey: typeof activeSurveys[0], submitted: boolean) => {
    const response = responseBySurvey.get(survey.id);
    const inProgress = response?.status === 'IN_PROGRESS';

    return (
      <div
        key={survey.id}
        className={`card transition-shadow ${submitted ? 'border-green-200 bg-green-50/30' : 'hover:shadow-md'}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${submitted ? 'bg-green-100' : 'bg-primary-50'}`}>
            {submitted ? (
              <CheckCircle className="text-green-600" size={20} />
            ) : (
              <ClipboardList className="text-primary-600" size={20} />
            )}
          </div>
          {submitted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle size={12} /> Submitted
            </span>
          ) : inProgress ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <FileEdit size={12} /> In Progress
            </span>
          ) : (
            <span className="badge-active">ACTIVE</span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{survey.title}</h3>
        {survey.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{survey.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Clock size={14} />
          <span>{survey.questions.length} questions</span>
          {survey.endDate && <span>· Due {new Date(survey.endDate).toLocaleDateString()}</span>}
          {submitted && response?.submittedAt && (
            <span>· Submitted {new Date(response.submittedAt).toLocaleDateString()}</span>
          )}
        </div>
        {submitted ? (
          <Link
            to={`/surveys/${survey.id}/take`}
            className="btn-secondary w-full text-center block"
          >
            View Submission
          </Link>
        ) : (
          <Link to={`/surveys/${survey.id}/take`} className="btn-primary w-full text-center block">
            {inProgress ? 'Continue Survey' : 'Take Survey'}
          </Link>
        )}
      </div>
    );
  };

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
        <>
          {pendingSurveys.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Pending ({pendingSurveys.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSurveys.map(survey => renderSurveyCard(survey, false))}
              </div>
            </div>
          )}

          {submittedSurveys.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Completed ({submittedSurveys.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submittedSurveys.map(survey => renderSurveyCard(survey, true))}
              </div>
            </div>
          )}

          {pendingSurveys.length === 0 && submittedSurveys.length > 0 && (
            <div className="card text-center py-8 bg-green-50 border-green-100">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
              <h3 className="text-lg font-medium text-gray-900">All active surveys completed!</h3>
              <p className="text-gray-500 mt-1 text-sm">You&apos;ve submitted all currently active surveys.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeDashboard;
