import { boot } from 'quasar/wrappers';
import axios from 'axios';
import Cookies from 'js-cookie';

export default boot(({ router }) => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = `${process.env.VUE_APP_API_URL}/`;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        Cookies.remove('isLogged');
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );
});
