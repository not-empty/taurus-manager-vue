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
}