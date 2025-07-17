import type { IUserValidate } from '@/types/user';
import { defineStore } from 'pinia';

interface SessionStore {
  user: IUserValidate | null;
}

export const useSessionStore = defineStore('sessionStore', {
  state: (): SessionStore => ({
    user: null,
  }),
  actions: {
    setUser(user: IUserValidate) {
      this.user = { ...user };
    },
    logout() {
      this.user = null;
    },
  },
  getters: {
    role(state): "controller" | "administrator" | "guest" | undefined {
      return state.user?.role;
    },
    userId(state): string | undefined {
      return state.user?.id;
    },
  }
});
