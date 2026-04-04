import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    // Redirect to the private login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/srg-gate" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
