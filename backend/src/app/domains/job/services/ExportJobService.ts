import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import BullQueueProvider from '../../../providers/QueueProvider/BullQueueProvider';
import IQueueProvider from '../../../providers/QueueProvider/models/IQueueProvider';
import QueueRepository, { Queue } from '../../queue/repositories/QueueRepository';

interface ITokenSubject {
  id: string;
  role: string;
}
interface IRequest {
  queueId: string;
  jobId: string;
  user: ITokenSubject
}

interface IResponse {
  filename: string;
  content: string;
}

@injectable()
class ExportJobService {
  constructor(
    @inject('QueueRepository')
    private queueRepository: QueueRepository,
  ) {
    //
  }

  public async execute({
    queueId,
    jobId,
    user,
  }: IRequest): Promise<IResponse> {
    const queue = await this.queueRepository.getById(queueId);
    if (!queue) {
      throw new CustomError('Queue not found', 404);
    }

    const queueProvider = this.newQueueProvider(queue);
    const content = await queueProvider.exportJob(jobId, user.role);

    await queueProvider.close();

    if (!content) {
      throw new CustomError('Job not found', 404);
    }

    const filename = `queue_${queueId}-job_${jobId}.json`;

    return {
      filename,
      content,
    };
  }

  private newQueueProvider(queue: Queue): IQueueProvider {
    return new BullQueueProvider(queue);
  }
}

export default ExportJobService;
