import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import { Job } from '../../../providers/QueueProvider/types';
import Queue from '../../queue/entities/Queue';
import IQueueRepository from '../../queue/repositories/models/IQueueRepository';
import { queueCompliance } from '../../../utils/compliceUtils';

interface IRequest {
  queueId: string;
  jobId: string;
}

@injectable()
class ShowJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    queueId,
    jobId,
  }: IRequest): Promise<Job | undefined> {
    const queue = await this.queueRepository.find(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const job = await queueProvider.getJob(jobId);
    queueCompliance(job , queue);
    await queueProvider.close();

    return job;
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ShowJobService;
