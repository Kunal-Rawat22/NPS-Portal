import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Role } from '../types';

interface Props { allowedRoles?: Role[]; }

const ProtectedRoute: React.FC<Props> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
