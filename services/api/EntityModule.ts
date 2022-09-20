import { Module } from './modules';
import { prepareQuery } from './query';
import {
  ApiAddResponse,
  ApiDetailResponse,
  ApiListResponse,
  ApiPutResponse,
  Filter,
  Order,
  PaginationPayload,
  PaginationResult,
} from './types';

interface PayloadWithId<T> {
  data: Partial<T>;
  id: string;
}

interface GetAllPayload {
  filters?: Record<string, Filter>;
  order?: Order;
  limit?: number;
  perPage?: number;
}

export class EntityModule<T> extends Module {
  public async getById(id: string): Promise<T> {
    const result = await this.api.get<ApiDetailResponse<T>>(`/${this.path}/detail/${id}`);

    return result.data.data;
  }

  public async getPaginate(payload?: Partial<PaginationPayload>): Promise<PaginationResult<T>> {
    const { perPage } = payload || {};
    const query = prepareQuery(payload);
    const result = await this.api.get<ApiListResponse<T>>(`/${this.path}/list?${query}`);

    const { total } = result.data.data;
    const totalPages = perPage ? Math.ceil(total / perPage) : 1;

    return {
      data: result.data.data.data,
      pagination: {
        page: 1,
        ...payload,
        totalPages,
      },
    };
  }

  public async getAll(payload: GetAllPayload = {}): Promise<T[]> {
    const {
      filters, order, perPage, limit = 100,
    } = payload;
    const pageOne = await this.getPaginate({
      filters, order, perPage, page: 1,
    });

    const totalPages = pageOne.pagination.totalPages || 1;
    const data = [...pageOne.data];
    let page = 2;

    while (page < totalPages && data.length < limit) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.getPaginate({
        filters, order, perPage, page,
      });

      if ((data.length + result.data.length) <= limit) {
        data.push(...result.data);
      } else {
        const diff = limit - data.length;
        data.push(...result.data.splice(0, diff));
      }

      page += 1;
    }

    return data;
  }

  public async post(payload: Omit<T, 'id'>): Promise<T> {
    const result = await this.api.post<ApiAddResponse<T>>(`/${this.path}/add`, payload);

    return result.data.data;
  }

  public async put(payload: PayloadWithId<T>): Promise<T> {
    const result = await this.api.patch<ApiPutResponse<T>>(`/${this.path}/edit/${payload.id}`, payload.data);

    return result.data.data;
  }

  public async deleteById(payload: string): Promise<void> {
    await this.api.delete<T>(`/${this.path}/delete/${payload}`);
  }
}
