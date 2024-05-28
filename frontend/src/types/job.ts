export interface IJob {
  id: string;
  data?: unknown;
  attemptsMade: number;
  name: string;
  timestamp: number;
  createdAt?: string;
  processedAt?: string;
  finishedAt?: string;
  state: IJobState;
  canRetry: boolean;
  failedReason?: string;
  stacktrace?: IJobStacktrace[] | string;
};

export type IJobState = 'waiting' | 'active' | 'delayed' | 'failed' | 'completed';

type IJobStacktrace = {
  order: number;
  content: string;
};
