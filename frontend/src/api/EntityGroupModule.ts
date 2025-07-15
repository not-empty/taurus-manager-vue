import type { IDashboardResponse, IGroup } from '@/types/group';
import type { IQueueDash } from '@/types/queues';
import type { ApiAddResponse, ApiListResponse } from './types';
import { EntityModule } from './EntityModule';

interface INewGroup {
  id: string;
  name: string;
  description: string;
}

export class GroupEntityModule<T> extends EntityModule<T> {
  public async newGroup(payload: INewGroup): Promise<IGroup> {
    const result = await this.api.post<ApiAddResponse<IGroup>>(
      `/${this.path}`,
      payload,
    );

    return result.data;
  }

  public async getDashboard(): Promise<IDashboardResponse[]> {
    const result = await this.api.get<IDashboardResponse[]>(
      `/${this.path}/dashboard`,
    );

    return result.data;
  }

  public async getDashboardByGroupId(groupId: string): Promise<IDashboardResponse> {
    const result = await this.api.get<IDashboardResponse>(
      `/${this.path}/dashboard/${groupId}`,
    );

    return result.data;
  }

  public async getGroupMonitor(): Promise<ApiListResponse<IQueueDash>> {
    const result = await this.api.get<ApiListResponse<IQueueDash>>(
      `/${this.path}/monitor`,
    );

    return result.data;
  }
}
