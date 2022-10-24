import { DashQueue } from "./queue";

export interface IGroup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface GroupPayload {
  name: string;
  description: string;
}

export interface DashGroup {
  group: IGroup 
  queues: DashQueue[];
}