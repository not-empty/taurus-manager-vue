import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  ids: string[];
  data: {
    groupId?: string;
    healthValue?: number;
    host?: string;
    port?: number;
  };
}

@injectable()
class BatchUpdateQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({ ids, data }: IRequest): Promise<Queue[]> {
    const queues = await this.queueRepository.getBulk(ids);
    if (queues.length !== ids.length) {
      throw new CustomError('Could not find all the provided queue ids.', 400);
    }

    const updatedQueues: Queue[] = [];
    for await (const queue of queues) {
      const updated: Partial<Queue> = { ...queue };
      if (data.groupId) updated.groupId = data.groupId;
      if (data.healthValue) updated.healthValue = data.healthValue;
      if (data.host !== undefined) updated.host = data.host;
      if (data.port !== undefined) updated.port = data.port;

      await this.queueRepository.update(queue.id, updated);
      updatedQueues.push({ ...queue, ...updated });
    }

    return updatedQueues;
  }
}

export default BatchUpdateQueueService;
