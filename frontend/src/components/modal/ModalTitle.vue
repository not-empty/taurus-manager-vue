<template>
  <DialogTitle class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
        <slot />
      </h3>
      <button v-if="onClose" @click="onClose" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
          <span class="sr-only">Close modal</span>
      </button>
  </DialogTitle>
</template>

<script setup lang="ts">
import {
  DialogTitle,
} from '@headlessui/vue';

interface Props {
  onClose?: () => void;
}

defineProps<Props>();

</script>
