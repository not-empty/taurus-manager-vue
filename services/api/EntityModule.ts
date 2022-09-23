import { Module } from './modules';
import {
  ApiAddResponse,
  ApiListResponse,
  ApiPutResponse,
} from './types';

interface PayloadWithId<T> {
  data: Partial<T>;
  id: string;
}

export class EntityModule<T> extends Module {
  public async get(): Promise<T> {
    const result = await this.api.$get<ApiListResponse<T>>(`/${this.path}/`);

    return result.data;
  }

  public async getById(id: string): Promise<T> {
    const result = await this.api.$get<ApiListResponse<T>>(`/${this.path}/${id}`);

    return result.data;
  }

  public async post(payload: Omit<T, 'id'>): Promise<T> {
    const result = await this.api.$post<ApiAddResponse<T>>(`/${this.path}/`, payload);

    return result.data;
  }

  public async put(payload: PayloadWithId<T>): Promise<T> {
    const result = await this.api.$patch<ApiPutResponse<T>>(`/${this.path}/edit/${payload.id}`, payload.data);

    return result.data;
  }

  public async deleteById(payload: string): Promise<void> {
    await this.api.delete<T>(`/${this.path}/${payload}`);
  }
}
