<template>
  <Breadcrumb :group="group" class="mb-6" />
  <div class="flex justify-between items-center mb-6">
    <fwb-input v-model="filter" placeholder="Filter in queues">
      <template #prefix>
        <i class="ph ph-magnifying-glass text-xl"></i>
      </template>
    </fwb-input>

    <div class="flex items-center gap-3">
      <template v-if="hasMinRole('controller')">
        <input type="checkbox" :checked="selectAll"
          @change="toggleSelectAll(($event.target as HTMLInputElement).checked)" />
        <label class="text-white mr-4">Select All</label>

        <fwb-button @click="pauseSelected" :disabled="selectedQueues.length === 0" class="pause-btn">Pause</fwb-button>
        <fwb-button @click="resumeSelected" :disabled="selectedQueues.length === 0" class="resume-btn">Resume</fwb-button>
      </template>

      <fwb-button color="dark" @click="fetchRows" v-if="!autoRefresh">
        <i class="ph ph-refresh mr-1"></i> Refresh
      </fwb-button>

      <fwb-button :color="autoRefresh ? 'yellow' : 'dark'" @click="toggleAutoRefresh">
        <i class="ph ph-autorenew mr-1"></i> Auto-Refresh
      </fwb-button>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="queue in filteredQueues" :key="queue.id">
      <div class="rounded-lg border p-4 shadow-md bg-neutral-900 text-white hover:bg-neutral-800 transition-all"
        :class="{ 'ring-2 ring-green-500': isSelected(queue.id) }">
        <div class="flex items-center justify-between mb-4">
          <template v-if="hasMinRole('controller')">
            <fwb-checkbox class="cursor-pointer" :value="isSelected(queue.id)" @change="toggleSelection(queue.id)" />
            <label class="ml-2 font-bold text-2xl ">{{ queue.name }}</label>
          </template>
          <template v-else>
            <div class="font-bold text-lg">{{ queue.name }}</div>
          </template>
        </div>
        <div class="flex flex-wrap gap-2 mb-4 text-sm">
          <fwb-badge :type="calculateHealthColor(queue.healthValue, queue.jobCounts.waiting, queue.jobCounts.paused)"
            class="rounded-full">Max {{ queue.healthValue }}</fwb-badge>

          <fwb-badge v-if="queue.status === 'running'" type="green" class="rounded-full">Running</fwb-badge>
          <fwb-badge v-if="queue.status === 'paused'" type="yellow" class="rounded-full">Paused</fwb-badge>
          <fwb-badge v-if="queue.status === 'unavailable'" type="red" class="rounded-full">Unavailable</fwb-badge>
        </div>

        <div class="text-xs space-y-1">
          <div class="flex justify-between"><span class="flex items-center gap-1 text-lg">
              <i class="ph ph-dots-three-circle"></i>
              Waiting:</span><span class="text-lg">{{ queue.jobCounts.waiting }}</span>
          </div>
          <div class="flex justify-between"><span class="flex items-center gap-1 text-lg">
              <i class="ph ph-pause-circle"></i>
              Paused:</span><span class="text-lg">{{ queue.jobCounts.paused }}</span>
          </div>
          <div class="flex justify-between"><span class="flex items-center gap-1 text-lg">
              <i class="ph ph-play-circle"></i>
              Active:</span><span class="text-lg">{{ queue.jobCounts.active }}</span>
          </div>
          <div class="flex justify-between"><span class="flex items-center gap-1 text-lg">
              <i class="ph ph-clock-clockwise"></i>
              Delayed:</span><span class="text-lg">{{ queue.jobCounts.delayed }}</span>
          </div>
          <div class="flex justify-between"><span class="flex items-center gap-1 text-lg">
              <i class="ph ph-warning-octagon"></i>
              Failed:</span><span class="text-lg">{{ queue.jobCounts.failed }}</span>
          </div>
          <div class="flex justify-between"><span class="flex items-center gap-1 text-lg">
              <i class="ph ph-check"></i>
              Completed:</span><span class="text-lg">{{ queue.jobCounts.completed }}</span>
          </div>
        </div>

        <div class="mt-4 mb-4 flex justify-end">
          <RouterLink :to="`/queue/${queue.id}`">
            <fwb-button size="sm" color="dark" class="cursor-pointer">
              <i class="ph ph-info mr-1"></i> Details
            </fwb-button>
          </RouterLink>
        </div>

        <div class="mt-2">
          <div class="w-full bg-neutral-700 h-2 rounded overflow-hidden">
            <div class="h-full"
              :class="`bg-${calculateHealthColor(queue.healthValue, queue.jobCounts.waiting, queue.jobCounts.paused)}-600`"
              :style="{ width: `${calculateProgress(queue.healthValue, queue.jobCounts.waiting, queue.jobCounts.paused) * 100}%` }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { AxiosError } from 'axios';
