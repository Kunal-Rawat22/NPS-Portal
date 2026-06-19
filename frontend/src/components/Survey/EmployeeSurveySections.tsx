import React from 'react';
import { Link } from 'react-router-dom';
import { Survey } from '../../types';
import { MySurveyResponseStatus } from '../../api/responses';
import { CategorizedEmployeeSurveys, getParticipation } from './employeeSurveyUtils';
import { ClipboardList, CheckCircle, Clock, FileEdit, Archive, AlertCircle } from 'lucide-react';

interface Props {
  categories: CategorizedEmployeeSurveys;
  responseBySurvey: Map<string, MySurveyResponseStatus>;
  layout?: 'grid' | 'list';
}

const SurveySection: React.FC<{
  title: string;
  count: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <div className="space-y-3">
    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
      {title} ({count})
    </h2>
    {children}
  </div>
);

const StatusBadge: React.FC<{ participation: ReturnType<typeof getParticipation> }> = ({ participation }) => {
  switch (participation) {
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} /> Submitted
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FileEdit size={12} /> Draft
        </span>
      );
    case 'closed_draft':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <FileEdit size={12} /> Unsubmitted Draft
        </span>
      );
    case 'not_participated':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Not Participated
        </span>
      );
    default:
      return null;
  }
};

const SurveyIcon: React.FC<{ participation: ReturnType<typeof getParticipation> }> = ({ participation }) => {
  const base = 'p-2.5 rounded-xl shrink-0';
  switch (participation) {
    case 'submitted':
      return (
        <div className={`${base} bg-green-100`}>
          <CheckCircle className="text-green-600" size={22} />
        </div>
      );
    case 'not_participated':
      return (
        <div className={`${base} bg-gray-100`}>
          <Archive className="text-gray-400" size={22} />
        </div>
      );
    case 'closed_draft':
      return (
        <div className={`${base} bg-orange-50`}>
          <AlertCircle className="text-orange-500" size={22} />
        </div>
      );
    default:
      return (
        <div className={`${base} bg-primary-50`}>
          <ClipboardList className="text-primary-600" size={22} />
        </div>
      );
  }
};

const ActionButton: React.FC<{
  surveyId: string;
  participation: ReturnType<typeof getParticipation>;
  fullWidth?: boolean;
}> = ({ surveyId, participation, fullWidth }) => {
  const className = fullWidth ? 'w-full text-center block text-sm' : 'text-sm whitespace-nowrap';

  switch (participation) {
    case 'submitted':
      return (
        <Link to={`/surveys/${surveyId}/take`} className={`btn-secondary ${className}`}>
          View Submission
        </Link>
      );
    case 'in_progress':
      return (
        <Link to={`/surveys/${surveyId}/take`} className={`btn-primary ${className}`}>
          Complete the Survey
        </Link>
      );
    case 'new':
      return (
        <Link to={`/surveys/${surveyId}/take`} className={`btn-primary ${className}`}>
          Take Survey
        </Link>
      );
    case 'closed_draft':
      return (
        <Link to={`/surveys/${surveyId}/take`} className={`btn-secondary ${className}`}>
          View Draft
        </Link>
      );
    default:
      return null;
  }
};

