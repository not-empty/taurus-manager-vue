import { createApp } from 'vue'
import { createPinia } from 'pinia';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';

import 'flowbite';

import 'vue3-toastify/dist/index.css';
import './style.css';
import App from './App.vue';
import router from './router';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(Vue3Toastify, {
  autoClose: 3000,
  dangerouslyHTMLString: true,
  theme: 'colored'
} as ToastContainerOptions);

app.mount('#app')
