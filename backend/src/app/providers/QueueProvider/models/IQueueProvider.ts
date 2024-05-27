import { Group } from '../../../domains/group/repositories/GroupRepository';
import { Queue } from '../../../domains/queue/repositories/QueueRepository';
import {
  Job, JobStacktrace, JobState, QueueJobCounts, QueueStatus,
} from '../types';

export interface DescribedQueue extends Queue {
  status: QueueStatus;
  jobCounts: QueueJobCounts;
  group?: Group;
}

export interface IQueueProvider {
  addJob(data: any): Promise<boolean>;
  cloneJob(jobId: string): Promise<boolean>;
  close(): Promise<void>;
  deleteJobs(jobIds: string[]): Promise<boolean>;
  describe(): Promise<DescribedQueue>;
  exportJob(jobId: string, role: string): Promise<string | null>;
  formatJobStacktrace(stacktrace?: string[]): JobStacktrace[] | null;
  getJob(jobId: string): Promise<Job | undefined>;
  getJobCounts(): Promise<QueueJobCounts>;
  getJobCountsByState(state: JobState): Promise<number>;
  getStatus(): Promise<QueueStatus>;
  listJobs(state: JobState, start: number, end: number): Promise<Job[]>;
  pause(): Promise<boolean>;
  resume(): Promise<boolean>;
  retryJobs(jobIds: string[]): Promise<boolean>;
  retryAllJobs(): Promise<boolean>;
}

export default IQueueProvider;
