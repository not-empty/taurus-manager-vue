export interface ListUsers {
  total: number;
  users: User[];
}

export interface newUser {
  name: string,
  login: string,
  role: string,
  password: string,
}

export interface User {
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
