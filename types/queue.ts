import { IGroup } from "./group";

export interface IQueue {
  id: string;
  name: string;
  description: string;
  compliance: string | null;
  host: string;
  port: number;
  groupId: string;
  group: IGroup;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface JobCounts {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  paused: number
}

export interface DashQueue extends IQueue {
  status: string
  jobCounts: JobCounts
}

export interface QueuePayload {
  name: string
  host: string
  port: string
  groupId: string
  description: string
  compliance: string | null
}
