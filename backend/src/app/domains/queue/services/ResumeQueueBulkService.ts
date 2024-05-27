import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  ids: string[];
}

@injectable()
class ResumeQueueBulkService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute({
    ids,
  }: IRequest): Promise<boolean> {
    const queues = await this.queueRepository.getBulk(ids);

    if (queues.length !== ids.length) {
      throw new CustomError('Could not find all the provided queue ids.', 400);
    }

    for await (const queue of queues) {
      try {
        const queueProvider = this.newQueueProvider(queue);
        await queueProvider.resume();
        await queueProvider.close();
      } catch (error) {
        throw new CustomError(`Could not resume queue: ${queue.id}`, 500);
      }
    }

    return true;
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ResumeQueueBulkService;
