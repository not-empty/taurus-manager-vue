export interface IUser {
  id: string;
  name: string;
  login: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  allowAll: number;
  groups: string;
}

export interface IUserAdd {
  name: string,
  login: string,
  role: string,
  password: string,
}
