import { Context } from "@nuxt/types";
import { IUser } from "~/types/user";
import { decode, JwtPayload } from "jsonwebtoken"

interface AuthState {
  auth: {
    token: string
    user: IUser
  }
}

export default function (context: Context) {
  const state = context.store.state as AuthState
  const decodedToken = decode(state.auth.token)
  if(!checkExpire(decodedToken)) {
    localStorage.removeItem('session')
    context.store.dispatch('auth/removeSession')
    context.redirect('/')
  }
}

function checkExpire(token: string | JwtPayload | null): boolean {
  if(token) {
    const {exp} = token as JwtPayload
    return (exp && exp < Date.now()) as boolean
  }
  return false
}