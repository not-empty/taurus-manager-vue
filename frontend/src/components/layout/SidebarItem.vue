<template>
  <router-link class="flex items-center justify-start gap-3 mb-0 hover:bg-neutral-500" :to="to || '#'" >
    <div class="flex items-center justify-start">
      <div class="w-16 text-2xl flex justify-center p-4">
        <i :class="['ph', `ph-${icon}`]"></i>
      </div>
      <span>{{ label }}</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
interface Props {
  to?: string;
  icon: string;
  label: string;
}

defineProps<Props>();
</script>