const EmployeeSurveyCard: React.FC<{
  survey: Survey;
  response?: MySurveyResponseStatus;
  layout: 'grid' | 'list';
}> = ({ survey, response, layout }) => {
  const participation = getParticipation(survey, response);
  const notParticipated = participation === 'not_participated';
  const submitted = participation === 'submitted';

  const cardClass = [
    'card transition-shadow',
    submitted ? 'border-green-200 bg-green-50/40' : '',
    participation === 'closed_draft' ? 'border-orange-200 bg-orange-50/30' : '',
    notParticipated ? 'opacity-80' : 'hover:shadow-md',
  ].filter(Boolean).join(' ');

  const meta = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
      <span className="inline-flex items-center gap-1">
        <Clock size={13} />
        {survey.questions.length} questions
      </span>
      {survey.endDate && (
        <span>· Ended {new Date(survey.endDate).toLocaleDateString()}</span>
      )}
      {submitted && response?.submittedAt && (
        <span>· Submitted {new Date(response.submittedAt).toLocaleDateString()}</span>
      )}
      {notParticipated && <span>· You did not submit a response</span>}
    </div>
  );

  if (layout === 'list') {
    return (
      <div className={cardClass}>
        <div className="flex items-start gap-4">
          <SurveyIcon participation={participation} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{survey.title}</h3>
              <span className={`badge-${survey.status.toLowerCase()}`}>{survey.status}</span>
              <StatusBadge participation={participation} />
            </div>
            {survey.description && (
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{survey.description}</p>
            )}
            {meta}
          </div>
          {!notParticipated && (
            <div className="shrink-0 self-center">
              <ActionButton surveyId={survey.id} participation={participation} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${cardClass} flex flex-col h-full`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <SurveyIcon participation={participation} />
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          <span className={`badge-${survey.status.toLowerCase()}`}>{survey.status}</span>
          <StatusBadge participation={participation} />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{survey.title}</h3>

      {survey.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{survey.description}</p>
      )}

      <div className="mt-auto space-y-3">
        {meta}
        {!notParticipated && (
          <ActionButton surveyId={survey.id} participation={participation} fullWidth />
        )}
      </div>
    </div>
  );
};

const EmployeeSurveySections: React.FC<Props> = ({ categories, responseBySurvey, layout = 'grid' }) => {
  const wrapperClass = layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3';

  const renderSurveys = (surveys: Survey[]) =>
    surveys.map(survey => (
      <EmployeeSurveyCard
        key={survey.id}
        survey={survey}
        response={responseBySurvey.get(survey.id)}
        layout={layout}
      />
    ));

  const hasAny =
    categories.activeNew.length > 0 ||
    categories.activeInProgress.length > 0 ||
    categories.activeCompleted.length > 0 ||
    categories.pastCompleted.length > 0 ||
    categories.pastClosedDraft.length > 0 ||
    categories.pastMissed.length > 0;

  if (!hasAny) {
    return (
      <div className="card text-center py-12">
        <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
        <h3 className="text-lg font-medium text-gray-900">No surveys available</h3>
        <p className="text-gray-500 mt-1">There are no active or past surveys to show right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(categories.activeNew.length > 0 || categories.activeInProgress.length > 0) && (
        <SurveySection
          title="Active — Action Required"
          count={categories.activeNew.length + categories.activeInProgress.length}
        >
          <div className={wrapperClass}>
            {renderSurveys([...categories.activeNew, ...categories.activeInProgress])}
          </div>
        </SurveySection>
      )}

      {categories.activeCompleted.length > 0 && (
        <SurveySection title="Active — Completed" count={categories.activeCompleted.length}>
          <div className={wrapperClass}>{renderSurveys(categories.activeCompleted)}</div>
        </SurveySection>
      )}

      {categories.pastCompleted.length > 0 && (
        <SurveySection title="Past Surveys — Your Responses" count={categories.pastCompleted.length}>
          <div className={wrapperClass}>{renderSurveys(categories.pastCompleted)}</div>
        </SurveySection>
      )}

      {categories.pastClosedDraft.length > 0 && (
        <SurveySection title="Past Surveys — Unsubmitted Drafts" count={categories.pastClosedDraft.length}>
          <div className={wrapperClass}>{renderSurveys(categories.pastClosedDraft)}</div>
        </SurveySection>
      )}

      {categories.pastMissed.length > 0 && (
        <SurveySection title="Past Surveys — Not Participated" count={categories.pastMissed.length}>
          <div className={wrapperClass}>{renderSurveys(categories.pastMissed)}</div>
        </SurveySection>
      )}
    </div>
  );
};

export default EmployeeSurveySections;
