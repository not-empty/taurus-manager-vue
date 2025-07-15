<template>
  <div class="mb-5">
    <label v-if="label" :for="name" class="block mb-2 text-sm font-medium text-gray-900 text-start dark:text-white">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :name="name"
      :id="name"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      :required="required"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number;
  type?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  label?: string;
}

defineProps<Props>();

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();
</script>