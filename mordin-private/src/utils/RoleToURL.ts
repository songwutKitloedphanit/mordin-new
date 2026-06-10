import { UserRole } from '@/types/User';

export const DASHBOARD_URL = '/executive/dashboard';

export const RoleToURL: Record<UserRole, string> = {
  [UserRole.Admin]: DASHBOARD_URL,
  [UserRole.Staff]: DASHBOARD_URL,
  [UserRole.Executive]: DASHBOARD_URL,
};
