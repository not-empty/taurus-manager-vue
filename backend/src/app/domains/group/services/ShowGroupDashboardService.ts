import { inject, injectable } from 'tsyringe';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import CustomError from '../../../errors/CustomError';
import GroupRepository, { Group } from '../repositories/GroupRepository';
import QueueRepository, { Queue } from '../../queue/repositories/QueueRepository';

interface IRequest {
  groupId: string;
  user: Express.IUserSession;
}

interface IDashboardItem {
  group: Group;
  queues: Queue[];
}

@injectable()
class ShowGroupDashboardService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,

    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({ groupId, user }: IRequest): Promise<IDashboardItem> {
    let groupIds: string[];
    if (!user.groups) {
      const allGroups = await this.groupRepository.listAll();
      groupIds = allGroups.map((group) => group.id);
    } else {
      groupIds = user.groups;
    }

    if (!groupIds.includes(groupId)) {
      throw new CustomError(
        'User has no permission to access this group.',
        403,
      );
    }

    const group = await this.groupRepository.getById(groupId);

    if (!group) {
      throw new CustomError('Group not found.', 404);
    }

    const queues = await this.queueRepository.listByGroup(group.id);
    const describedQueues = await Promise.all(
      queues.map(async (queue) => {
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

        return describedQueue;
      }),
    );

    return {
      group,
      queues: describedQueues,
    };
  }

  public newBullQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ShowGroupDashboardService;
