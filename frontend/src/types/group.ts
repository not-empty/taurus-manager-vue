import { IQueueDash } from './queues';

export interface IDashboardResponse {
  group: IGroup;
  queues: IQueueDash[];
}

export interface IGroup {
  id: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  queues: IQueueDash[];
}
