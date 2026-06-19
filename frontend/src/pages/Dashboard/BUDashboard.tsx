import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getSurveys } from '../../api/surveys';
import { getBusinessUnits } from '../../api/businessUnits';
import { RootState } from '../../store';
import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList } from 'lucide-react';

const BUDashboard: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });
  const { data: bus = [] } = useQuery({ queryKey: ['business-units'], queryFn: getBusinessUnits });

  const myBU = bus.find(b => b.id === user?.businessUnitId);
  const closedSurveys = surveys.filter(s => s.status === 'CLOSED');
  const activeSurveys = surveys.filter(s => s.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">BU Dashboard</h1>
        <p className="text-gray-500 mt-1">Business Unit: <span className="font-medium text-gray-900">{myBU?.name || 'N/A'}</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl"><ClipboardList className="text-green-600" size={24} /></div>
          <div><p className="text-2xl font-bold">{activeSurveys.length}</p><p className="text-sm text-gray-500">Active Surveys</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl"><BarChart3 className="text-blue-600" size={24} /></div>
          <div><p className="text-2xl font-bold">{closedSurveys.length}</p><p className="text-sm text-gray-500">Completed Surveys</p></div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Surveys</h2>
        <div className="space-y-3">
          {surveys.slice(0, 6).map(s => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="font-medium text-sm">{s.title}</span>
              <div className="flex items-center gap-3">
                <span className={`badge-${s.status.toLowerCase()}`}>{s.status}</span>
                {(s.status === 'ACTIVE' || s.status === 'CLOSED') && user?.businessUnitId && (
                  <Link to={`/analytics?surveyId=${s.id}&buId=${user.businessUnitId}`} className="text-xs text-primary-600 hover:underline">
                    View Analytics
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BUDashboard;
