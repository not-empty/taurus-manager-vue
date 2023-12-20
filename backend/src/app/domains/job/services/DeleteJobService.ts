import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import Queue from '../../queue/entities/Queue';
import IQueueRepository from '../../queue/repositories/models/IQueueRepository';

interface IRequest {
  queueId: string;
  jobIds: string[];
}

@injectable()
class DeleteJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    queueId,
    jobIds,
  }: IRequest): Promise<boolean> {
    const queue = await this.queueRepository.find(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const result = await queueProvider.deleteJobs(jobIds);
    await queueProvider.close();

    return result;
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default DeleteJobService;
