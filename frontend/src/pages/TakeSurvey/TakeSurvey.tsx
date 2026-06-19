import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSurvey } from '../../api/surveys';
import { getMyResponse, startResponse, saveDraft, submitResponse } from '../../api/responses';
import { CheckCircle, ArrowLeft, Save, Archive } from 'lucide-react';

const RATING_LABELS = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

const buildAnswerPayload = (answers: Record<string, { rating: number; comment: string }>) =>
  Object.entries(answers)
    .filter(([, v]) => v.rating >= 1 && v.rating <= 5)
    .map(([questionId, v]) => ({ questionId, rating: v.rating, comment: v.comment || undefined }));

const TakeSurvey: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [responseId, setResponseId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { rating: number; comment: string }>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isClosedDraft, setIsClosedDraft] = useState(false);
  const [closedNotParticipated, setClosedNotParticipated] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | undefined>();
  const [initError, setInitError] = useState('');
  const [actionError, setActionError] = useState('');
  const [initializing, setInitializing] = useState(true);

  const { data: survey } = useQuery({ queryKey: ['survey', id], queryFn: () => getSurvey(id!) });

  const isReadOnly = isSubmitted || isClosedDraft;

  useEffect(() => {
    if (!id || !survey) return;
    let cancelled = false;

    const loadAnswers = (existing: NonNullable<Awaited<ReturnType<typeof getMyResponse>>>) => {
      const loaded: typeof answers = {};
      (existing.answers ?? []).forEach(a => {
        loaded[a.questionId] = { rating: a.rating, comment: a.comment || '' };
      });
      setAnswers(loaded);
      setResponseId(existing.id);
    };

    const initResponse = async () => {
      setInitializing(true);
      setInitError('');
      setClosedNotParticipated(false);
      setIsClosedDraft(false);
      try {
        const existing = await getMyResponse(id);
        if (cancelled) return;

        if (survey.status === 'CLOSED') {
          if (!existing) {
            setClosedNotParticipated(true);
            return;
          }
          if (existing.status === 'SUBMITTED') {
            setIsSubmitted(true);
            setSubmittedAt(existing.submittedAt);
            loadAnswers(existing);
            return;
          }
          if (existing.status === 'IN_PROGRESS') {
            setIsClosedDraft(true);
            loadAnswers(existing);
            return;
          }
        }

        if (existing?.status === 'SUBMITTED') {
          setIsSubmitted(true);
          setSubmittedAt(existing.submittedAt);
          loadAnswers(existing);
          return;
        }

        if (existing?.status === 'IN_PROGRESS') {
          loadAnswers(existing);
          return;
        }

        if (survey.status !== 'ACTIVE') {
          setClosedNotParticipated(true);
          return;
        }

        const session = await startResponse(id);
        if (cancelled) return;
        setResponseId(session.id);
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
  }, [id, survey]);

  const saveMutation = useMutation({
    mutationFn: () => saveDraft(responseId!, buildAnswerPayload(answers)),
    onSuccess: () => {
      setActionError('');
      qc.invalidateQueries({ queryKey: ['my-survey-responses'] });
      navigate('/dashboard');
    },
    onError: (e: any) => setActionError(e.response?.data?.message || 'Failed to save draft'),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await saveDraft(responseId!, buildAnswerPayload(answers));
      return submitResponse(responseId!);
    },
    onSuccess: (data) => {
      setActionError('');
      setIsSubmitted(true);
      setIsClosedDraft(false);
      setSubmittedAt(data.submittedAt);
      qc.invalidateQueries({ queryKey: ['my-survey-responses'] });
    },
    onError: (e: any) => setActionError(e.response?.data?.message || 'Failed to submit survey'),
  });

  const setRating = (qId: string, rating: number) => {
    if (isReadOnly) return;
    setAnswers(p => ({ ...p, [qId]: { ...p[qId], rating, comment: p[qId]?.comment || '' } }));
  };

  const setComment = (qId: string, comment: string) => {
    if (isReadOnly) return;
    setAnswers(p => ({ ...p, [qId]: { ...p[qId], comment, rating: p[qId]?.rating || 0 } }));
  };

  const sortedQuestions = [...(survey?.questions || [])].sort((a, b) => a.questionOrder - b.questionOrder);
  const allAnswered = sortedQuestions.every(q => (answers[q.id]?.rating ?? 0) >= 1);
  const actionsDisabled = initializing || !responseId || saveMutation.isPending || submitMutation.isPending;

  if (!survey || initializing) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  }

  if (closedNotParticipated) {
    return (
      <div className="max-w-2xl mx-auto mt-16">
        <div className="card text-center py-12">
          <Archive className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900">Survey Closed</h2>
          <p className="text-gray-500 mt-2">
            This survey is no longer active and you did not submit a response.
          </p>
          <button onClick={() => navigate('/surveys')} className="btn-primary mt-6">Back to Surveys</button>
        </div>
      </div>
    );
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
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            {isSubmitted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={12} /> Submitted
              </span>
            )}
            {isClosedDraft && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Closed — Unsubmitted Draft
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isSubmitted && submittedAt
              ? `Submitted on ${new Date(submittedAt).toLocaleString()}`
              : isClosedDraft
                ? 'This survey is closed. Your saved draft is shown below.'
                : isReadOnly
                  ? 'Your submission is recorded below'
                  : `${answeredCount} of ${sortedQuestions.length} answered`}
          </p>
        </div>
      </div>

      {isClosedDraft && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm">
          This survey has closed and no longer accepts submissions.
        </div>
      )}

      {actionError && !isReadOnly && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{actionError}</div>
      )}

      {!isReadOnly && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${(answeredCount / sortedQuestions.length) * 100}%` }} />
        </div>
      )}

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
                    type="button"
                    onClick={() => setRating(q.id, r)}
                    disabled={isReadOnly}
                    className={`flex-1 min-w-[60px] py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      answers[q.id]?.rating === r
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : isReadOnly
                          ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-default'
                          : 'border-gray-200 hover:border-primary-300 text-gray-700'
                    }`}
                  >
                    <div className="text-lg">{r}</div>
                    <div className="text-xs leading-tight hidden sm:block">{RATING_LABELS[r]}</div>
                  </button>
                ))}
              </div>
              {isReadOnly ? (
                answers[q.id]?.comment ? (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 italic">
                    &ldquo;{answers[q.id].comment}&rdquo;
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No comment</p>
                )
              ) : (
                <textarea
                  className="input text-sm"
                  rows={2}
                  placeholder="Add a comment (optional)..."
                  value={answers[q.id]?.comment || ''}
                  onChange={e => setComment(q.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="flex gap-3 pb-6">
        {isReadOnly ? (
          <button onClick={() => navigate('/surveys')} className="btn-primary flex-1">
            Back to Surveys
          </button>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default TakeSurvey;
