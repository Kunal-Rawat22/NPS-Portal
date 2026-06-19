import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { clearCredentials } from '../../store/authSlice';
import { logout } from '../../api/auth';
import { LogOut, Bell } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  const roleBadge: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    BU_HEAD: 'bg-blue-100 text-blue-700',
    HRBP: 'bg-purple-100 text-purple-700',
    EMPLOYEE: 'bg-green-100 text-green-700',
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">PS</span>
        </div>
        <span className="font-semibold text-gray-900 text-lg">Pulse Survey</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>
        {user && (
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 text-sm font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role] || ''}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
