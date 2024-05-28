import { inject, injectable } from 'tsyringe';
import QueueRepository from '../repositories/QueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class DeleteQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    id,
  }: IRequest): Promise<boolean> {
    const deleted = await this.queueRepository.delete(id);

    return deleted;
  }
}

export default DeleteQueueService;
