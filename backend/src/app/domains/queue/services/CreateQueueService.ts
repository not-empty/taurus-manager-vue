import { inject, injectable } from 'tsyringe';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  name: string;
  description?: string;
  compliance?: string;
  host: string;
  port: number;
  healthValue: number;
  groupId: string;
}

@injectable()
class CreateQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    name,
    description,
    compliance,
    host,
    port,
    healthValue,
    groupId,
  }: IRequest): Promise<Queue> {
    const queueId = await this.queueRepository.insert({
      name,
      description,
      compliance,
      host,
      port,
      healthValue,
      groupId,
    });
    const queue = await this.queueRepository.getById(queueId);

    return queue as Queue;
  }
}

export default CreateQueueService;
