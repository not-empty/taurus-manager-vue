<template>
  <div class="flex flex-col justify-start gap-6 mb-5">
    <Breadcrumb />
    <div class="flex flex-row justify-between">
      <fwb-input v-model="filter" placeholder="Filter in queues" class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
        <template #prefix>
          <i class="ph ph-magnifying-glass text-xl"></i>
        </template>
      </fwb-input>
      <div class="flex items-center gap-3">
        <fwb-button color="dark" :onclick="fetchRows" class="cursor-pointer">
          <div class="flex items-center gap-2">
            <i class="ph ph-bold ph-arrow-clockwise"></i>
            Refresh
          </div>
        </fwb-button>
        <fwb-button v-if="hasMinRole('controller')" :onclick="pauseSelected" class="cursor-pointer pause-btn">
          <div class="flex items-center gap-2">
            <i class="ph ph-fill ph-pause"></i>
            Pause
          </div>
        </fwb-button>
        <fwb-button v-if="hasMinRole('controller')" color="green" :onclick="resumeSelected" class="cursor-pointer resume-btn">
          <div class="flex items-center gap-2">
            <i class="ph-fill ph-play"></i>
            Resume
          </div>
        </fwb-button>
      </div>
    </div>
  </div>

  <div v-for="group in filteredGroups" :key="group.group.id">
    <div v-if="group.queues.length > 0" class="flex items-center py-4 gap-2 text-xl cursor-pointer"
      @click="openGroup(group.group.id)">
      <i class="ph-grid-four ph-fill"></i>
      {{ group.queues?.[0]?.group?.name }}
    </div>
    <TableData :loading="loading" v-if="group.queues.length > 0" :selectable="hasMinRole('controller')" :columns="columns"
      :data="group.queues" @update:selected="rows => selected = rows" @row-click="onRowClick">
      <template v-slot:body-cell-healthValue="{ row }">
        <fwb-badge :type="calculateHealthColor(row.healthValue, row.jobCounts.waiting, row.jobCounts.paused)"
          class="rounded-full">Max {{ row.healthValue }}</fwb-badge>
      </template>
      <template v-slot:body-cell-status="{ row }">
        <fwb-badge v-if="row.status === 'running'" type="green" class="rounded-full">Running</fwb-badge>
        <fwb-badge v-if="row.status === 'paused'" type="yellow" class="rounded-full">Paused</fwb-badge>
        <fwb-badge v-if="row.status === 'unavailable'" type="red" class="rounded-full">Unavailable</fwb-badge>
      </template>
    </TableData>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { AxiosError } from 'axios';
import { calculateHealthColor } from '@/utils/colors';
import { FwbButton, FwbInput, FwbBadge } from 'flowbite-vue';
import { onMounted, computed, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { useConfirmModal } from '@/composables/useConfirmModal';
import { usePermission } from '@/composables/permission';
import { useRouter } from 'vue-router';

import Breadcrumb from '@/components/layout/Breadcrumb.vue';
import TableData from '@/components/table/TableData.vue';

import type { ErrorRequest } from '@/types';
import type { IDashboardResponse } from '@/types/group';
import type { IQueueDash } from '@/types/queues';
import type { TableColumn } from '@/components/table/TableData.vue';

const api = new Api();
const confirm = useConfirmModal();
const router = useRouter();

const loading = ref(false);
const groups = ref<IDashboardResponse[]>();
const currentAction = ref<'resume' | 'pause'>('pause');
const filter = ref<string>('');
const selected = ref<IQueueDash[]>([]);
const { hasMinRole } = usePermission();

const columns: TableColumn<IQueueDash>[] = [
  {
    name: 'healthValue',
    align: 'center',
    label: 'Health',
    field: 'healthValue',
    sortable: true,
    icon: 'heart-straight ph-fill',
  },
  {
    name: 'name',
    align: 'center',
    label: 'Name',
    field: 'name',
    sortable: true,
    icon: 'browsers ph-fill',
    width: '20em',
    minWidth: '20em',
    maxWidth: '20em',
  },
  {
    name: 'waiting',
    align: 'center',
    label: 'Waiting',
    field: (row: IQueueDash) => row.jobCounts.waiting.toString(),
    sortable: true,
    onClick: (row) => onRowClickType(row.id, 'waiting'),
    icon: 'dots-three-circle'
  },
  {
    name: 'paused',
    align: 'center',
    label: 'Paused',
    field: (row: IQueueDash) => row.jobCounts.paused.toString(),
    sortable: true,
    onClick: (row) => onRowClickType(row.id, 'paused'),
    icon: 'pause-circle'
  },
  {
    name: 'active',
    align: 'center',
    label: 'Active',
    field: (row: IQueueDash) => row.jobCounts.active.toString(),
    sortable: true,
    onClick: (row) => onRowClickType(row.id, 'active'),
    icon: 'play-circle'
  },
  {
    name: 'delayed',
    align: 'center',
    label: 'Delayed',
    field: (row: IQueueDash) => row.jobCounts.delayed.toString(),
    sortable: true,
    onClick: (row) => onRowClickType(row.id, 'delayed'),
    icon: 'clock-clockwise'
  },
  {
    name: 'failed',
    align: 'center',
    label: 'Failed',
    field: (row: IQueueDash) => row.jobCounts.failed.toString(),
    sortable: true,
    onClick: (row) => onRowClickType(row.id, 'failed'),
    icon: 'warning-octagon'
  },
  {
    name: 'status',
    align: 'center',
    label: 'Status',
    sortable: true,
    icon: 'question',
    field: 'status'
  }
];

const filteredGroups = computed(() => {
  if (!groups.value) {
    return [];
  }

  if (!filter.value) {
    return groups.value;
  }

  return groups.value.map((group) => {
    return {
      ...group,
      queues: group.queues.filter((queue) => {
        return queue.name
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      })
    };
  })
    .filter((group) => group.queues.length > 0);
});

onMounted(async () => {
  await fetchRows();
});

async function fetchRows() {
  loading.value = true;
  try {
    const response = await api.group.getDashboard();
    groups.value = response;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  } finally {
    loading.value = false;
  }
}

async function confirmAction() {
  try {
    const selectedIds = selected.value.map((item) => item.id);
    const uniqueIds = [...new Set(selectedIds)];

    let data = { ids: uniqueIds };

    await api.queue.chageQueueStatus(currentAction.value, data);

    toast.success(`<span class="nofification">Itens successfuly ${currentAction.value}d.</sapn>`);
    await fetchRows();
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

function openGroup(id: string) {
  router.push(`/group/${id}`);
}

async function pauseSelected() {
  if (selected.value.length <= 0) return;

  currentAction.value = 'pause';

  const res = await confirm('', `Are you sure you want to pause the selected items?`)
  if (!res) return;

  await confirmAction();
}

async function resumeSelected() {
  if (selected.value.length <= 0) return;

  currentAction.value = 'resume';

  const res = await confirm('', `Are you sure you want to resume the selected items?`)
  if (!res) return;

  await confirmAction();
}

function onRowClick(row: IQueueDash) {
  router.push(`/queue/${row.id}`);
}

function onRowClickType(id: string, type: string) {
  router.push(`/queue/${id}?type=${type}`);
}
</script>
