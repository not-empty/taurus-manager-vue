<template>
  <fwb-breadcrumb>
    <fwb-breadcrumb-item home href="/" class="">
      <template #home-icon>
        <i class="ph ph-projector-screen text-lg text-white mr-2" />
      </template>
      <span class="text-lg text-white">Dashboard</span>
    </fwb-breadcrumb-item>
    <fwb-breadcrumb-item v-if="group" :href="`/group/${group.id}`" >
      <span class="text-lg text-white">
        <i class="ph ph-grid-four ph-fill mr-2" />
        {{ group.name }}
      </span>
    </fwb-breadcrumb-item>
    <fwb-breadcrumb-item v-if="queue" :href="`/queue/${queue.id}`" >
      <span class="text-lg text-white">
        <i class="ph ph-queue mr-2" />
        {{ queue.name }}
      </span>
    </fwb-breadcrumb-item>
  </fwb-breadcrumb>
</template>

<script setup lang="ts">
import {  FwbBreadcrumb, FwbBreadcrumbItem } from 'flowbite-vue';

import type { IGroup } from '@/types/group';
import type { IQueue } from '@/types/queues';

interface Props {
  group?: IGroup;
  queue?: IQueue;
}

defineProps<Props>();

</script>