
import { Plugin } from '@nuxt/types';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { Api } from '~/services/api';

declare module 'vue/types/vue' {
  interface Vue {
    $api: Api
  }
}

const api: Plugin = (context, inject) => {
  const api = new Api(context.$axios);
  api.setInterceptorResponseError((error: AxiosError) => {
    if (
      context.store.state.auth.user.role === 'administrator' &&
      error.response?.status === 500
    ) {
      const erro = error.response.data?.error;
      if (erro && erro.code === 'ECONNREFUSED') {
        context.redirect('/queue');
        alert('possivel erro no url do redis ou redis offline');
        return Promise.resolve(error);
      }
    }

    if (error.response?.status === 401) {
      context.store.dispatch('auth/removeSession');
      context.redirect('/');
    }

    return Promise.reject(error);
  });

  api.setInterceptorRequest((config: AxiosRequestConfig) => {
    config.headers.Authorization = `Bearer ${context.store.state.auth.token}`;
    return config;
  });

  inject('api', api);
};

export default api;
