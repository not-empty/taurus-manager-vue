import { Api } from "@/api";
import { AxiosError, isAxiosError } from "axios";
import { useSessionStore } from "@/stores/session";
import Cookies from "js-cookie";
import type { IUserRole } from "@/types/user";
import type { NavigationGuardWithThis } from "vue-router";

export const sessionMiddleware: NavigationGuardWithThis<undefined> = async (_to, _from, next) => {
  try {
    const isUserAuthenticated = Cookies.get('isLogged');

    if (!isUserAuthenticated) {
      throw Error('Not Authenticated');
    }

    const sessionStore = useSessionStore();
    if (!sessionStore.user) {
      const api = new Api();
      const user = await api.validate();

      sessionStore.setUser(user);
    }

    next();
  } catch (error) {
    const sessionStore = useSessionStore();
    Cookies.remove('isLogged');
    sessionStore.$reset;

    if (isServerOffline(error as AxiosError)) {
      next('/503');
      return;
    }

    next('/login');
  }
}

export const roleValidateMiddleware = (minRole?: IUserRole): NavigationGuardWithThis<undefined> => {
  return async (_to, _from, next) => {
    const sessionStore = useSessionStore();

    if (minRole && !validateUserRole(sessionStore.role, minRole)) {
      next('/403');
    }

    next();
  }
}

export function validateUserRole(role: IUserRole | undefined, minRole: IUserRole): boolean {
  if (!role) {
    return false;
  }

  if (
    role !== 'administrator' &&
    role !== 'controller' &&
    role !== 'guest'
  ) {
    return false;
  }

  if (minRole === 'administrator' && role !== 'administrator') {
    return false;
  }

  if (minRole === 'controller' && role === 'guest') {
    return false;
  }

  return true;
}

export function isServerOffline(error: AxiosError) {
  if (!isAxiosError(error)) {
    return false;
  }

  if (
    error.response
    && error.response.status >= 500
    && error.response.status < 600
  ) {
    return true;
  }

  if (!error.response) {
    return true;
  }

  return false;
}