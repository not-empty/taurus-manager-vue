import type { IGroup } from "./group";

export interface IQueue {
  id: string;
  name: string;
  description: string;
  compliance: string;
  host: string;
  port: number;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  healthValue: number;
  group?: IGroup,
}

export interface IQueueDash {
  id: string;
  name: string;
  description: string;
  compliance: string;
  host: string;
  port: number;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  healthValue: number;
  group: IGroup;
  status: IQueueStatus;
  jobCounts: IQueueJobCounts;
  selected?: boolean;
}

export interface INewQueue {
  name: string,
  description: string,
  groupId: string,
  group?: IGroup,
  host: string,
  port: number,
  healthValue: number
}

type IQueueStatus = 'running' | 'paused' | 'unavailable';

export interface IQueueJobCounts {
  waiting: number;
  paused: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
};

export interface IQueueBatchEdit {
  groupId?: string;
  healthValue?: number;
  description?: string;
  host?: string;
  port?: number;
}
