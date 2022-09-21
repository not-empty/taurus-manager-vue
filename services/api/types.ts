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

export type ApiListResponse<T> = ApiResponse<T>;
export type ApiAddResponse<T> = ApiResponse<T>;
export type ApiPutResponse<T> = ApiResponse<T>;

// eslint-disable-next-line no-shadow
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
}

export interface Filter {
  value: string;
  type?: FilterType;
}

export interface Order {
  fields: string[];
  type?: 'desc' | 'asc';
}

