import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import QueueRepository, { Queue } from '../repositories/QueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class PauseQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {}

  public async execute({
    id,
  }: IRequest): Promise<boolean> {
    const queue = await this.queueRepository.getById(id);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const paused = await queueProvider.pause();
    await queueProvider.close();

    return paused;
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default PauseQueueService;
