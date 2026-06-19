import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getSurveys } from '../../api/surveys';
import { getHrbpDirectReports } from '../../api/users';
import { RootState } from '../../store';
import { Link } from 'react-router-dom';
import { Users, BarChart3, ClipboardList } from 'lucide-react';

const HRBPDashboard: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });
  const { data: directReports = [] } = useQuery({
    queryKey: ['hrbp-direct', user?.id],
    queryFn: () => getHrbpDirectReports(user!.id),
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HRBP Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and monitor your assigned employees</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl"><Users className="text-purple-600" size={24} /></div>
          <div><p className="text-2xl font-bold">{directReports.length}</p><p className="text-sm text-gray-500">Direct Reports</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl"><ClipboardList className="text-green-600" size={24} /></div>
          <div><p className="text-2xl font-bold">{surveys.filter(s => s.status === 'ACTIVE').length}</p><p className="text-sm text-gray-500">Active Surveys</p></div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl"><BarChart3 className="text-blue-600" size={24} /></div>
          <div><p className="text-2xl font-bold">{surveys.filter(s => s.status === 'CLOSED').length}</p><p className="text-sm text-gray-500">Closed Surveys</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">My Direct Reports</h2>
          <div className="space-y-2">
            {directReports.slice(0, 8).map(u => (
              <div key={u.id} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 text-xs font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-gray-500">{u.competency || u.businessUnitName || 'No BU'}</p>
                </div>
              </div>
            ))}
            {directReports.length === 0 && <p className="text-gray-400 text-sm">No direct reports assigned</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Survey Analytics</h2>
          <div className="space-y-3">
            {surveys.filter(s => s.status !== 'DRAFT').map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <span className={`badge-${s.status.toLowerCase()}`}>{s.status}</span>
                </div>
                <Link to={`/analytics?surveyId=${s.id}&mode=hrbp`} className="text-xs text-primary-600 hover:underline">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRBPDashboard;
