import { IDashboardResponse, IGroup } from 'src/types/group';
import { EntityModule } from './EntityModule';
import { IQueueDash } from 'src/types/queues';
import { ApiAddResponse, ApiListResponse } from './types';

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
