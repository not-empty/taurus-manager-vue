import { ISession } from "~/types/session";

export interface ApiResponse<T> {
  data: T;
  profiler: number;
}

export interface ApiResponsePaginated<T> {
  data: {
    total: number
    queues: T
  };
  profiler: number;
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
