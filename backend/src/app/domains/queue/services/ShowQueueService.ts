import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class ShowQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute({
    id,
  }: IRequest): Promise<Queue> {
    const queue = await this.queueRepository.getById(id);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    return queue;
  }
}

export default ShowQueueService;
