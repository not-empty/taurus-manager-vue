import { Queue } from '../domains/queue/repositories/QueueRepository';
import { Job } from '../providers/QueueProvider/types';

export const queueCompliance = (job: Job | undefined, queue: Queue): Job | undefined => {
  if (
    job && 
    queue.compliance &&
    job.data
  ) {
    const compliance = queue.compliance.split(',');
    compliance.forEach((element) => {
      if (job.data[element]) {
        job.data[element] = '{{hidden}}';
      }
    });
  }
  return job;
}
