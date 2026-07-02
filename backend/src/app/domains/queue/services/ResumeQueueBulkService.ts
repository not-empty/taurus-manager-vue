import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository from '../repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  ids: string[];
}

@injectable()
class ResumeQueueBulkService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    ids,
  }: IRequest): Promise<boolean> {
    const queues = await this.queueRepository.getBulk(ids);

    if (queues.length !== ids.length) {
      throw new CustomError('Could not find all the provided queue ids.', 400);
    }

    for await (const queue of queues) {
      try {
        const queueProvider = await getQueueProvider(queue);
        await queueProvider.resume();
        await queueProvider.close();
      } catch (error) {
        throw new CustomError(`Could not resume queue: ${queue.id}`, 500);
      }
    }

    return true;
  }
}

export default ResumeQueueBulkService;
