import { IGroup } from './group';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  groups?: IGroup[];
  groupIds: string[];
}
