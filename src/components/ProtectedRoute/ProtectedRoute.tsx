// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../authentication context/aunthenticationContextPage';

interface ProtectedRouteProps {
  requiredRole?: 'patient' | 'doctor' | 'admin' | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole = null }) => {
  const { user, isAuthenticated, setRedirectPath } = useAuth();
  const location = useLocation();

  // If the user is not authenticated, redirect to sign in
  if (!isAuthenticated) {
    // Store the path they were trying to access for redirect after login
    setRedirectPath(location.pathname);
    
    // Redirect to sign in
    return <Navigate to="/signin" replace />;
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && user?.role !== requiredRole) {
    // If user doesn't have the required role, redirect to home page
    return <Navigate to="/" replace />;
  }

  // If user is authenticated and has the right role, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;