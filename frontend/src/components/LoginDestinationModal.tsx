import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setViewMode } from '../store/uiSlice';
import { LayoutDashboard, ClipboardList } from 'lucide-react';

const LoginDestinationModal: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const chooseManagement = () => {
    dispatch(setViewMode('management'));
    navigate('/dashboard');
  };

  const chooseParticipation = () => {
    dispatch(setViewMode('participation'));
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-destination-title"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
      >
        <h2 id="login-destination-title" className="text-xl font-bold text-gray-900 text-center">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Choose how you would like to continue
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={chooseManagement}
            className="card hover:shadow-md hover:border-primary-200 transition-all text-left p-4 flex flex-col items-center gap-3"
          >
            <div className="p-3 rounded-xl bg-primary-50">
              <LayoutDashboard className="text-primary-600" size={28} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">Dashboard</p>
              <p className="text-xs text-gray-500 mt-1">Manage surveys, analytics, and team data</p>
            </div>
          </button>

          <button
            type="button"
            onClick={chooseParticipation}
            className="card hover:shadow-md hover:border-green-200 transition-all text-left p-4 flex flex-col items-center gap-3"
          >
            <div className="p-3 rounded-xl bg-green-50">
              <ClipboardList className="text-green-600" size={28} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900">My Surveys</p>
              <p className="text-xs text-gray-500 mt-1">Take surveys and view your submissions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginDestinationModal;
