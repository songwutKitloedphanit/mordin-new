export interface BaseSearchAndPaginationParams {
  page?: number; // default = 1
  limit?: number; // default = 10
  search?: string;
  all?: boolean;
  sortBy?: string; // เช่น 'createdAt' หรือ 'name'
  order?: 'ASC' | 'DESC';
}
