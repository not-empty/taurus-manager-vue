import { inject, injectable } from "tsyringe";
import IQueueProvider from "../../../providers/QueueProvider/models/IQueueProvider";
import Queue from "../../queue/entities/Queue";
import IQueueRepository from "../../queue/repositories/models/IQueueRepository";
import BullQueueProvider from "../../../providers/QueueProvider/BullQueueProvider";
import Group from "../entities/Group";
import IGroupRepository from "../repositories/models/IGroupRepository";
import CustomError from "../../../errors/CustomError";

interface IUser {
  id: string;
  role: string;
  groups: string;
}

interface IRequest {
  groupId: string;
  user: IUser;
}

interface IDashboardItem {
  group: Group;
  queues: Queue[];
}

@injectable()
class ShowGroupDashboardService {
  constructor(
    @inject("GroupRepository")
    private groupRepository: IGroupRepository,

    @inject("QueueRepository")
    private queueRepository: IQueueRepository
  ) {}

  public async execute({ groupId, user }: IRequest): Promise<IDashboardItem> {
    let groupIds: string[];
    if (user.groups === "" || user.groups === null) {
      const allGroups = await this.groupRepository.findAll();
      groupIds = allGroups.map((group) => group.id);
    } else {
      groupIds = JSON.parse(user.groups);
    }

    if (!groupIds.includes(groupId)) {
      throw new CustomError(
        "User has no permission to access this group.",
        403
      );
    }

    const group = await this.groupRepository.find(groupId);

    if (!group) {
      throw new CustomError("Group not found.", 404);
    }

    const queues = await this.queueRepository.findByGroup(group.id);
    const describedQueues = await Promise.all(
      queues.map(async (queue) => {
        const queueProvider = this.newBullQueueProvider(queue);
        const describedQueue = await queueProvider.describe();
        await queueProvider.close();

        return describedQueue;
      })
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
