import { Api } from "~/services/api"

import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $api: Api
  }
}

const api: Plugin = (context, inject) => {
  const api = new Api(context.$axios)
  api.setInterceptorResponseError(function (error: any) {
    if(context.store.state.auth.user.role == 'Administrator') {
      context.redirect('/queue');
      alert('possivel erro no url do redis ou redis offline');
      return Promise.resolve(error);
    }
    context.store.dispatch('auth/removeSession')
    context.redirect('/')
    return Promise.reject(error);
  })

  api.setInterceptorRequest((config: any) => {
    config.headers.Authorization = `Bearer ${context.store.state.auth.token}`
    return config
  })

  inject('api', api)
}

export default api