import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getMe } from '../../api/users';
import { RootState } from '../../store';
import { Mail, Building2, Users, Briefcase, UserCircle } from 'lucide-react';

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  BU_HEAD: 'bg-blue-100 text-blue-700',
  HRBP: 'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
};

const Profile: React.FC = () => {
  const { user: authUser } = useSelector((s: RootState) => s.auth);
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile', authUser?.id],
    queryFn: getMe,
    enabled: !!authUser,
  });

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const fields = [
    { label: 'Email', value: user.email, icon: <Mail size={16} /> },
    { label: 'Role', value: user.role.replace('_', ' '), icon: <UserCircle size={16} /> },
    { label: 'Business Unit', value: user.businessUnitName || '—', icon: <Building2 size={16} /> },
    { label: 'Competency', value: user.competency || '—', icon: <Briefcase size={16} /> },
    { label: 'Reports To', value: user.reportingToName || '—', icon: <Users size={16} /> },
    { label: 'HRBP', value: user.hrbpName || '—', icon: <Users size={16} /> },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Your account details and organisation info</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 text-xl font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h2>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role] || ''}`}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        <dl className="space-y-4">
          {fields.map(field => (
            <div key={field.label} className="flex items-start gap-3">
              <div className="text-gray-400 mt-0.5">{field.icon}</div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</dt>
                <dd className="text-sm text-gray-900 mt-0.5">{field.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default Profile;
