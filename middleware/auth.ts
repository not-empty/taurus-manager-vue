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
  const decodedToken = decode(state.auth.token) as JwtPayload || null
  if(checkExpire(decodedToken)) {
    context.store.dispatch('auth/removeSession')
    context.redirect('/')
  }
}

function checkExpire(token: JwtPayload | null): boolean {
  if(
    token &&
    token.exp
  ) {
    const {exp} = token
    const milisecond = exp * 1000
    if (milisecond > Date.now()) {
      return false;
    }
  }
  return true;
}
