import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSurveys } from '../../api/surveys';
import { getUsers } from '../../api/users';
import { getBusinessUnits } from '../../api/businessUnits';
import { Users, ClipboardList, Building2, TrendingUp, Plus } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: surveys = [] } = useQuery({ queryKey: ['surveys'], queryFn: getSurveys });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { data: bus = [] } = useQuery({ queryKey: ['business-units'], queryFn: getBusinessUnits });

  const activeSurveys = surveys.filter(s => s.status === 'ACTIVE').length;
  const draftSurveys = surveys.filter(s => s.status === 'DRAFT').length;
  const activeUsers = users.filter(u => u.isActive).length;

  const stats = [
    { label: 'Total Users', value: activeUsers, icon: <Users className="text-blue-600" size={24} />, bg: 'bg-blue-50' },
    { label: 'Active Surveys', value: activeSurveys, icon: <ClipboardList className="text-green-600" size={24} />, bg: 'bg-green-50' },
    { label: 'Business Units', value: bus.length, icon: <Building2 className="text-purple-600" size={24} />, bg: 'bg-purple-50' },
    { label: 'Total Surveys', value: surveys.length, icon: <TrendingUp className="text-orange-600" size={24} />, bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your organisation's pulse surveys</p>
        </div>
        <Link to="/surveys/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Survey
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Surveys</h2>
            <Link to="/surveys" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {surveys.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.questions.length} questions</p>
                </div>
                <span className={`badge-${s.status.toLowerCase()}`}>{s.status}</span>
              </div>
            ))}
            {surveys.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No surveys yet</p>}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Survey Status Breakdown</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Active', count: activeSurveys, color: 'bg-green-500' },
              { label: 'Draft', count: draftSurveys, color: 'bg-yellow-500' },
              { label: 'Closed', count: surveys.filter(s => s.status === 'CLOSED').length, color: 'bg-gray-400' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: surveys.length > 0 ? `${(item.count / surveys.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
