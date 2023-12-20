import { inject, injectable } from "tsyringe";
import IQueueProvider from "../../../providers/QueueProvider/models/IQueueProvider";
import Queue from "../../queue/entities/Queue";
import IQueueRepository from "../../queue/repositories/models/IQueueRepository";
import BullQueueProvider from "../../../providers/QueueProvider/BullQueueProvider";
import Group from "../entities/Group";
import IGroupRepository from "../repositories/models/IGroupRepository";

interface IUser {
  id: string;
  role: string;
  groups: string;
}

interface IRequest {
  user: IUser;
}

interface IMonitorItem {
  queues: Queue[];
}

@injectable()
class ListGroupMonitorService {
  constructor(
    @inject("GroupRepository")
    private groupRepository: IGroupRepository,

    @inject("QueueRepository")
    private queueRepository: IQueueRepository
  ) {}

  public async execute({ user }: IRequest): Promise<{}> {
    let groupIds: string[];
    if (user.groups === "" || user.groups === null) {
      const allGroups = await this.groupRepository.findAll();
      groupIds = allGroups.map((group) => group.id);
    } else {
      groupIds = JSON.parse(user.groups);
    }

    const monitor: IMonitorItem[] = [];

    const allQueues = [];
    for (const group of groupIds) {
      const queues = await this.queueRepository.findByGroup(group);

      // Using reduce to filter queues
      const describedQueues = await queues.reduce(
        async (filteredQueuesPromise, queue) => {
          const filteredQueues = await filteredQueuesPromise;
          const queueProvider = this.newBullQueueProvider(queue);
          const describedQueue = await queueProvider.describe();
          await queueProvider.close();

          const half = describedQueue.health_value / 2;
          const total =
            describedQueue.jobCounts.waiting + describedQueue.jobCounts.paused;
          if (total >= half || total >= describedQueue.health_value) {
            filteredQueues.push(describedQueue);
          }

          return filteredQueues;
        },
        Promise.resolve([])
      );

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
  public async getGroups(user: IUser): Promise<Group[]> {
    if (user.role === "administrator") {
      return this.groupRepository.findAll();
    }
    return this.groupRepository.findByIds(JSON.parse(user.groups));
  }

  public newBullQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ListGroupMonitorService;
