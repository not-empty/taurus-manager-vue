import { Group } from './GroupTypes';

export interface DashboardItem {
  group: Group;
  queues: Queue[];
}

export interface ListQueue {
  total: number;
  queues: Queue[];
}

export interface newQueue {
  name: string,
  description: string,
  groupId: string,
  group?: Group,
  host: string,
  port: number,
  healthValue: number
}

export interface Queue {
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
  group: Group;
  status: QueueStatus;
  jobCounts: QueueJobCounts;
  selected?: boolean;
}

type QueueStatus = 'running' | 'paused';

export interface QueueJobCounts {
  waiting: number;
  paused: number;
  active: number;
  delayed: number;
  failed: number;
  completed: number;
};
