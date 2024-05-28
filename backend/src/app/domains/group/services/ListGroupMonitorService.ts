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

  public async execute({ user }: IRequest): Promise<{}> {
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
        const describedQueue = await queueProvider.describe();
        await queueProvider.close();

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

    const result = {
      queues: allQueues,
    };
    return result;
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
