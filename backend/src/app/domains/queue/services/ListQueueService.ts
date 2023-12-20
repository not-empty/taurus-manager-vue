import { inject, injectable } from 'tsyringe';
import Queue from '../entities/Queue';
import IQueueRepository from '../repositories/models/IQueueRepository';

interface IRequest {
  page?: number;
  size?: number;
}

interface IResponse {
  total: number;
  queues: Queue[];
}

@injectable()
class ListQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const total = await this.queueRepository.count();
    const queues = await this.queueRepository.findAll(
      page,
      size,
    );

    return {
      total,
      queues,
    };
  }
}

export default ListQueueService;
