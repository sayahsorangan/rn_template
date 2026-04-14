export interface IResponse {
  status: string;
  msg: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export namespace IApp {
  export interface IAuth {
    isAuthenticated: boolean;
    token?: string;
  }
}
