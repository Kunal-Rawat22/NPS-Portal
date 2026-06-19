import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { getSurveys } from '../../api/surveys';
import { getBusinessUnits } from '../../api/businessUnits';
import { getOrgAnalytics, getBUAnalytics, getHrbpDirectAnalytics, getHrbpHierarchyAnalytics } from '../../api/analytics';
import { RootState } from '../../store';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

const Analytics: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [searchParams] = useSearchParams();
  const [selectedSurvey, setSelectedSurvey] = useState(searchParams.get('surveyId') || '');
  const [selectedBU, setSelectedBU] = useState(searchParams.get('buId') || '');
  const [hrbpMode, setHrbpMode] = useState<'direct' | 'hierarchy'>('direct');

  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });
  const { data: bus = [] } = useQuery({ queryKey: ['business-units'], queryFn: getBusinessUnits, enabled: user?.role === 'ADMIN' || user?.role === 'BU_HEAD' });

  const closedAndActive = surveys.filter(s => s.status !== 'DRAFT');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', user?.role, selectedSurvey, selectedBU, hrbpMode],
    queryFn: () => {
      if (!selectedSurvey) return null;
      if (user?.role === 'ADMIN' && !selectedBU) return getOrgAnalytics(selectedSurvey);
      if ((user?.role === 'ADMIN' || user?.role === 'BU_HEAD') && selectedBU) return getBUAnalytics(selectedSurvey, selectedBU);
      if (user?.role === 'HRBP') return hrbpMode === 'direct' ? getHrbpDirectAnalytics(selectedSurvey) : getHrbpHierarchyAnalytics(selectedSurvey);
      return null;
    },
    enabled: !!selectedSurvey,
  });

  const chartData = analytics?.categoryScores.map(cs => ({ name: cs.categoryName, score: cs.averageScore, responses: cs.responseCount })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Survey performance insights</p>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Survey</label>
            <select className="input" value={selectedSurvey} onChange={e => setSelectedSurvey(e.target.value)}>
              <option value="">Select a survey</option>
              {closedAndActive.map(s => <option key={s.id} value={s.id}>{s.title} ({s.status})</option>)}
            </select>
          </div>
          {(user?.role === 'ADMIN' || user?.role === 'BU_HEAD') && (
            <div>
              <label className="label">Business Unit</label>
              <select className="input" value={selectedBU} onChange={e => setSelectedBU(e.target.value)}>
                <option value="">All Organisation</option>
                {bus.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          {user?.role === 'HRBP' && (
            <div>
              <label className="label">View Mode</label>
              <select className="input" value={hrbpMode} onChange={e => setHrbpMode(e.target.value as 'direct' | 'hierarchy')}>
                <option value="direct">Direct Reports (hrbp_id)</option>
                <option value="hierarchy">Full Hierarchy (DFS/BFS)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {!selectedSurvey && (
        <div className="card text-center py-12">
          <BarChart3 className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">Select a survey to view analytics</p>
        </div>
      )}

      {isLoading && <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>}

      {analytics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl"><Users className="text-blue-600" size={24} /></div>
              <div><p className="text-2xl font-bold">{analytics.completedResponses}</p><p className="text-sm text-gray-500">Responses</p></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-xl"><TrendingUp className="text-green-600" size={24} /></div>
              <div><p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p><p className="text-sm text-gray-500">Completion Rate</p></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-xl"><BarChart3 className="text-purple-600" size={24} /></div>
              <div><p className="text-2xl font-bold">{analytics.categoryScores.length}</p><p className="text-sm text-gray-500">Categories</p></div>
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
              <h2 className="font-semibold text-gray-900 mb-4">Category Scores (Radar)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Tooltip formatter={(v: number) => [v.toFixed(2), 'Avg Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {analytics.categoryScores.map(cs => (
                <div key={cs.categoryId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cs.categoryName}</span>
                    <span className="text-gray-500">{cs.averageScore.toFixed(2)} / 5.00 &nbsp;·&nbsp; {cs.responseCount} responses</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${cs.averageScore >= 4 ? 'bg-green-500' : cs.averageScore >= 3 ? 'bg-yellow-500' : 'bg-red-400'}`}
                      style={{ width: `${(cs.averageScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
