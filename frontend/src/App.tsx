import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import GoogleOAuthCallback from './pages/Auth/GoogleOAuthCallback';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BUDashboard from './pages/Dashboard/BUDashboard';
import HRBPDashboard from './pages/Dashboard/HRBPDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import SurveyBuilder from './pages/SurveyBuilder/SurveyBuilder';
import TakeSurvey from './pages/TakeSurvey/TakeSurvey';
import Analytics from './pages/Analytics/Analytics';
import UserManagement from './pages/UserManagement/UserManagement';
import SurveyList from './pages/UserManagement/SurveyList';
import BusinessUnitManagement from './pages/BusinessUnits/BusinessUnitManagement';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import ToastContainer from './components/Toast/ToastContainer';
import SessionExpiredModal from './components/SessionExpiredModal';
import { useSelector } from 'react-redux';
import { RootState } from './store';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

const DashboardRouter: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { viewMode } = useSelector((s: RootState) => s.ui);
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'EMPLOYEE' || viewMode === 'participation') return <EmployeeDashboard />;
  if (user.role === 'ADMIN') return <AdminDashboard />;
  if (user.role === 'BU_HEAD') return <BUDashboard />;
  if (user.role === 'HRBP') return <HRBPDashboard />;
  return <EmployeeDashboard />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ToastContainer />
            <SessionExpiredModal />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/surveys" element={<SurveyList />} />
                  <Route path="/surveys/:id/take" element={<TakeSurvey />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/surveys/new" element={<SurveyBuilder />} />
                    <Route path="/surveys/:id/edit" element={<SurveyBuilder />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/business-units" element={<BusinessUnitManagement />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'BU_HEAD', 'HRBP']} />}>
                    <Route path="/analytics" element={<Analytics />} />
                  </Route>
                </Route>
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
