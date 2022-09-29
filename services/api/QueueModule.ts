import { Module } from './modules';
import {
  ApiResponse,
  ApiResponsePaginated
} from './types';
import { IQueue } from '~/types/queue';

interface QueuePayload {
  name: string
  host: string
  port: string
  groupId: string
  description: string
  compliance: string | null
}

export class QueueModule extends Module {
  public async create(payload: QueuePayload): Promise<IQueue> {
    const result = await this.api.$post<ApiResponse<IQueue>>(`/${this.path}`, payload);

    return result.data;
  }

  public async getPaginated(page: number, size: number): Promise<ApiResponsePaginated<IQueue[]>> {
    const result = await this.api.$get<ApiResponsePaginated<IQueue[]>>(`/${this.path}?page=${page}&size=${size}`);

    return result;
  }

  public async getById(id: string): Promise<IQueue> {
    const result = await this.api.$get<ApiResponse<IQueue>>(`/${this.path}/${id}`);

    return result.data;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.api.$delete<ApiResponse<boolean>>(`/${this.path}/${id}`);

    return result.data;
  }

  public async edit(id: string, payload: QueuePayload): Promise<IQueue> {
    const result = await this.api.$put<ApiResponse<IQueue>>(`/${this.path}/${id}`, payload);

    return result.data;
  }

  public async pause(id: string): Promise<boolean> {
    const result = await this.api.$put<ApiResponse<boolean>>(`/${this.path}/${id}/pause`);

    return result.data;
  }

  public async resume(id: string): Promise<boolean> {
    const result = await this.api.$put<ApiResponse<boolean>>(`/${this.path}/${id}/resume`);

    return result.data;
  }

  public async pauseBulk(payload: string[]): Promise<boolean> {
    const result = await this.api.$put<ApiResponse<boolean>>(`/${this.path}/pause`, payload);

    return result.data;
  }

  public async resumeBulk(payload: string[]): Promise<boolean> {
    const result = await this.api.$put<ApiResponse<boolean>>(`/${this.path}/resume`, payload);

    return result.data;
  }
}