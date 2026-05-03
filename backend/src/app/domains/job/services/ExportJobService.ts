import { inject, injectable } from 'tsyringe';
import CustomError from '../../../errors/CustomError';
import QueueRepository from '../../queue/repositories/QueueRepository';
import getQueueProvider from '../../../providers/QueueProvider';

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

    const queueProvider = getQueueProvider(queue);
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
}

export default ExportJobService;
