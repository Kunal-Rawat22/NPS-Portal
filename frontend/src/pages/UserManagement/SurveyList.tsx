import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSurveys, deleteSurvey, closeSurvey, reopenSurvey } from '../../api/surveys';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Survey } from '../../types';
import SurveyQuestionsModal from '../../components/Survey/SurveyQuestionsModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmployeeSurveySections from '../../components/Survey/EmployeeSurveySections';
import { useParticipationSurveys } from '../../hooks/useParticipationSurveys';
import { Plus, Edit, Trash2, XCircle, Eye, ListOrdered, RotateCcw } from 'lucide-react';

const SurveyList: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { viewMode } = useSelector((s: RootState) => s.ui);
  const qc = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  const showParticipationView = isEmployee || viewMode === 'participation';
  const isManagerView = !isEmployee && !showParticipationView;
  const [viewQuestionsSurvey, setViewQuestionsSurvey] = useState<Survey | null>(null);
  const [reopenTarget, setReopenTarget] = useState<Survey | null>(null);

  const participation = useParticipationSurveys();

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: getSurveys,
    enabled: !showParticipationView,
  });

  const deleteMutation = useMutation({ mutationFn: deleteSurvey, onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }) });
  const closeMutation = useMutation({ mutationFn: closeSurvey, onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }) });
  const reopenMutation = useMutation({ mutationFn: reopenSurvey, onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }) });

  const isLoading = showParticipationView ? participation.isLoading : surveysLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (showParticipationView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-500 mt-1">All active and past surveys with your participation status</p>
        </div>
        <EmployeeSurveySections
          categories={participation.categories}
          responseBySurvey={participation.responseBySurvey}
          layout="list"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        {isAdmin && (
          <Link to="/surveys/new" className="btn-primary flex items-center gap-2"><Plus size={18} /> New Survey</Link>
        )}
      </div>

      <div className="space-y-4">
        {surveys.map(s => (
          <div key={s.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{s.title}</h3>
                  <span className={`badge-${s.status.toLowerCase()}`}>{s.status}</span>
                </div>
                {s.description && <p className="text-sm text-gray-500 mb-2">{s.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{s.questions.length} questions</span>
                  {s.startDate && <span>Starts {new Date(s.startDate).toLocaleDateString()}</span>}
                  {s.endDate && <span>Ends {new Date(s.endDate).toLocaleDateString()}</span>}
                  <span>By {s.createdByName}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 ml-4">
                {isManagerView && (s.status === 'ACTIVE' || s.status === 'CLOSED' || s.status === 'DRAFT') && (
                  <button
                    type="button"
                    onClick={() => setViewQuestionsSurvey(s)}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    <ListOrdered size={14} /> Questions
                  </button>
                )}
                {isManagerView && s.status !== 'DRAFT' && (
                  <Link to={`/analytics?surveyId=${s.id}`} className="btn-secondary flex items-center gap-1 text-sm">
                    <Eye size={14} /> Analytics
                  </Link>
                )}
                {isAdmin && (
                  <>
                    {s.status === 'DRAFT' && (
                      <Link to={`/surveys/${s.id}/edit`} className="btn-secondary flex items-center gap-1 text-sm"><Edit size={14} /> Edit</Link>
                    )}
                    {s.status === 'ACTIVE' && (
                      <button onClick={() => closeMutation.mutate(s.id)} className="btn-secondary flex items-center gap-1 text-sm text-orange-600"><XCircle size={14} /> Close</button>
                    )}
                    {s.status === 'CLOSED' && (
                      <button
                        type="button"
                        onClick={() => setReopenTarget(s)}
                        className="btn-secondary flex items-center gap-1 text-sm text-green-600"
                      >
                        <RotateCcw size={14} /> Reopen
                      </button>
                    )}
                    {s.status === 'DRAFT' && (
                      <button onClick={() => { if (confirm('Delete this survey?')) deleteMutation.mutate(s.id); }} className="btn-secondary flex items-center gap-1 text-sm text-red-600"><Trash2 size={14} /> Delete</button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {surveys.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            <p>No surveys found.</p>
            {isAdmin && <Link to="/surveys/new" className="btn-primary mt-4 inline-block">Create your first survey</Link>}
          </div>
        )}
      </div>

      <SurveyQuestionsModal
        open={!!viewQuestionsSurvey}
        survey={viewQuestionsSurvey}
        onClose={() => setViewQuestionsSurvey(null)}
      />

      <ConfirmDialog
        open={!!reopenTarget}
        title="Reopen Survey"
        message={
          reopenTarget
            ? `Reopen "${reopenTarget.title}"? Employees will be able to take or complete it again.`
            : ''
        }
        confirmLabel="Reopen"
        confirmVariant="primary"
        onConfirm={() => {
          if (reopenTarget) reopenMutation.mutate(reopenTarget.id);
          setReopenTarget(null);
        }}
        onCancel={() => setReopenTarget(null)}
      />
    </div>
  );
};

export default SurveyList;
