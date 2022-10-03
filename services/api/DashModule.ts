import {
  ApiListResponse
} from './types';

import { IQueue } from '~/types/queue';
import { NuxtAxiosInstance } from '@nuxtjs/axios';
import { DashGroup } from '~/types/group';

interface DashQueue extends IQueue {
  jobCounts: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    paused: number
  }
}

export class DashModule {
  public api: NuxtAxiosInstance;

  constructor(axios: NuxtAxiosInstance) {
    this.api = axios;
  }

  public async groupDashById(id: string): Promise<DashGroup> {
    const result = await this.api.$get<ApiListResponse<DashGroup>>(`/group/dashboard/${id}`);

    return result.data;
  }

  public async groupDash(): Promise<DashGroup[]> {
    const result = await this.api.$get<DashGroup[]>('/group/dashboard');

    return result;
  }

  public async queueDash(id: string): Promise<DashQueue> {
    const result = await this.api.$get<ApiListResponse<DashQueue>>(`/queue/${id}/dashboard`);
    return result.data;
  }
}
