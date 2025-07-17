export interface IJob {
  id: string;
  data?: unknown;
  attemptsMade: number;
  name: string;
  timestamp: number;
  processedAt?: string;
  finishedAt?: string;
  state: IJobState;
  canRetry: boolean;
  failedReason?: string;
  stacktrace?: IJobStacktrace[] | string;
  createdAt: Date;
};

export const jobStates = ['waiting', 'paused', 'active', 'delayed', 'failed', 'completed'] as const;
export type IJobState = typeof jobStates[number];

type IJobStacktrace = {
  order: number;
  content: string;
};
