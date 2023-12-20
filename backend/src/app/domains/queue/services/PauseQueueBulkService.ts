import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import Queue from '../entities/Queue';
import IQueueRepository from '../repositories/models/IQueueRepository';

interface IRequest {
  ids: string[];
}

@injectable()
class PauseQueueBulkService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    ids,
  }: IRequest): Promise<boolean> {
    const queues = await this.queueRepository.findByIds(ids);

    if (queues.length !== ids.length) {
      throw new CustomError('Could not find all the provided queue ids.', 400);
    }

    for await (const queue of queues) {
      try {
        const queueProvider = this.newQueueProvider(queue);
        await queueProvider.pause();
        await queueProvider.close();
      } catch (error) {
        throw new CustomError(`Could not pause queue: ${queue.id}`, 500);
      }
    }

    return true;
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default PauseQueueBulkService;
