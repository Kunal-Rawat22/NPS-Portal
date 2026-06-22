import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin } from '../../api/auth';
import { setCredentials } from '../../store/authSlice';
import { setViewMode } from '../../store/uiSlice';
import { RootState } from '../../store';

const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_DOMAIN || 'tothenew.com';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError('');
    try {
      const data = await googleLogin(credentialResponse.credential);
      dispatch(setCredentials({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user }));
      if (data.user.role === 'EMPLOYEE') {
        dispatch(setViewMode('participation'));
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google login failed. Ensure your account is provisioned by an administrator.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">PS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pulse Survey Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in with your @{ALLOWED_DOMAIN} Google account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              size="large"
              width="320"
            />
          </div>
          <p className="text-center text-xs text-gray-400">
            Only @{ALLOWED_DOMAIN} workspace accounts are permitted. Contact your administrator if you cannot log in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
