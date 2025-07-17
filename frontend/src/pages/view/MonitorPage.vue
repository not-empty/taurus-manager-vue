<template>
  <div class="flex flex-col justify-start gap-6">
    <div class="text-2xl flex items-center justify-start gap-2 py-1">
      <i class="ph ph-heartbeat"></i>
      <span>Monitor</span>
    </div>
    <p class="text-sm text-gray-400">
      Only shows queues that are out of normal health according to the configured healthValue.
      <i v-if="showSpinner" class="ph ph-spinner animate-spin ml-2"></i>
    </p>

    <div class="flex justify-between items-center mb-4">
      <Input v-model="filter" placeholder="Filter in queues names" icon="search" class="w-80" />

      <div class="flex items-center gap-3">
        <template v-if="hasMinRole('controller')">
        <fwb-checkbox class="cursor-pointer mr-0" v-model="selectAll" @change="toggleSelectAll(($event.target as HTMLInputElement).checked)" />
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
        <div class="rounded-lg border border-solid border-neutral-600 p-4 shadow-md bg-neutral-900 text-white hover:bg-neutral-800 transition-all"
          :class="{ 'ring-2 ring-green-500': isSelected(queue.id) }">
          <div class="flex items-center justify-between mb-4">
            <template v-if="hasMinRole('controller')">
              <fwb-checkbox class="cursor-pointer" :model-value="isSelected(queue.id)" @change="toggleSelection(queue.id)" />
              <label class="ml-2 font-bold text-2xl ">{{ queue.name }}</label>
            </template>
            <template v-else>
              <div class="font-bold text-lg">{{ queue.name }}</div>
            </template>
          </div>

          <div class="flex items-center gap-2 mb-4 text-xl">
            <i class="ph ph-table"></i>
            {{ queue.group.name }}
          </div>

          <div class="flex flex-wrap gap-2 mb-2 text-sm">
            <fwb-badge :type="calculateHealthColor(queue.healthValue, queue.jobCounts.waiting, queue.jobCounts.paused)"
              class="rounded-full">Max {{ queue.healthValue }}</fwb-badge>

            <fwb-badge v-if="queue.status === 'running'" type="green" class="rounded-full">Running</fwb-badge>
            <fwb-badge v-if="queue.status === 'paused'" type="yellow" class="rounded-full">Paused</fwb-badge>
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
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { calculateHealthColor, calculateProgress } from '@/utils/colors';
import { FwbButton, FwbBadge, FwbCheckbox } from 'flowbite-vue';
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { toast } from 'vue3-toastify';
import { useConfirmModal } from '@/composables/useConfirmModal';
import { usePermission } from '@/composables/permission';

import Input from '@/components/ui/Input.vue';

import type { AxiosError } from 'axios';
import type { ErrorRequest } from '@/types';
import type { IQueueDash } from '@/types/queues';

const api = new Api();
const confirm = useConfirmModal();
const { hasMinRole } = usePermission();

const showSpinner = ref(false);
const currentAction = ref<'pause' | 'resume'>('pause');
const filter = ref('');
const queues = ref<IQueueDash[]>([]);
const selectedQueues = ref<string[]>([]);
const selectAll = ref<boolean>(false);
const autoRefresh = ref(false);
const autoRefreshIntervalId = ref<number | null>(null);

onMounted(async () => {
  await fetchRows();
});

onUnmounted(() => stopAutoRefresh());

const filteredQueues = computed(() => {
  if (!filter.value) return queues.value;
  return queues.value.filter((q) => q.name.toLowerCase().includes(filter.value.toLowerCase()));
});

watch(filteredQueues, (filtered) => {
  const allSelected = filtered.every(q => selectedQueues.value.includes(q.id));
  const anySelected = filtered.some(q => selectedQueues.value.includes(q.id));
  selectAll.value = allSelected ? true : anySelected ? false : false;
}, { deep: true });

async function fetchRows() {
  showSpinner.value = true;
  try {
    const response = await api.group.getGroupMonitor();
    queues.value = response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(error.response?.data?.message || 'Error fetching data.');
  } finally {
    setTimeout(() => { showSpinner.value = false }, 2000);
  }
}

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

function isSelected(id: string) {
  return selectedQueues.value.includes(id);
}

function toggleSelection(id: string) {
  const i = selectedQueues.value.indexOf(id);
  i === -1 ? selectedQueues.value.push(id) : selectedQueues.value.splice(i, 1);
  selectAll.value = queues.value.length === selectedQueues.value.length;
}

function toggleSelectAll(value: boolean) {
  selectedQueues.value = value ? filteredQueues.value.map(q => q.id) : [];
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

async function confirmAction() {
  try {
    await api.queue.chageQueueStatus(currentAction.value, { ids: [...new Set(selectedQueues.value)] });
    clearSelection();
    await fetchRows();
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(error.response?.data?.message || 'Action failed.');
  }
}

function clearSelection() {
  selectedQueues.value = [];
  selectAll.value = false;
}
</script>
