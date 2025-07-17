<template>
  <div class="mb-5">
    <label v-if="label" :for="name" class="block mb-2 text-sm font-medium text-start text-white">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :name="name"
      :id="name"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="border text-sm rounded-lg block w-full p-2.5 bg-neutral-700 border-neutral-600 placeholder-neutral-400 text-white focus:ring-blue-500 focus:border-blue-500"
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