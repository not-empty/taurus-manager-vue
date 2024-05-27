import { Queue } from './QueueTypes';

export interface IGroup {
  id: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  queues: Queue[];
}
