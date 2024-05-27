import { Queue } from './QueueTypes';

export interface ListGroup {
  total: number;
  groups: Group[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  queues: Queue[];
}
