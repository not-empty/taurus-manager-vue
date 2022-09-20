import { Api } from "~/services/api"

import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $api: Api
  }
}

const api: Plugin = (context, inject) => {
  const api = new Api(context.$axios)
  inject('api', api)
}

export default api