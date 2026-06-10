import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Loading } from '@/components/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';
import { DASHBOARD_URL } from '@/utils/RoleToURL';

interface RouteGuardProps {
  children?: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  /**
   * Whether to render the full-page <Loading /> skeleton during the very first
   * auth resolution. The outer guard (wrapping AdminLayout) keeps this true so
   * the first app load shows the skeleton. Inner guards that live *inside* the
   * layout pass false: the real sidebar/header are already mounted, so a
   * full-page skeleton (which draws its own fake sidebar) would cover them.
   * They render nothing instead and let the content fill in.
   */
  showLoading?: boolean;
}

const RouteGuard = ({
  children,
  allowedRoles,
  requireAuth = true,
  showLoading = true,
}: RouteGuardProps) => {
  const { user, isLoggedIn, isInitializing } = useAuth();

  // Only block on the FIRST auth resolution. Later profile refreshes must not
  // re-trigger the full-page skeleton, or it would cover the already-rendered
  // sidebar/header on navigation.
  if (isInitializing) {
    return showLoading ? <Loading /> : null;
  }

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to={DASHBOARD_URL} replace />;
    }
  }

  return <>{children}</>;
};

export default RouteGuard;
