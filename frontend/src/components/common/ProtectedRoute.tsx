import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export interface ProtectedRouteProps {
  /**
   * When true, enforces authentication check.
   * Defaults to false in Phase 2 to prepare routing structure without locking out screens.
   */
  requireAuth?: boolean;
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * ProtectedRoute foundation component.
 * Prepared for Phase 7 (Authentication) to guard private routes
 * (orders, profile, checkout) while remaining accessible during UI development.
 */

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireAuth = false,
  redirectTo = '/login',
  children,
}) => {
  const location = useLocation();

  // In Phase 2/future: checks auth token from localStorage / auth state
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const isAuthenticated = !requireAuth || Boolean(token);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
