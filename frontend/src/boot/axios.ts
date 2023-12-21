import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

export const api = axios.create({
  baseURL: 'http://localhost:3333/',
});

export default boot(({ app, router }) => {
  api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('user-token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        sessionStorage.removeItem('user-token');
        router.push('/login');
      }

      return Promise.reject(error);
    },
  );

  app.config.globalProperties.$api = api;
  app.config.globalProperties.$axios = axios;
});
