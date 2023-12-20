import { inject, injectable } from 'tsyringe';
import IQueueRepository from '../repositories/models/IQueueRepository';

interface IRequest {
  id: string;
}

@injectable()
class DeleteQueueService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: IQueueRepository,
  ) {}

  public async execute({
    id,
  }: IRequest): Promise<boolean> {
    const deleted = await this.queueRepository.delete(id);

    return deleted;
  }
}

export default DeleteQueueService;
