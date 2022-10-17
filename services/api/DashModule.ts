import {
  ApiListResponse
} from './types';

import { DashQueue } from '~/types/queue';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { DashGroup } from '~/types/group';

export class DashModule {
  public api: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.api = axios;
  }

  public async groupDashById(id: string): Promise<DashGroup> {
    const result = await this.api.$get<DashGroup>(`/group/dashboard/${id}`);

    return result;
  }

  public async groupDash(): Promise<DashGroup[]> {
    const result = await this.api.$get<DashGroup[]>('/group/dashboard');

    return result;
  }

  public async queueDash(id: string): Promise<DashQueue> {
    const result = await this.api.$get<DashQueue>(`/queue/${id}/dashboard`);
    return result;
  }
}
