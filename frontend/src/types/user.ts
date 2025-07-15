export type IUserRole = 'controller' | 'administrator' | 'guest';

export interface IUserValidate {
  id: string,
  role: IUserRole,
}

export interface IUser {
  id: string;
  name: string;
  login: string;
  password: string;
  role: IUserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  allowAll: number;
  groups: string;
}

export interface IUserAdd {
  name: string,
  login: string,
  role: IUserRole,
  password: string,
}
