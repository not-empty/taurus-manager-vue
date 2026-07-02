import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository from '../../queue/repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  queueId: string;
  data: any;
}

@injectable()
class CreateJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    queueId,
    data,
  }: IRequest): Promise<boolean> {
    const queue = await this.queueRepository.getById(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = await getQueueProvider(queue);
    const result = await queueProvider.addJob(data);
    await queueProvider.close();

    return result;
  }
}

export default CreateJobService;
