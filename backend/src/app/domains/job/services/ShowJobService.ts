import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import { Job } from '../../../providers/QueueProvider/types';
import { queueCompliance } from '../../../utils/compliceUtils';
import QueueRepository from '../../queue/repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  queueId: string;
  jobId: string;
}

@injectable()
class ShowJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    queueId,
    jobId,
  }: IRequest): Promise<Job | undefined> {
    const queue = await this.queueRepository.getById(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = await getQueueProvider(queue);
    const job = await queueProvider.getJob(jobId);
    queueCompliance(job, queue);
    await queueProvider.close();

    return job;
  }
}

export default ShowJobService;
