import { inject, injectable } from 'tsyringe';
import IQueueProvider, { DescribedQueue } from '../../../providers/QueueProvider/models/IQueueProvider';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import GroupRepository, { Group } from '../repositories/GroupRepository';
import QueueRepository, { Queue } from '../../queue/repositories/QueueRepository';

interface IRequest {
  user: Express.IUserSession;
}

@injectable()
class ListGroupMonitorService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,

    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({ user }: IRequest): Promise<{
    total: number,
    data: DescribedQueue[],
  }> {
    let groupIds: string[];
    if (!user.groups) {
      const allGroups = await this.groupRepository.listAll();
      groupIds = allGroups.map((group) => group.id);
    } else {
      groupIds = user.groups;
    }

    const allQueues: DescribedQueue[] = [];
    for (const group of groupIds) {
      const queues = await this.queueRepository.listWithGroupByGroupId(group);

      const describedQueues: DescribedQueue[] = [];

      for (const queue of queues.data) {
        const queueProvider = this.newBullQueueProvider(queue);
        let describedQueue;
        try {
          describedQueue = await Promise.race([
            queueProvider.describe(),
            new Promise((_, reject) => {
              setTimeout(() => { reject(new Error('Timeout connecting to queue service')); }, 500);
            }),
          ]);
          describedQueue.group = group;
        } catch (error) {
          describedQueue = {
            ...queue,
            status: 'Unavailable',
            jobCounts: {
              waiting: -1,
              paused: -1,
              active: -1,
              delayed: -1,
              failed: -1,
              completed: -1,
            },
            group,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        } finally {
          await queueProvider.close();
        }

        const half = describedQueue.healthValue / 2;
        const total = describedQueue.jobCounts.waiting + describedQueue.jobCounts.paused;
        if (total >= half || total >= describedQueue.healthValue) {
          describedQueues.push(describedQueue);
        }
      }

      if (describedQueues.length > 0) {
        for (const eachQueue of describedQueues) {
          allQueues.push(eachQueue);
        }
      }
    }

    return {
      total: allQueues.length,
      data: allQueues,
    };
  }

  public async getGroups(user: Express.IUserSession): Promise<Group[]> {
    if (user.role === 'administrator') {
      return this.groupRepository.listAll();
    }
    return this.groupRepository.getBulk(user.groups);
  }

  public newBullQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ListGroupMonitorService;
