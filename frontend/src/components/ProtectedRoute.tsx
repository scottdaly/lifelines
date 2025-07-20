import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}