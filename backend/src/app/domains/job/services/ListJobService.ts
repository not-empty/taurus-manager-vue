import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import { Job, JobState } from '../../../providers/QueueProvider/types';
import QueueRepository from '../../queue/repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  queueId: string;
  state: JobState;
  page: number;
  size: number;
}

interface IResponse {
  total: number;
  data: Job[];
}

@injectable()
class ListJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    queueId,
    state,
    page,
    size,
  }: IRequest): Promise<IResponse> {
    const queue = await this.queueRepository.getById(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = getQueueProvider(queue);
    const total = await queueProvider.getJobCountsByState(state);
    const start = (page - 1) * size;
    const end = (page * size) - 1;
    const jobs = await queueProvider.listJobs(state, start, end);
    await queueProvider.close();

    return {
      total,
      data: jobs,
    };
  }
}

export default ListJobService;
