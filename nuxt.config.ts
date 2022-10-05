import { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
  ssr: false,
  target: 'static',
  head: {
    titleTemplate: '%s - constellation-front',
    title: 'constellation-front',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  components: true,
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
  ],
  modules: [
    '@nuxtjs/axios',
  ],
  plugins: ['~/plugins/axios.ts'],
  axios: {
    baseURL: process.env.BACKEND_URL,
  },
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: "#616161",
          accent: "#424242",
          secondary: "#FF8F00",
          info: "#26A69A",
          warning: "#FFC107",
          error: "#DD2C00",
          success: "#00E676"
        }
      }
    }
  },
  build: {
    postcss: false,
  }
}

export default config
