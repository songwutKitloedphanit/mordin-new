export interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  role: UserRole;
  updatedAt?: number;
}

export interface UserBaseInput {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  role: UserRole;
}

export interface UserCreateInput extends UserBaseInput {
  username: string;
}

export type UserUpdateInput = UserBaseInput;

export interface UserProfileUpdateInput {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserSearchCriteria {
  name?: string;
  email?: string;
  departmentId?: number;
  role?: UserRole;
}

export enum UserRole {
  Admin = 'admin',
  Staff = 'staff',
  Executive = 'executive',
}

export interface UserSummary {
  totalUsers: number;
  adminAmount: number;
  staffAmount: number;
  executiveAmount: number;
}
