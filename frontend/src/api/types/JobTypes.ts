export interface ListJob {
  total: number;
  jobs: Job[];
}

export interface Job {
  id: string;
  data?: unknown;
  attemptsMade: number;
  name: string;
  timestamp: number;
  createdAt?: string;
  processedAt?: string;
  finishedAt?: string;
  state: JobState;
  canRetry: boolean;
  failedReason?: string;
  stacktrace?: JobStacktrace[] | string;
};

type JobState = 'waiting' | 'active' | 'delayed' | 'failed' | 'completed';

type JobStacktrace = {
  order: number;
  content: string;
};
