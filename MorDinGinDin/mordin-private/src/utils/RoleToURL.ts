import { UserRole } from '@/types/User';

export const RoleToURL: Record<UserRole, string> = {
  [UserRole.Admin]: '/admin',
  [UserRole.Staff]: '/officer',
  [UserRole.Executive]: '/executive',
};
