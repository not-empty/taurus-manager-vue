import { IQueue } from "./queue";

export interface IGroup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface DashGroup {
  group: IGroup 
  queues: IQueue[];
}