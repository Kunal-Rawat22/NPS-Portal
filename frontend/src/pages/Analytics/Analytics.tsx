import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getSurveys } from '../../api/surveys';
import { getBusinessUnits } from '../../api/businessUnits';
import {
  fetchAnalyticsOverview,
  getAnalyticsAnswerDetails,
  getAnalyticsResponses,
  getCompetencies,
  getScopeLabel,
  resolveAnalyticsScope,
} from '../../api/analytics';
import { RootState } from '../../store';
import { BarChart3, ChevronDown, ChevronRight, Eye, TrendingUp, Users } from 'lucide-react';
import ResponseDetailsModal from '../../components/Analytics/ResponseDetailsModal';
import QuestionAverageLineChart from '../../components/Analytics/QuestionAverageLineChart';
import { AnalyticsAnswerDetail, EnrichedSurveyResponse } from '../../types';

type ModalView = {
  mode: 'all' | 'category' | 'question';
  title: string;
  subtitle?: string;
  categoryId?: string;
  questionId?: string;
};

const scoreBarColor = (score: number) =>
  score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-400';

const Analytics: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [searchParams] = useSearchParams();
  const [selectedSurvey, setSelectedSurvey] = useState(searchParams.get('surveyId') || '');
  const [selectedBU, setSelectedBU] = useState(
    searchParams.get('buId') || (user?.role === 'BU_HEAD' ? user.businessUnitId || '' : '')
  );
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const [hrbpMode, setHrbpMode] = useState<'direct' | 'hierarchy'>('direct');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [modalView, setModalView] = useState<ModalView | null>(null);
  const [modalResponses, setModalResponses] = useState<EnrichedSurveyResponse[]>([]);
  const [modalAnswers, setModalAnswers] = useState<AnalyticsAnswerDetail[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });
  const { data: bus = [] } = useQuery({
    queryKey: ['business-units'],
    queryFn: getBusinessUnits,
    enabled: user?.role === 'ADMIN' || user?.role === 'BU_HEAD',
  });
  const { data: competencies = [] } = useQuery({
    queryKey: ['competencies', user?.role, hrbpMode, selectedBU],
    queryFn: () =>
      getCompetencies(
        user?.role === 'HRBP' ? hrbpMode : undefined,
        user?.role === 'ADMIN' && selectedBU ? selectedBU : undefined
      ),
    enabled: user?.role === 'ADMIN' || user?.role === 'BU_HEAD' || user?.role === 'HRBP',
  });

  const analyticsSurveys = surveys.filter(s => s.status === 'ACTIVE' || s.status === 'CLOSED');

  const scope = useMemo(
    () => resolveAnalyticsScope(user?.role, selectedBU, selectedCompetency, hrbpMode, user?.businessUnitId),
    [user?.role, selectedBU, selectedCompetency, hrbpMode, user?.businessUnitId]
  );

  const scopeLabel = getScopeLabel(scope);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', user?.role, selectedSurvey, selectedBU, selectedCompetency, hrbpMode],
    queryFn: () =>
      fetchAnalyticsOverview(
        selectedSurvey,
        user?.role,
        selectedBU,
        selectedCompetency,
        hrbpMode,
        user?.businessUnitId
      ),
    enabled: !!selectedSurvey && !!scope,
  });

  useEffect(() => {
    if (analytics?.categoryScores.length) {
      setExpandedCategories(new Set(analytics.categoryScores.map(c => c.categoryId)));
    }
  }, [analytics?.categoryScores]);

  const chartData = analytics?.categoryScores.map(cs => ({
    name: cs.categoryName,
    score: cs.averageScore,
    responses: cs.responseCount,
  })) || [];

  const questionLineData = useMemo(() => {
    if (!analytics?.categoryScores) return [];
    const questions = analytics.categoryScores.flatMap(cs => cs.questions ?? []);
    return questions
      .sort((a, b) => a.questionOrder - b.questionOrder)
      .map((q, index) => ({
        label: `Q${index + 1}`,
        questionText: q.questionText,
        score: q.averageScore,
      }));
  }, [analytics?.categoryScores]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const openModal = async (view: ModalView) => {
    if (!selectedSurvey || !scope) return;
    setModalView(view);
    setModalLoading(true);
    setModalResponses([]);
    setModalAnswers([]);
    try {
      if (view.mode === 'all') {
        const data = await getAnalyticsResponses(selectedSurvey, scope);
        setModalResponses(data);
      } else {
        const data = await getAnalyticsAnswerDetails(selectedSurvey, scope, {
          categoryId: view.categoryId,
          questionId: view.questionId,
        });
        setModalAnswers(data);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalView(null);
    setModalResponses([]);
    setModalAnswers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Survey performance insights
            {scopeLabel && selectedSurvey && (
              <span className="ml-2 text-primary-600">· {scopeLabel}</span>
            )}
          </p>
        </div>
        {analytics && scope && (
          <button
            type="button"
            onClick={() =>
              openModal({
                mode: 'all',
                title: 'All Submitted Responses',
                subtitle: analytics.surveyTitle,
              })
            }
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Eye size={16} /> View All Responses
          </button>
        )}
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Survey</label>
            <select className="input" value={selectedSurvey} onChange={e => setSelectedSurvey(e.target.value)}>
              <option value="">Select a survey</option>
              {analyticsSurveys.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.status})</option>
              ))}
            </select>
          </div>
          {user?.role === 'ADMIN' && (
            <>
              <div>
                <label className="label">Business Unit</label>
                <select
                  className="input"
                  value={selectedBU}
                  onChange={e => {
                    setSelectedBU(e.target.value);
                    setSelectedCompetency('');
                  }}
                >
                  <option value="">All Organisation</option>
                  {bus.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Competency</label>
                <select
                  className="input"
                  value={selectedCompetency}
                  onChange={e => setSelectedCompetency(e.target.value)}
                >
                  <option value="">All Competencies</option>
                  {competencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {user?.role === 'BU_HEAD' && user.businessUnitName && (
            <>
              <div>
                <label className="label">Business Unit</label>
                <p className="input bg-gray-50 text-gray-700">{user.businessUnitName}</p>
              </div>
              <div>
                <label className="label">Competency</label>
                <select
                  className="input"
                  value={selectedCompetency}
                  onChange={e => setSelectedCompetency(e.target.value)}
                >
                  <option value="">All Competencies</option>
                  {competencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          {user?.role === 'HRBP' && (
            <>
              <div>
                <label className="label">View Mode</label>
                <select
                  className="input"
                  value={hrbpMode}
                  onChange={e => {
                    setHrbpMode(e.target.value as 'direct' | 'hierarchy');
                    setSelectedCompetency('');
                  }}
                >
                  <option value="direct">Direct Reports</option>
                  <option value="hierarchy">Full Hierarchy</option>
                </select>
              </div>
              <div>
                <label className="label">Competency</label>
                <select
                  className="input"
                  value={selectedCompetency}
                  onChange={e => setSelectedCompetency(e.target.value)}
                >
                  <option value="">All Competencies</option>
                  {competencies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {!selectedSurvey && (
        <div className="card text-center py-12">
          <BarChart3 className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">Select an active or completed survey to view analytics</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}

      {analytics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl"><Users className="text-blue-600" size={24} /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.completedResponses}</p>
                <p className="text-sm text-gray-500">Completed Surveys</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-xl"><TrendingUp className="text-green-600" size={24} /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl"><BarChart3 className="text-purple-600" size={24} /></div>
              <div>
                <p className="text-2xl font-bold">{analytics.categoryScores.length}</p>
                <p className="text-sm text-gray-500">Categories</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Category Scores (Bar)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(2), 'Avg Score']} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-2">Question Average Scores</h2>
              <p className="text-sm text-gray-500 mb-4">All questions in one chart — hover a point for details</p>
              {questionLineData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-12">No question data available</p>
              ) : (
                <QuestionAverageLineChart data={questionLineData} />
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="space-y-4">
              {analytics.categoryScores.map(cs => {
                const expanded = expandedCategories.has(cs.categoryId);
                return (
                  <div key={cs.categoryId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCategory(cs.categoryId)}
                          className="flex items-center gap-2 font-medium text-gray-800 hover:text-primary-700"
                        >
                          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          {cs.categoryName}
                        </button>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            {cs.averageScore.toFixed(2)} / 5.00 &nbsp;·&nbsp; {cs.responseCount} of {cs.totalResponses} respondents
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openModal({
                                mode: 'category',
                                title: `${cs.categoryName} — Responses`,
                                subtitle: analytics.surveyTitle,
                                categoryId: cs.categoryId,
                              })
                            }
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <Eye size={14} /> View
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all ${scoreBarColor(cs.averageScore)}`}
                          style={{ width: `${(cs.averageScore / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    {expanded && (
                      <div className="px-4 py-3 space-y-3 bg-white">
                        {(cs.questions ?? []).map(q => (
                          <div key={q.questionId} className="pl-6 border-l-2 border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                              <p className="text-gray-700">{q.questionText}</p>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500">
                                  {q.averageScore.toFixed(2)} / 5.00 &nbsp;·&nbsp; {q.responseCount} of {q.totalResponses}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openModal({
                                      mode: 'question',
                                      title: 'Question Responses',
                                      subtitle: q.questionText,
                                      questionId: q.questionId,
                                    })
                                  }
                                  className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                                >
                                  <Eye size={14} /> View
                                </button>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${scoreBarColor(q.averageScore)}`}
                                style={{ width: `${(q.averageScore / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <ResponseDetailsModal
        open={!!modalView}
        title={modalView?.title || ''}
        subtitle={modalView?.subtitle}
        loading={modalLoading}
        mode={modalView?.mode || 'all'}
        enrichedResponses={modalResponses}
        answerDetails={modalAnswers}
        onClose={closeModal}
      />
    </div>
  );
};

export default Analytics;
