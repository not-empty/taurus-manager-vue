export type QueueStatus = 'running' | 'paused';

export type QueueJobCounts = {
  waiting: number;
  paused: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
};

export type JobStacktrace = {
  order: number;
  content: string;
};

export type JobState = 'waiting' | 'active' | 'delayed' | 'failed' | 'completed';

export type Job = {
  id: string;
  data?: any;
  attemptsMade: number;
  name: string;
  timestamp: number;
  createdAt?: string;
  processedAt?: string;
  finishedAt?: string;
  state: JobState;
  canRetry: boolean;
  failedReason?: string;
  stacktrace?: JobStacktrace[];
};

export default QueueStatus;
