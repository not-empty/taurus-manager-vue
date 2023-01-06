import { Module } from './modules';
import {
  ApiGroupResponsePaginated
} from './types';
import { GroupPayload, IGroup } from '~/types/group';

export class GroupModule extends Module {
  public async create (payload: GroupPayload): Promise<IGroup> {
    const result = await this.api.$post<IGroup>(`/${this.path}`, payload);

    return result;
  }

  public async getPaginated (
    page: number,
    size: number
  ): Promise<ApiGroupResponsePaginated<IGroup[]>> {
    const result = await this.api.$get<ApiGroupResponsePaginated<IGroup[]>>(
      `/${this.path}?page=${page}&size=${size}`
    );

    return result;
  }

  public async getById (id: string): Promise<IGroup> {
    const result = await this.api.$get<IGroup>(`/${this.path}/${id}`);

    return result;
  }

  public async delete (id: string): Promise<boolean> {
    const result = await this.api.$delete<boolean>(`/${this.path}/${id}`);

    return result;
  }

  public async edit (id: string, payload: GroupPayload): Promise<IGroup> {
    const result = await this.api.$put<IGroup>(`/${this.path}/${id}`, payload);

    return result;
  }
}
