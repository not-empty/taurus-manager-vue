import { Module } from './Module';
import { prepareQuery } from './query';

import {
  ApiAddResponse,
  ApiDetailResponse,
  ApiListResponse,
  ApiPutResponse,
  PaginationPayload,
  PaginationResult,
} from './types';

interface PayloadWithId<T> {
  data: Partial<T>;
  id: string;
}

export class EntityModule<T> extends Module {
  public async getById(id: string): Promise<T> {
    const result = await this.api.get<ApiDetailResponse<T>>(
      `/${this.path}/${id}`,
    );

    return result.data;
  }

  public async getPaginate(
    payload: PaginationPayload = {
      page: 1,
      size: 25,
    },
  ): Promise<PaginationResult<T>> {
    const query = prepareQuery(payload);
    const result = await this.api.get<ApiListResponse<T>>(
      `/${this.path}?${query}`,
    );

    const total = result.data.total;
    const totalPages = total / payload.size;

    return {
      data: result.data.data,
      pagination: {
        ...payload,
        totalPages,
        total,
      }
    };
  }

  public async post(payload: Omit<T, 'id'>): Promise<T> {
    const result = await this.api.post<ApiAddResponse<T>>(
      `/${this.path}`,
      payload,
    );

    return result.data;
  }

  public async put(payload: PayloadWithId<T>): Promise<ApiPutResponse<T>> {
    const result = await this.api.put<ApiPutResponse<T>>(
      `/${this.path}/${payload.id}`,
      payload.data,
    );

    return result.data;
  }

  public async deleteById(id: string): Promise<void> {
    await this.api.delete<T>(`/${this.path}/${id}`);
  }
}
