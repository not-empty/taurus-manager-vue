import { ISession } from "~/types/session";

export interface ApiResponse<T> {
  data: T;
  profiler: number;
}

export interface ApiResponsePaginated<T> {
  total: number
  queues: T
}

export interface ApiGroupResponsePaginated<T> {
  total: number
  groups: T
}

export interface ApiResponseJobsPaginated<T> {
  total: number
  jobs: T
}

export interface ApiSessionResponse {
  data: ISession;
}

export interface ApiListLink {
  url: string | null;
  label: string;
  active: boolean;
}

export type ApiListResponse<T> = ApiResponse<T>;
export type ApiAddResponse<T> = ApiResponse<T>;
export type ApiPutResponse<T> = ApiResponse<T>;
