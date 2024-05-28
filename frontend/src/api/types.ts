export interface ApiToken {
  token: string;
  valid_until: string;
}

export interface ApiResponse<T> {
  data: T;
  profiler: number;
  token: ApiToken;
  requestId: string;
  message?: string;
}

export interface ApiListLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ApiListData<T> {
  data: T[];
  total: number;
}

export type ApiDetailResponse<T> = T;
export type ApiListResponse<T> = ApiListData<T>;
export type ApiAddResponse<T> = T;
export type ApiPutResponse<T> = T;

export enum FilterType {
  FILTER_EQUAL = 'eql',
  FILTER_GREATER_THAN = 'gt',
  FILTER_GREATER_THAN_OR_EQUAL = 'gte',
  FILTER_LESS_THAN = 'lt',
  FILTER_LESS_THAN_OR_EQUAL = 'lte',
  FILTER_LIKE = 'lik',
  FILTER_NOT_EQUAL = 'neq',
  FILTER_NOT_NULL = 'nnu',
  FILTER_NULL = 'nul',
  FILTER_BETWEEN = 'btw',
  FILTER_IN = 'in',
}

export interface Pagination {
  page: number;
  size: number;
  total?: number,
  totalPages?: number,
}

export type PaginationPayload = Omit<Pagination, 'totalPages'>;

export interface PaginationResult<T> {
  data: T[];
  pagination: Pagination;
}
