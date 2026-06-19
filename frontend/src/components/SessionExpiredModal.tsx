import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { clearCredentials } from '../store/authSlice';
import { onSessionExpired, resetSessionExpiredFlag } from '../utils/sessionExpired';

const SessionExpiredModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return onSessionExpired(() => setOpen(true));
  }, []);

  const handleLogin = () => {
    dispatch(clearCredentials());
    resetSessionExpiredFlag();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        className="relative w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center"
      >
        <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <LogIn size={22} className="text-amber-600" />
        </div>
        <h3 id="session-expired-title" className="text-lg font-semibold text-gray-900">
          Session Expired
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Your session has expired or is no longer valid. Please sign in again to continue.
        </p>
        <button
          type="button"
          onClick={handleLogin}
          className="btn-primary w-full mt-5"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
