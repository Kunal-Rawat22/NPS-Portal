import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSurveys, deleteSurvey, closeSurvey } from '../../api/surveys';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Plus, Edit, Trash2, XCircle, Eye } from 'lucide-react';

const SurveyList: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const qc = useQueryClient();
  const { data: surveys = [], isLoading } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });

  const deleteMutation = useMutation({ mutationFn: deleteSurvey, onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }) });
  const closeMutation = useMutation({ mutationFn: closeSurvey, onSuccess: () => qc.invalidateQueries({ queryKey: ['surveys'] }) });

  if (isLoading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        {user?.role === 'ADMIN' && (
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
              <div className="flex items-center gap-2 ml-4">
                {user?.role === 'EMPLOYEE' && s.status === 'ACTIVE' && (
                  <Link to={`/surveys/${s.id}/take`} className="btn-primary text-sm">Take Survey</Link>
                )}
                {user?.role === 'ADMIN' && (
                  <>
                    {s.status === 'DRAFT' && (
                      <Link to={`/surveys/${s.id}/edit`} className="btn-secondary flex items-center gap-1 text-sm"><Edit size={14} /> Edit</Link>
                    )}
                    {s.status === 'ACTIVE' && (
                      <button onClick={() => closeMutation.mutate(s.id)} className="btn-secondary flex items-center gap-1 text-sm text-orange-600"><XCircle size={14} /> Close</button>
                    )}
                    {s.status === 'DRAFT' && (
                      <button onClick={() => { if (confirm('Delete this survey?')) deleteMutation.mutate(s.id); }} className="btn-secondary flex items-center gap-1 text-sm text-red-600"><Trash2 size={14} /> Delete</button>
                    )}
                    {s.status !== 'DRAFT' && (
                      <Link to={`/analytics?surveyId=${s.id}`} className="btn-secondary flex items-center gap-1 text-sm"><Eye size={14} /> Analytics</Link>
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
            {user?.role === 'ADMIN' && <Link to="/surveys/new" className="btn-primary mt-4 inline-block">Create your first survey</Link>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyList;
