import { Module } from './modules';
import {
  ApiResponse,
  ApiResponsePaginated
} from './types';
import { IQueue, QueuePayload } from '~/types/queue';

export class QueueModule extends Module {
  public async create(payload: QueuePayload): Promise<IQueue> {
    const result = await this.api.$post<IQueue>(`/${this.path}`, payload);

    return result;
  }

  public async getPaginated(page: number, size: number): Promise<ApiResponsePaginated<IQueue[]>> {
    const result = await this.api.$get<ApiResponsePaginated<IQueue[]>>(`/${this.path}?page=${page}&size=${size}`);

    return result;
  }

  public async getById(id: string): Promise<IQueue> {
    const result = await this.api.$get<IQueue>(`/${this.path}/${id}`);

    return result;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.api.$delete<boolean>(`/${this.path}/${id}`);

    return result;
  }

  public async edit(id: string, payload: QueuePayload): Promise<IQueue> {
    const result = await this.api.$put<IQueue>(`/${this.path}/${id}`, payload);

    return result;
  }

  public async pause(id: string): Promise<boolean> {
    const result = await this.api.$put<boolean>(`/${this.path}/${id}/pause`);

    return result;
  }

  public async resume(id: string): Promise<boolean> {
    const result = await this.api.$put<boolean>(`/${this.path}/${id}/resume`);

    return result;
  }

  public async pauseBulk(payload: string[]): Promise<boolean> {
    const result = await this.api.$put<boolean>(`/${this.path}/pause`, {ids: payload});

    return result;
  }

  public async resumeBulk(payload: string[]): Promise<boolean> {
    const result = await this.api.$put<boolean>(`/${this.path}/resume`, {ids: payload});

    return result;
  }
}