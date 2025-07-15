<template>
  <label v-if="label" :for="name" class="block mb-2 text-sm text-start font-medium text-gray-900 dark:text-white"> {{ label }}</label>
  <select
    :value="modelValue"
    @change="onChange"
    :name="name"
    :id="name"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    v-bind="$attrs"
  >
    <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

export type SelectOption = {
  label: string
  value: string | number
}

defineProps<{
  modelValue: string | number
  options: SelectOption[]
  name?: string
  placeholder?: string
  label?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>