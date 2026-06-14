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

// ใช้สำหรับการเพิ่มข้อมูล
export interface UserCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number;
  role: UserRole;
}

// ใช้สำหรับการแก้ไขข้อมูล (ต้องมี userId)
export interface UserUpdateInput extends UserCreateInput {
  id: number;
}

// ใช้สำหรับการค้นหา
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
