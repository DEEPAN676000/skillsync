import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: Array<'learner' | 'teacher' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to their appropriate dashboard if wrong role
    if (user.role === 'teacher') {
      return <Navigate to="/dashboard/teacher" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else {
      return <Navigate to="/dashboard/learner" replace />;
    }
  }

  return children;
};

