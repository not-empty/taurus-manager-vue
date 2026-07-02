import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import { DescribedQueue } from '../../../providers/QueueProvider/QueueProvider';
import QueueRepository from '../repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  id: string;
}

@injectable()
class ShowQueueDashboardService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    id,
  }: IRequest): Promise<DescribedQueue> {
    const queue = await this.queueRepository.getById(id);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = await getQueueProvider(queue);
    const describedQueue = await queueProvider.describe();
    await queueProvider.close();

    return describedQueue;
  }
}

export default ShowQueueDashboardService;
