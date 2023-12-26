import axios from 'axios';

export default {
  methods: {
    async validateUser() {
      try {
        const response = await axios.post('user/validate');
        const role = response.data.role;
        if (role !== 'administrator' && role !== 'controller' && role !== 'guest') {
          const error = 'Invalid Role';
          throw error;      
        }
        return role;
      } catch (error) {
        this.$router.push('/403');
      }
    },
    async validateUserRole(minRole) {
      try {
        const response = await axios.post('user/validate');
        const role = response.data.role;
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
        this.$router.push('/403');
      }
    },
    checkPermission(
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
  }
}
