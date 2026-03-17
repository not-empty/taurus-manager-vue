import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository from '../../queue/repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  queueId: string;
  jobIds: string[];
}

@injectable()
class DeleteJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    queueId,
    jobIds,
  }: IRequest): Promise<boolean> {
    const queue = await this.queueRepository.getById(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = getQueueProvider(queue);
    const result = await queueProvider.deleteJobs(jobIds);
    await queueProvider.close();

    return result;
  }
}

export default DeleteJobService;
