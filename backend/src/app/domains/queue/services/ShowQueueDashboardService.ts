import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import { DescribedQueue } from '../../../providers/QueueProvider/models/IQueueProvider';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class ShowQueueDashboardService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute({
    id,
  }: IRequest): Promise<DescribedQueue> {
    const queue = await this.queueRepository.getById(id);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const describedQueue = await queueProvider.describe();
    await queueProvider.close();

    return describedQueue;
  }

  public newQueueProvider(queue: Queue): BullQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ShowQueueDashboardService;
