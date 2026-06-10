export interface Department {
  departmentId: number;
  name: string;
  description?: string;
  updatedAt: Date;
}

export interface DepartmentInput {
  name: string;
  description?: string;
}
