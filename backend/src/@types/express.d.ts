declare namespace Express {
  declare interface IUserSession {
    id: string;
    role: string;
    groups: string[];
  }
  export interface Request {
    user: IUserSession;
  }
}
