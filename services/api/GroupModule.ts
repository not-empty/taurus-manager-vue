import { Module } from './modules';
import {
  ApiGroupResponsePaginated
} from './types';
import { IGroup } from '~/types/group';

interface QueuePayload {
  name: string
  host: string
  port: string
  groupId: string
  description: string
  compliance: string | null
}

export class GroupModule extends Module {
  public async create(payload: QueuePayload): Promise<IGroup> {
    const result = await this.api.$post<IGroup>(`/${this.path}`, payload);

    return result;
  }

  public async getPaginated(page: number, size: number): Promise<ApiGroupResponsePaginated<IGroup[]>> {
    const result = await this.api.$get<ApiGroupResponsePaginated<IGroup[]>>(`/${this.path}?page=${page}&size=${size}`);

    return result;
  }

  public async getById(id: string): Promise<IGroup> {
    const result = await this.api.$get<IGroup>(`/${this.path}/${id}`);

    return result;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.api.$delete<boolean>(`/${this.path}/${id}`);

    return result;
  }

  public async edit(id: string, payload: QueuePayload): Promise<IGroup> {
    const result = await this.api.$put<IGroup>(`/${this.path}/${id}`, payload);

    return result;
  }
}