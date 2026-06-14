import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/User';
import { RoleToURL } from '@/utils/RoleToURL';

interface RouteGuardProps {
  children?: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const RouteGuard = ({
  children,
  allowedRoles,
  requireAuth = true,
}: RouteGuardProps) => {
  const { user, isLoggedIn } = useAuth();

  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    if (!hasRequiredRole) {
      return <Navigate to={RoleToURL[user.role]} replace />;
    }
  }

  return <>{children}</>;
};

export default RouteGuard;
