<template>
  <header class="bg-black text-white flex items-center justify-start gap-4 py-2 h-16">
    <button @click="collapsed = !collapsed" class="hover:text-shadow-white cursor-pointer w-16 flex justify-center items-center">
      <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" fill-rule="evenodd"
          d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z">
        </path>
      </svg>
    </button>
    <router-link to="/" class="flex items-center gap-2 no-underline cursor-pointer">
      <img class="w-8 h-8" src="/taurus.svg" alt="logo">
      <h1 class="text-xl font-bold">Taurus Manager</h1>
    </router-link>
  </header>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { RouterLink } from 'vue-router';

const collapsed = inject('collapsed');
</script>