import { calculateHealthColor, calculateProgress } from '@/utils/colors';
import { computed, onMounted, ref, watch } from 'vue';
import { FwbButton, FwbBadge, FwbCheckbox, FwbInput } from 'flowbite-vue';
import { toast } from 'vue3-toastify';
import { useConfirmModal } from '@/composables/useConfirmModal';
import { usePermission } from '@/composables/permission';
import { useRoute } from 'vue-router';

import Breadcrumb from '@/components/layout/Breadcrumb.vue';

import type { ErrorRequest } from '@/types';
import type { IGroup } from '@/types/group';
import type { IQueueDash } from '@/types/queues';

const api = new Api();
const { hasMinRole } = usePermission();
const confirm = useConfirmModal();


const route = useRoute();

const showSpinner = ref(false);
const autoRefresh = ref(false);
const autoRefreshIntervalId = ref<number | null>(null);

const filter = ref<string>('');
const currentAction = ref<'resume' | 'pause'>('pause');
const selectAll = ref<boolean>(false);

const groupId = ref<string>('');
const group = ref<IGroup>();
const queues = ref<IQueueDash[]>();

const selectedQueues = ref<string[]>([]);
const showDialogActionConfirm = ref<boolean>(false);

onMounted(async () => {
  groupId.value = String(route.params?.id || '');
  await fetchRows();
});

const filteredQueues = computed(() => {
  if (!filter.value) {
    return queues.value;
  }

  const filterLower = filter.value.toLowerCase();
  return queues.value?.filter((queue) =>
    queue.name.toLowerCase().includes(filterLower)
  );
});

watch(() => selectedQueues.value, () => {
  const allSelected = queues.value?.every((queue) =>
    selectedQueues.value.includes(queue.id)
  );

  selectAll.value = allSelected ? true : false;
}, {
  deep: true,
  immediate: true
});

watch(() => filteredQueues.value, (filtered) => {
  const allSelected = filtered?.every((queue) => queue.selected);

  selectAll.value = allSelected ? true : false;
}, {
  deep: true,
  immediate: true
});

function startAutoRefresh() {
  autoRefreshIntervalId.value = setInterval(fetchRows, 30000);
}

function stopAutoRefresh() {
  if (autoRefreshIntervalId.value) clearInterval(autoRefreshIntervalId.value);
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value;
  autoRefresh.value ? startAutoRefresh() : stopAutoRefresh();
}

async function fetchRows() {
  try {
    showSpinner.value = true;

    const response = await api.group.getDashboardByGroupId(groupId.value);

    group.value = response.group;
    queues.value = response.queues;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;

    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' +
        error.response.data.message +
        '</span>'
        : 'There was an error processing your request.',
    );
  } finally {
    setTimeout(() => { showSpinner.value = false }, 2000);
  }
}

async function confirmAction() {
  try {
    const selectedIds = selectedQueues.value.map((item) => item);
    const uniqueIds = [...new Set(selectedIds)];

    let data = {
      ids: uniqueIds
    };

    await api.queue.chageQueueStatus(
      currentAction.value,
      data,
    );

    clearSelection();
    await fetchRows();
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' +
        error.response.data.message +
        '</span>'
        : 'There was an error processing your request.',
    );
  } finally {
    showDialogActionConfirm.value = false;
  }
}

function clearSelection() {
  selectedQueues.value = [];
  selectAll.value = false;
}

async function pauseSelected() {
  if (selectedQueues.value.length <= 0) return;

  const res = await confirm('', 'Are you sure?');
  if (!res) return;

  currentAction.value = 'pause';
  await confirmAction();
}

async function resumeSelected() {
  if (selectedQueues.value.length <= 0) return;

  const res = await confirm('', 'Are you sure?');
  if (!res) return;

  currentAction.value = 'resume';
  await confirmAction();
}

function isSelected(queueId: string) {
  return selectedQueues.value.includes(queueId);
}

function toggleSelectAll(value: boolean | null) {
  if (!value) {
    selectedQueues.value = [];
    return;
  }

  const filteredIds = filteredQueues.value?.map((queue) => queue.id);
  selectedQueues.value = [...new Set(filteredIds)];
  return;
}

function toggleSelection(queueId: string) {
  const index = selectedQueues.value.indexOf(queueId);
  if (index === -1) {
    selectedQueues.value.push(queueId);
  } else {
    selectedQueues.value.splice(index, 1);
  }
  selectAll.value = queues.value?.length === selectedQueues.value.length;
}
</script>
