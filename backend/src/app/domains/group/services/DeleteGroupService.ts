import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import GroupRepository from '../repositories/GroupRepository';
import QueueRepository from '../../queue/repositories/QueueRepository';

@injectable()
class DeleteGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: GroupRepository,

    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute(id: string): Promise<boolean> {
    const group = await this.groupRepository.getById(id);
    if (!group) {
      throw new CustomError('Group not found', 404);
    }

    const queues = await this.queueRepository.listByGroup(id);
    if (queues.length) {
      throw new CustomError('Group has queues. Could not be deleted.', 400);
    }

    const result = await this.groupRepository.delete(id);

    return result;
  }
}

export default DeleteGroupService;
