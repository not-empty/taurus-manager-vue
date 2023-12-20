import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import Queue from '../entities/Queue';
import IQueueRepository from '../repositories/models/IQueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class ShowQueueDashboardService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    id,
  }: IRequest): Promise<Queue> {
    const queue = await this.queueRepository.find(id);
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
