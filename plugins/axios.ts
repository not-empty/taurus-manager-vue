import Vue from 'vue'
import { Api } from "~/services/api"

declare module 'vue/types/vue' {
  interface Vue {
    $api: Api
  }
}

const axios = Vue.prototype.$axios;
Vue.prototype.$api = new Api(axios)