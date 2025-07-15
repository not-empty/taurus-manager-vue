<!-- components/ConfirmModal.vue -->
<template>
  <TransitionRoot appear :show="visible" as="template">
    <Dialog as="div" @close="cancel" class="relative z-50">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
        leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95">
          <DialogPanel
            class="w-full max-w-md transform overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <DialogTitle class="text-lg font-medium text-gray-900 dark:text-white">
              {{ title }}
            </DialogTitle>

            <div class="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {{ message }}
            </div>

            <div class="mt-4 flex justify-end gap-3">
              <button
                class="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-white dark:bg-gray-600 dark:hover:bg-gray-500"
                @click="cancel">
                {{ cancelBtnText }}
              </button>
              <button class="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700" @click="confirm">
                {{ confirmBtnText }}
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';
import { ref } from 'vue';

export interface Props {
  title: string;
  message: string;
  resolve: (value: boolean) => void;
  confirmBtnText?: string;
  cancelBtnText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  confirmBtnText: 'Ok',
  cancelBtnText: 'Cancel',
});

const visible = ref(true);

function confirm() {
  visible.value = false;
  props.resolve(true);
}

function cancel() {
  visible.value = false;
  props.resolve(false);
}
</script>
