import { inject, injectable } from 'tsyringe';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  page?: number;
  size?: number;
}

interface IResponse {
  total: number;
  data: Queue[];
}

@injectable()
class ListQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute({
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const total = await this.queueRepository.count();
    const queues = await this.queueRepository.listWithGroup({
      page,
      limit: size,
    });

    return {
      total,
      data: queues.data,
    };
  }
}

export default ListQueueService;
