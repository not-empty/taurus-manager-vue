// export interface IUserSession {
//   id: string;
//   role: string;
//   groups: string[];
// }

// import { User } from "./models/user";
//   interface Session {
//     user: User;
//     uuid: string;
//   }
// }

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



