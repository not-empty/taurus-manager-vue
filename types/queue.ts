export interface IQueue {
  id: string;
  name: string;
  description: string;
  compliance: string | null;
  host: string;
  port: number;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
export interface DashQueue extends IQueue {
  status: string
  jobCounts: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
    paused: number
  }
}

export interface QueuePayload {
  name: string
  host: string
  port: string
  groupId: string
  description: string
  compliance: string | null
}
