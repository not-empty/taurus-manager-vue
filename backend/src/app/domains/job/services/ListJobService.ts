import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import { Job, JobState } from '../../../providers/QueueProvider/types';
import Queue from '../../queue/entities/Queue';
import IQueueRepository from '../../queue/repositories/models/IQueueRepository';

interface IRequest {
  queueId: string;
  state: JobState;
  page: number;
  size: number;
}

interface IResponse {
  total: number;
  jobs: Job[];
}

@injectable()
class ListJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    queueId,
    state,
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const queue = await this.queueRepository.find(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const total = await queueProvider.getJobCountsByState(state);
    const start = (page - 1) * size;
    const end = (page * size) - 1;
    const jobs = await queueProvider.listJobs(state, start, end);
    await queueProvider.close();

    return {
      total,
      jobs,
    };
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ListJobService;
