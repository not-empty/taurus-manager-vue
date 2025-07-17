import { useSessionStore } from '@/stores/session';
import type { IUserRole } from '@/types/user';

export function usePermission() {
  const user = useSessionStore();

  const hasRole = (role: IUserRole) => {
    return user?.role === role
  }

  const hasMinRole = (required: IUserRole) => {
    if (!user.role) {
      return false;
    }

    if (user.role === 'administrator') {
      return true;
    }
  
    if (required === 'controller') {
      return user.role !== 'guest';
    }

    return false;
  }


  return {
    hasRole,
    hasMinRole,
  }
}