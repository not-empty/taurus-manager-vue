import { inject, injectable } from 'tsyringe';
import QueueRepository, { Queue } from '../repositories/QueueRepository';
import { Filter, OrderBy } from '../../../core/BaseRepository';

interface IRequest {
  page?: number;
  size?: number;
  filters?: Filter<Queue>[];
  order?: OrderBy<Queue>;
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
  ) {
    //
  }

  public async execute({
    page,
    size,
    filters,
    order,
  }: IRequest): Promise<IResponse> {
    const total = await this.queueRepository.count();
    const queues = await this.queueRepository.listWithGroup({
      page,
      limit: size,
      filters,
      order,
    });

    return {
      total,
      data: queues.data,
    };
  }
}

export default ListQueueService;
