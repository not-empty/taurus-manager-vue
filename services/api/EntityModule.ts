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
  public async get(): Promise<T[]> {
    const result = await this.api.$get<T[]>(`/${this.path}/`);

    return result;
  }

  public async getById(id: string): Promise<T> {
    const result = await this.api.$get<T>(`/${this.path}/${id}`);

    return result;
  }

  public async post(payload: Omit<T, 'id'>): Promise<T> {
    const result = await this.api.$post<T>(`/${this.path}/`, payload);

    return result;
  }

  public async put(payload: PayloadWithId<T>): Promise<T> {
    const result = await this.api.$patch<T>(`/${this.path}/edit/${payload.id}`, payload.data);

    return result;
  }

  public async deleteById(payload: string): Promise<void> {
    await this.api.delete<T>(`/${this.path}/${payload}`);
  }
}
