import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { setViewMode } from '../../store/uiSlice';
import { User } from '../../types';

const GoogleOAuthCallback: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userParam = params.get('user');

    if (!accessToken || !refreshToken || !userParam) {
      navigate('/login?error=' + encodeURIComponent('Google sign-in failed. Missing session data.'));
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam)) as User;
      dispatch(setCredentials({ accessToken, refreshToken, user }));
      if (user.role === 'EMPLOYEE') {
        dispatch(setViewMode('participation'));
      }
      navigate('/dashboard', { replace: true });
    } catch {
      navigate('/login?error=' + encodeURIComponent('Google sign-in failed. Invalid session data.'));
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
