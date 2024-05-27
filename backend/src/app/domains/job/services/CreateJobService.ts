import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import QueueRepository, { Queue } from '../../queue/repositories/QueueRepository';

interface IRequest {
  queueId: string;
  data: any;
}

@injectable()
class CreateJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute({
    queueId,
    data,
  }: IRequest): Promise<boolean> {
    const queue = await this.queueRepository.getById(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const result = await queueProvider.addJob(data);
    await queueProvider.close();

    return result;
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default CreateJobService;
