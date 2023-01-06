import { NuxtConfig } from '@nuxt/types';

const config: NuxtConfig = {
  ssr: false,
  target: 'static',
  head: {
    titleTemplate: '%s - Queue controller',
    title: 'Horus',
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
  css: ['~/assets/main.scss'],
  components: true,
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    '@nuxtjs/eslint-module'
  ],
  typescript: {
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}'
      }
    }
  },
  modules: [
    '@nuxtjs/axios'
  ],
  plugins: ['~/plugins/axios.ts'],
  axios: {
    baseURL: process.env.BACKEND_URL
  },
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#ffffff',
          accent: '#1E1F24',
          secondary: '#db1e72',
          info: '#25262c',
          warning: '#FFC107',
          error: '#DD2C00',
          success: '#00E676'
        }
      }
    }
  },
  build: {
    postcss: false
  }
};

export default config;
