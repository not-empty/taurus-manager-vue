import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import IQueueRepository from '../../queue/repositories/models/IQueueRepository';
import IGroupRepository from '../repositories/models/IGroupRepository';

@injectable()
class DeleteGroupService {
  constructor(
    @inject('GroupRepository')
    private groupRepository: IGroupRepository,

    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute(id: string): Promise<boolean> {
    const group = await this.groupRepository.find(id);
    if (!group) {
      throw new CustomError('Group not found', 404);
    }

    const queues = await this.queueRepository.findByGroup(id);
    if (queues.length) {
      throw new CustomError('Group has queues. Could not be deleted.', 400);
    }

    const result = await this.groupRepository.delete(id);

    return result;
  }
}

export default DeleteGroupService;
