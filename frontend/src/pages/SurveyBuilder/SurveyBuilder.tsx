import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSurvey, createSurvey, updateSurvey, activateSurvey, SurveyPayload } from '../../api/surveys';
import { getCategories } from '../../api/categories';
import { Survey } from '../../types';
import { Plus, Trash2, Send, ArrowLeft, GripVertical, Pencil } from 'lucide-react';
import ConfirmDialog from '../../components/ConfirmDialog';

interface DraftQuestion {
  clientId: string;
  id?: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
}

const toDraftQuestions = (questions: Survey['questions']): DraftQuestion[] =>
  [...questions]
    .sort((a, b) => a.questionOrder - b.questionOrder)
    .map(q => ({
      clientId: q.id,
      id: q.id,
      questionText: q.questionText,
      categoryId: q.category.id,
      categoryName: q.category.name,
    }));

const SurveyBuilder: React.FC = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([]);
  const [questionForm, setQuestionForm] = useState({ questionText: '', categoryId: '' });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [surveyId, setSurveyId] = useState<string | null>(id || null);
  const [surveyStatus, setSurveyStatus] = useState<Survey['status']>('DRAFT');
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(!id);
  const [questionToDelete, setQuestionToDelete] = useState<DraftQuestion | null>(null);

  const { data: survey } = useQuery<Survey>({
    queryKey: ['survey', surveyId],
    queryFn: () => getSurvey(surveyId!),
    enabled: !!surveyId && !initialized,
  });

  useEffect(() => {
    if (survey && !initialized) {
      setForm({
        title: survey.title,
        description: survey.description || '',
        startDate: survey.startDate || '',
        endDate: survey.endDate || '',
      });
      setDraftQuestions(toDraftQuestions(survey.questions));
      setSurveyStatus(survey.status);
      setInitialized(true);
    }
  }, [survey, initialized]);

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const buildPayload = (): SurveyPayload => ({
    ...form,
    questions: draftQuestions.map((q, index) => ({
      ...(q.id ? { id: q.id } : {}),
      questionText: q.questionText,
      categoryId: q.categoryId,
      questionOrder: index,
    })),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (surveyId) {
        return updateSurvey(surveyId, payload);
      }
      return createSurvey(payload);
    },
    onSuccess: (data) => {
      setSurveyId(data.id);
      setSurveyStatus(data.status);
      setDraftQuestions(toDraftQuestions(data.questions));
      setInitialized(true);
      qc.invalidateQueries({ queryKey: ['surveys'] });
      qc.invalidateQueries({ queryKey: ['survey', data.id] });
      if (!isEdit) {
        navigate(`/surveys/${data.id}/edit`, { replace: true });
      }
      setError('');
    },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to save survey'),
  });

  const activateMutation = useMutation({
    mutationFn: activateSurvey,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['surveys'] }); navigate('/surveys'); },
    onError: (e: any) => setError(e.response?.data?.message || 'Failed to publish survey'),
  });

  const handleSave = () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    saveMutation.mutate();
  };

  const handlePublish = async () => {
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (draftQuestions.length === 0) { setError('Add at least one question before publishing'); return; }
    try {
      const saved = await saveMutation.mutateAsync();
      await activateMutation.mutateAsync(saved.id);
    } catch {
      // errors handled by mutation onError
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({ questionText: '', categoryId: '' });
    setEditingClientId(null);
  };

  const handleSaveQuestion = () => {
    setError('');
    if (!questionForm.questionText.trim() || !questionForm.categoryId) {
      setError('Question text and category are required');
      return;
    }
    if (categories.length === 0) {
      setError('No categories available. Create categories in Settings first.');
      return;
    }
    const categoryName = categories.find(c => c.id === questionForm.categoryId)?.name || '';

    if (editingClientId) {
      setDraftQuestions(prev =>
        prev.map(q =>
          q.clientId === editingClientId
            ? { ...q, questionText: questionForm.questionText.trim(), categoryId: questionForm.categoryId, categoryName }
            : q
        )
      );
    } else {
      setDraftQuestions(prev => [
        ...prev,
        {
          clientId: crypto.randomUUID(),
          questionText: questionForm.questionText.trim(),
          categoryId: questionForm.categoryId,
          categoryName,
        },
      ]);
    }
    resetQuestionForm();
    setError('');
  };

  const handleEditQuestion = (q: DraftQuestion) => {
    setEditingClientId(q.clientId);
    setQuestionForm({ questionText: q.questionText, categoryId: q.categoryId });
  };

  const handleDeleteQuestion = (q: DraftQuestion) => {
    setQuestionToDelete(q);
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    setDraftQuestions(prev => prev.filter(q => q.clientId !== questionToDelete.clientId));
    if (editingClientId === questionToDelete.clientId) resetQuestionForm();
    setQuestionToDelete(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setDraftQuestions(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const isDraft = surveyStatus === 'DRAFT';
  const isSaving = saveMutation.isPending || activateMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/surveys')} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Survey' : 'Create Survey'}</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Survey Details</h2>
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Q2 2025 Pulse Survey" disabled={!isDraft} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this survey..." disabled={!isDraft} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" className="input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} disabled={!isDraft} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" className="input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} disabled={!isDraft} />
          </div>
        </div>
        {isDraft && (
          <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
            {saveMutation.isPending ? 'Saving...' : surveyId ? 'Update Survey' : 'Save Survey'}
          </button>
        )}
      </div>

      {isDraft && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Questions ({draftQuestions.length})</h2>
            {draftQuestions.length > 1 && (
              <p className="text-xs text-gray-500">Drag to reorder · saved when you update the survey</p>
            )}
          </div>

          <div className="space-y-2">
            {draftQuestions.map((q, i) => (
              <div
                key={q.clientId}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-2 p-3 bg-gray-50 rounded-lg border transition-colors ${
                  dragIndex === i ? 'opacity-50 border-primary-300' : 'border-transparent'
                } ${dragOverIndex === i && dragIndex !== i ? 'border-primary-400 bg-primary-50' : ''}`}
              >
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-0.5 touch-none"
                  aria-label="Drag to reorder"
                  onMouseDown={e => e.stopPropagation()}
                >
                  <GripVertical size={18} />
                </button>
                <span className="text-sm font-medium text-gray-400 mt-0.5 w-5">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{q.questionText}</p>
                  <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{q.categoryName}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEditQuestion(q)} className="text-gray-400 hover:text-primary-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h3 className="font-medium text-gray-900">{editingClientId ? 'Edit Question' : 'Add Question'}</h3>
            <input
              className="input"
              placeholder="Question text..."
              value={questionForm.questionText}
              onChange={e => setQuestionForm(p => ({ ...p, questionText: e.target.value }))}
            />
            <div>
              <label className="label">Category *</label>
              <select className="input" value={questionForm.categoryId} onChange={e => setQuestionForm(p => ({ ...p, categoryId: e.target.value }))}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No categories found. Add survey categories in Settings before adding questions.</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveQuestion} className="btn-secondary flex items-center gap-2">
                <Plus size={16} /> {editingClientId ? 'Update Question' : 'Add Question'}
              </button>
              {editingClientId && (
                <button onClick={resetQuestionForm} className="btn-secondary">Cancel</button>
              )}
            </div>
          </div>
        </div>
      )}

      {isDraft && draftQuestions.length > 0 && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-900">Ready to publish?</h3>
              <p className="text-sm text-green-700 mt-0.5">Saves your changes and makes this survey visible to all employees.</p>
            </div>
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isSaving}
            >
              <Send size={16} /> {activateMutation.isPending ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!questionToDelete}
        title="Remove question?"
        message={
          questionToDelete
            ? `Are you sure you want to remove "${questionToDelete.questionText}"? This change will apply when you save the survey.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={confirmDeleteQuestion}
        onCancel={() => setQuestionToDelete(null)}
      />
    </div>
  );
};

export default SurveyBuilder;
