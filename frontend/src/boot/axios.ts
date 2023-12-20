import { boot } from 'quasar/wrappers';
import axios from 'axios';

export default boot(({ router }) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        sessionStorage.removeItem('user-token');
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );
});
