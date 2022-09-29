import { IUser } from "./user"

export interface authStore {
  token: string
  user: IUser | null
}