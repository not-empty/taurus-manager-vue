<template>
  <aside :class="[
    'bg-neutral-900 text-white transition-all duration-300 h-full overflow-x-hidden',
    collapsed ? 'w-16' : 'w-64'
  ]">
    <nav class="space-y-2">
      <slot />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const collapsed = inject('collapsed');
</script>