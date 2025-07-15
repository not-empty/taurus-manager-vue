<template>
  <section class="bg-gray-50 dark:bg-gray-900 h-full w-full">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto h-full w-full">
      <div
        class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <div class="flex justify-center items-center">
            <img class="w-32 h-32 mr-2" src="/taurus.svg" alt="logo">
          </div>
          <form class="space-y-4 md:space-y-6" action="#" @submit="handleLogin">
            <div>
              <label for="login" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Login</label>
              <input type="text" name="login" id="login" v-model="login"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Login" required=true>
            </div>
            <div>
              <label for="password"
                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input type="password" name="password" v-model="password" id="password" placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required=true>
            </div>
            <button type="submit"
              class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { nextTick, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';

import Cookies from 'js-cookie';

const api = new Api();

const router = useRouter();

const login = ref<string>('');
const password = ref<string>('');
const shakeError = ref<boolean>(false);

const loginInput = ref();

async function handleLogin(event: Event) {
  event.stopPropagation();
  event.preventDefault();

  shakeError.value = false;

  if (!login.value || !password.value) {
    toast.warn('All fields are required.');
    nextTick(() => {
      shakeError.value = true;
    });

    loginInput.value.focus();
    return;
  }

  const res = await api.loginAuth(login.value, password.value);
  if (!res) {
    nextTick(() => {
      shakeError.value = true;
    });

    toast.error('Incorrect login or password');

    login.value = '';
    password.value = '';

    loginInput.value.focus();

    setTimeout(() => {
      shakeError.value = false;
    }, 500);
    return;
  }

  const expires = new Date(new Date().getTime() + 8 * 60 * 59 * 1000);
  Cookies.set('isLogged', 'true', { expires });

  router.push('/');
}
</script>
