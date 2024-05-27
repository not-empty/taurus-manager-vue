import { inject, injectable } from "tsyringe";
import IQueueProvider from "../../../providers/QueueProvider/models/IQueueProvider";
import BullQueueProvider from "../../../providers/QueueProvider/BullQueueProvider";
import GroupRepository, { Group } from "../repositories/GroupRepository";
import QueueRepository, { Queue } from "../../queue/repositories/QueueRepository";

interface IRequest {
  user: Express.IUserSession;
}

interface IDashboardItem {
  group: Group;
  queues: Queue[];
}

@injectable()
class ListGroupDashboardService {
  constructor(
    @inject("GroupRepository")
    private groupRepository: GroupRepository,

    @inject("QueueRepository")
    private queueRepository: QueueRepository
  ) {}

  public async execute({ user }: IRequest): Promise<IDashboardItem[]> {
    let groupIds: string[];
    if (!user.groups) {
      const allGroups = await this.groupRepository.listAll();
      groupIds = allGroups.map((group) => group.id);
    } else {
      groupIds = user.groups;
    }

    const dashboard: IDashboardItem[] = [];

    for (const groupId of groupIds) {
      const group = await this.groupRepository.getById(groupId);

      if (!group) {
        continue;
      }

      const queues = await this.queueRepository.listByGroup(groupId);
      const describedQueues = await Promise.all(
        queues.map(async (queue) => {
          const queueProvider = this.newBullQueueProvider(queue);
          const describedQueue = await queueProvider.describe();
          describedQueue.group = group;
          await queueProvider.close();

          return describedQueue;
        })
      );

      dashboard.push({
        group,
        queues: describedQueues,
      });
    }

    return dashboard;
  }

  public async getGroups(user: Express.IUserSession): Promise<Group[]> {
    if (user.role === "administrator") {
      return this.groupRepository.listAll();
    }
    return this.groupRepository.getBulk(user.groups);
  }

  public newBullQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ListGroupDashboardService;
