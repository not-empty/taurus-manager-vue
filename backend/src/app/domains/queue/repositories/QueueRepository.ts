import {
  BaseEntity,
  BaseRepository,
  ListOptions,
  PaginatedResult,
} from '../../../core/BaseRepository';
import { Group } from '../../group/repositories/GroupRepository';

export interface Queue extends BaseEntity {
  name: string,
  description?: string,
  host: string,
  port: number,
  compliance?: string,
  groupId: string,
  healthValue: number
}

export interface QueueWithGroupFields extends Queue {
  group_name: string;
}

export interface QueueWithGroup extends Queue {
  group: Group;
}
export class QueueRepository extends BaseRepository<Queue> {
  public tableName: string = 'queue';

  public async listByGroup(groupId: string): Promise<Queue[]> {
    const data = await this.db<Queue>(this.tableName)
      .select('*')
      .where({ groupId })
      .whereNull('deletedAt');

    return data;
  }

  public async listWithGroup(
    options: ListOptions<QueueWithGroup> = {},
  ): Promise<PaginatedResult<QueueWithGroup>> {
    const page = options.page || 1;
    const limit = options.limit || 25;

    const data = await this.db<Queue>(this.tableName)
      .select('queue.*', 'group.name as groupName')
      .whereNull('queue.deletedAt')
      .leftJoin<Group>('group', 'queue.groupId', 'group.id')
      .offset((page - 1) * limit)
      .limit(limit);

    const result: QueueWithGroup[] = data.map((v) => {
      const queue = { ...v };
      queue.group = {
        id: queue.groupId,
        name: queue.groupName,
      };
      delete queue.groupName;

      return queue;
    });

    return {
      data: result,
      page,
      limit,
    };
  }
}

export default QueueRepository;
