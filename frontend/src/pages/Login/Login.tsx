import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { googleLogin, emailLogin } from '../../api/auth';
import { setCredentials } from '../../store/authSlice';
import { RootState } from '../../store';
import { Eye, EyeOff, LogIn } from 'lucide-react';

type Tab = 'email' | 'google';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const data = await emailLogin(email, password);
      dispatch(setCredentials({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setError('');
    try {
      const data = await googleLogin(credentialResponse.credential);
      dispatch(setCredentials({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google login failed. Ensure your account is provisioned.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">PS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pulse Survey Portal</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to continue</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => { setTab('email'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'email'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => { setTab('google'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'google'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Google SSO
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Email/Password Tab */}
        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="admin@yourcompany.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 space-y-0.5">
              <p className="font-semibold">Demo Admin Credentials</p>
              <p>Email: <span className="font-mono">admin@yourcompany.com</span></p>
              <p>Password: <span className="font-mono">Admin@123</span></p>
            </div>
          </form>
        )}

        {/* Google SSO Tab */}
        {tab === 'google' && (
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
              Only organisation accounts are permitted. Contact HR if you cannot log in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
