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
    context.store.dispatch('auth/removeSession')
    context.redirect('/')
    return Promise.reject(error);
  })

  api.setInterceptorRequest((config: any) => {
    console.log(context.store.state)
    config.headers.Authorization = `Bearer ${context.store.state.auth.token}`
    return config
  })

  inject('api', api)
}

export default api