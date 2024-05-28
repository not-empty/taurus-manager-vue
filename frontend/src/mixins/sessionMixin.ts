import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import { Api } from 'src/api';

export default function sessionMixin() {
  const router = useRouter();
  const api = new Api();

  async function validateUser() {
    try {
      const response = await api.validate();
      const role = response.role;

      if (
        role !== 'administrator' &&
        role !== 'controller' &&
        role !== 'guest'
      ) {
        const error = 'Invalid Role';
        throw error;
      }

      return role;
    } catch (error) {
      router.push('/403');
    }
  }

  async function validateUserRole(minRole: string) {
    try {
      const response = await api.validate();
      const role = response.role;

      if (role !== 'administrator' && role !== 'controller') {
        const error = 'Invalid Role';
        throw error;
      }

      if (minRole === 'administrator' && role !== 'administrator') {
        const error = 'Invalid Role';
        throw error;
      }

      if (minRole === 'controller' && role === 'guest') {
        const error = 'Invalid Role';
        throw error;
      }

      return role;
    } catch (error) {
      router.push('/403');
    }
  }

  function checkPermission(
    userRole: string,
    requiredRole: string
  ): boolean {
    if (userRole === 'administrator') {
      return true;
    }

    if (requiredRole === 'controller') {
      return userRole !== 'guest';
    }

    if (requiredRole === 'administrator') {
      return userRole === 'administrator';
    }

    return false;
  }

  function logoff() {
    Cookies.remove('isLogged');
    router.push('/login');
  }

  return {
    validateUser,
    validateUserRole,
    checkPermission,
    logoff,
  }
}
