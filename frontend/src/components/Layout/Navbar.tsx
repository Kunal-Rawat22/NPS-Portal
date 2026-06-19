import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../store';
import { clearCredentials } from '../../store/authSlice';
import { setViewMode, resetUiState } from '../../store/uiSlice';
import { logout } from '../../api/auth';
import { LogOut, Bell, LayoutDashboard, ClipboardList, UserCircle } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { viewMode } = useSelector((s: RootState) => s.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isEmployee = user?.role === 'EMPLOYEE';
  const canSwitchView = user && !isEmployee;

  const handleLogout = async () => {
    try { await logout(); } catch {}
    dispatch(clearCredentials());
    dispatch(resetUiState());
    navigate('/login');
  };

  const switchToManagement = () => {
    dispatch(setViewMode('management'));
    navigate('/dashboard');
  };

  const switchToParticipation = () => {
    dispatch(setViewMode('participation'));
    navigate('/dashboard');
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
      <div className="flex items-center gap-3">
        <button type="button" className="text-gray-500 hover:text-gray-700">
          <Bell size={20} />
        </button>

        {canSwitchView && (
          <div className="flex items-center rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={switchToManagement}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'management'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Management dashboard"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              type="button"
              onClick={switchToParticipation}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'participation'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Take surveys"
            >
              <ClipboardList size={14} />
              <span className="hidden sm:inline">My Surveys</span>
            </button>
          </div>
        )}

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

        <Link
          to="/profile"
          className="text-gray-500 hover:text-primary-600 transition-colors"
          title="View profile"
        >
          <UserCircle size={20} />
        </Link>

        <button type="button" onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Log out">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
