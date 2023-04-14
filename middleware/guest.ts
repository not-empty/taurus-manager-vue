import { Context } from '@nuxt/types';
import { decode, JwtPayload } from 'jsonwebtoken';
import { IUser } from '~/types/user';

interface AuthState {
  auth: {
    token: string
    user: IUser
  }
}

export default function (context: Context) {
  const state = context.store.state as AuthState;
  const decodedToken = decode(state.auth.token);
  if (checkExpire(decodedToken)) {
    context.redirect('/dashboard');
  }
}

function checkExpire (token: string | JwtPayload | null): boolean {
  if (token) {
    const { exp } = token as JwtPayload;
    return (exp && exp < Date.now()) as boolean;
  }

  return false;
}
