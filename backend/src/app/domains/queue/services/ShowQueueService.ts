import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import Queue from '../entities/Queue';
import IQueueRepository from '../repositories/models/IQueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class ShowQueueService {
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

    return queue;
  }
}

export default ShowQueueService;
