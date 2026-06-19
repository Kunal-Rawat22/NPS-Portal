import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSurvey } from '../../api/surveys';
import { startResponse, saveDraft, submitResponse } from '../../api/responses';
import { CheckCircle, ArrowLeft, Save } from 'lucide-react';

const RATING_LABELS = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

const buildAnswerPayload = (answers: Record<string, { rating: number; comment: string }>) =>
  Object.entries(answers)
    .filter(([, v]) => v.rating >= 1 && v.rating <= 5)
    .map(([questionId, v]) => ({ questionId, rating: v.rating, comment: v.comment || undefined }));

const TakeSurvey: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitted, setSubmitted] = useState(false);
  const [initError, setInitError] = useState('');
  const [actionError, setActionError] = useState('');
  const [initializing, setInitializing] = useState(true);

  const { data: survey } = useQuery({ queryKey: ['survey', id], queryFn: () => getSurvey(id!) });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const initResponse = async () => {
      setInitializing(true);
      setInitError('');
      try {
        const session = await startResponse(id);
        if (cancelled) return;

        setResponseId(session.id);
        if (session.status === 'SUBMITTED') setSubmitted(true);

        const loaded: typeof answers = {};
        (session.answers ?? []).forEach(a => {
          loaded[a.questionId] = { rating: a.rating, comment: a.comment || '' };
        });
        setAnswers(loaded);
      } catch (e: any) {
        if (!cancelled) {
          setInitError(e.response?.data?.message || 'Unable to start this survey. Please try again.');
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    };

    initResponse();
    return () => { cancelled = true; };
  }, [id]);

  const saveMutation = useMutation({
    mutationFn: () => saveDraft(responseId!, buildAnswerPayload(answers)),
    onSuccess: () => setActionError(''),
    onError: (e: any) => setActionError(e.response?.data?.message || 'Failed to save draft'),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await saveDraft(responseId!, buildAnswerPayload(answers));
      return submitResponse(responseId!);
    },
    onSuccess: () => {
      setActionError('');
      setSubmitted(true);
    },
    onError: (e: any) => setActionError(e.response?.data?.message || 'Failed to submit survey'),
  });

  const setRating = (qId: string, rating: number) =>
    setAnswers(p => ({ ...p, [qId]: { ...p[qId], rating, comment: p[qId]?.comment || '' } }));

  const setComment = (qId: string, comment: string) =>
    setAnswers(p => ({ ...p, [qId]: { ...p[qId], comment, rating: p[qId]?.rating || 0 } }));

  const sortedQuestions = [...(survey?.questions || [])].sort((a, b) => a.questionOrder - b.questionOrder);
  const allAnswered = sortedQuestions.every(q => (answers[q.id]?.rating ?? 0) >= 1);
  const actionsDisabled = initializing || !responseId || saveMutation.isPending || submitMutation.isPending;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="card py-12">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900">Survey Submitted!</h2>
          <p className="text-gray-500 mt-2">Thank you for completing the survey. Your responses have been recorded.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-6">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!survey || initializing) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  if (initError) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <div className="card text-center py-10">
          <p className="text-red-600">{initError}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary mt-4">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const groupedQuestions = sortedQuestions.reduce((acc: Record<string, typeof sortedQuestions>, q) => {
    const catName = q.category.name;
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(q);
    return acc;
  }, {});

  const answeredCount = sortedQuestions.filter(q => (answers[q.id]?.rating ?? 0) >= 1).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          <p className="text-sm text-gray-500">{answeredCount} of {sortedQuestions.length} answered</p>
        </div>
      </div>

      {actionError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{actionError}</div>}

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${(answeredCount / sortedQuestions.length) * 100}%` }} />
      </div>

      {Object.entries(groupedQuestions).map(([category, questions]) => (
        <div key={category} className="card space-y-6">
          <h2 className="font-semibold text-primary-700 text-lg border-b pb-2">{category}</h2>
          {questions.map((q, idx) => (
            <div key={q.id} className="space-y-3">
              <p className="font-medium text-gray-900">{idx + 1}. {q.questionText}</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setRating(q.id, r)}
                    className={`flex-1 min-w-[60px] py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      answers[q.id]?.rating === r
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <div className="text-lg">{r}</div>
                    <div className="text-xs leading-tight hidden sm:block">{RATING_LABELS[r]}</div>
                  </button>
                ))}
              </div>
              <textarea
                className="input text-sm"
                rows={2}
                placeholder="Add a comment (optional)..."
                value={answers[q.id]?.comment || ''}
                onChange={e => setComment(q.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}

      <div className="flex gap-3 pb-6">
        <button
          onClick={() => saveMutation.mutate()}
          className="btn-secondary flex items-center gap-2"
          disabled={actionsDisabled}
        >
          <Save size={16} /> {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={() => submitMutation.mutate()}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
          disabled={actionsDisabled || !allAnswered}
        >
          <CheckCircle size={16} /> {submitMutation.isPending ? 'Submitting...' : 'Submit Survey'}
        </button>
      </div>
    </div>
  );
};

export default TakeSurvey;
