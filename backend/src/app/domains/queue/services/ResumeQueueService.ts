import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository from '../repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

interface IRequest {
  id: string;
}

@injectable()
class ResumeQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    id,
  }: IRequest): Promise<boolean> {
    const queue = await this.queueRepository.getById(id);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = await getQueueProvider(queue);
    const resumed = await queueProvider.resume();
    await queueProvider.close();

    return resumed;
  }
}

export default ResumeQueueService;
