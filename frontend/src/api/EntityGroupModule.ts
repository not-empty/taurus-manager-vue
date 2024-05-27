import { IGroup } from 'src/types/group';
import { EntityModule } from './EntityModule';
import { IQueue } from 'src/types/queues';

interface IDashboardResponse {
  group: IGroup;
  queues: IQueue[];
}

export class GroupEntityModule<T> extends EntityModule<T> {
  public async getDashboardByGroupId(groupId: string): Promise<IDashboardResponse> {
    const result = await this.api.get<IDashboardResponse>(
      `/${this.path}/dashboard/${groupId}`,
    );

    return result.data;
  }
}
