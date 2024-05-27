<template>
  <q-page padding>
    <q-dialog v-model="showDialogActionConfirm" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">
            Are you sure you want to {{ currentAction }} the selected items?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat :label="currentAction" :color="calculateActionColor(currentAction)" @click="confirmAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el class="breadcrumb-white" label="Monitor" icon="monitor_heart" />
      </q-breadcrumbs>

      <div class="text-h7">
        only shows queues that are out of normal health according to the configured healthValue.
        <q-spinner v-if="showSpinner" color="primary" class="q-ml-lg" size="1.2em" />
      </div>
    </div>
    <div class="q-gutter-md" style="display: flex; justify-content: space-between; align-items: center">
      <q-input outlined v-model="filter" placeholder="Filter in queues names" style="max-width: 300px" autofocus>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div>
        <q-checkbox label="Select All" v-model="selectAll" @update:model-value="toggleSelectAll"
          v-if="checkPermission(role, 'controller')" class="q-mr-xl" />
        <q-btn flat label="Pause" icon="pause" color="primary" v-if="checkPermission(role, 'controller')"
          :disabled="selectedQueues.length === 0" @click="pauseSelected" />
        <q-btn flat label="Resume" icon="play_arrow" color="primary" class="q-mr-lg"
          v-if="checkPermission(role, 'controller')" :disabled="selectedQueues.length === 0" @click="resumeSelected" />
        <q-btn flat label="Refresh" icon="refresh" v-if="autoRefresh === false" color="white" @click="fetchRows" />
        <q-btn flat label="Auto-Refresh" icon="autorenew" :color="autoRefresh ? 'yellow' : 'white'"
          @click="toggleAutoRefresh" />
      </div>
    </div>
    <br />
    <div class="row q-col-gutter-md">
      <div v-for="queue in filteredQueues" :key="queue.id" class="col-12 col-md-4 col-lg-2">
        <q-card :class="{ 'selected-card': isSelected(queue.id) }"
          :to="{ name: 'queueDetail', params: { queueName: queue.id } }">
          <q-card-section class="row items-center">
            <div class="row">
              <div class="col-12 flex">
                <q-checkbox v-if="checkPermission(role, 'controller')" :model-value="isSelected(queue.id)"
                  @update:model-value="toggleSelection(queue.id)" :label="queue.name" class="custom-checkbox" />
                <div class="text-h6" v-if="!checkPermission(role, 'controller')">
                  {{ queue.name }}
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="row items-center">
            <div class="row">
              <div class="col-12 flex">
                <q-icon name="table_view" size="1.5em" class="q-mr-md" />
                <span>{{ queue.group.name }}</span>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="row items-center">
            <div class="row">
              <div class="col-12 flex">
                <q-badge rounded :color="calculateHealthColor(
                  queue.healthValue,
                  queue.jobCounts.waiting,
                  queue.jobCounts.paused
                )
                  " :label="queue.healthValue" />
                <q-badge class="q-ml-md" rounded :color="calculateStatusColor(queue.status)" :label="queue.status" />
                <div class="q-ml-md">
                  {{ queue.jobCounts.completed }} completed
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="pending" size="1.5em" class="q-mr-md" />
                <span>Waiting:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.waiting }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="pause_circle" size="1.5em" class="q-mr-md" />
                <span>Paused:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.paused }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="play_circle" size="1.5em" class="q-mr-md" />
                <span>Active:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.active }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="update" size="1.5em" class="q-mr-md" />
                <span>Delayed:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.delayed }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="report" size="1.5em" class="q-mr-md" />
                <span>Error:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.failed }}</span>
              </div>
            </div>
            <div class="row justify-end q-mt-md">
              <q-btn flat label="Details" icon="info" color="white" :to="'/view/queue/' + queue.id" />
            </div>
          </q-card-section>

          <q-linear-progress size="10px"
            :value="calculateProgress(queue.healthValue, queue.jobCounts.waiting, queue.jobCounts.paused)"
            :color="calculateHealthColor(queue.healthValue, queue.jobCounts.waiting, queue.jobCounts.paused)"
            class="q-mt-md" />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios, { AxiosError } from 'axios';
import { Notify } from 'quasar';
import { errorRequest } from 'src/types';
import { Queue } from 'src/types/QueueTypes';
import colorsMixin from 'src/mixins/colorsMixin';
import sessionMixin from 'src/mixins/sessionMixin';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const { calculateHealthColor, calculateStatusColor, calculateActionColor, calculateProgress } = colorsMixin();
const { validateUser, checkPermission } = sessionMixin();

const selectAll = ref<boolean | null>(false);
const selectedQueues = ref<string[]>([]);

const role = ref<string>('');

const currentAction = ref<string>('');

const filter = ref<string>('');
const queues = ref<Queue[]>([]);

const autoRefresh = ref<boolean>(false);
const autoRefreshIntervalId = ref<boolean | null>(null);

const showSpinner = ref<boolean>(false);
const showDialogActionConfirm = ref<boolean>(false);

onMounted(async () => {
  role.value = await validateUser();
  await fetchRows();
});

onUnmounted(() => {
  stopAutoRefresh();
})

const filteredQueues = computed(() => {
  if (!filter.value) {
    return queues.value;
  }

  const filterLower = filter.value.toLowerCase();
  return queues.value.filter((queue) =>
    queue.name.toLowerCase().includes(filterLower)
  );
});

watch(() => selectedQueues.value, () => {
  const allSelected = queues.value.every((queue) =>
    selectedQueues.value.includes(queue.id)
  );

  const anySelected = queues.value.some((queue) =>
    selectedQueues.value.includes(queue.id)
  );

  selectAll.value = allSelected ? true : anySelected ? null : false;
}, {
  deep: true,
  immediate: true,
})

watch(filteredQueues, (filtered) => {
  const allSelected = filtered.every((queue) => queue.selected);
  const anySelected = filtered.some((queue) => queue.selected);
  selectAll.value = allSelected ? true : anySelected ? null : false;
}, {
  deep: true,
  immediate: true,
})

async function fetchRows() {
  showSpinner.value = true;
  try {
    const response = await axios.get<{ queues: Queue[] }>(
      'group/monitor'
    );
    queues.value = response.data.queues;
  } catch (err) {
    const error = err as AxiosError<errorRequest>;

    Notify.create({
      type: 'negative',
      position: 'top',
      message:
        error.response && error.response.data.message
          ? '<span class="nofification">' +
          error.response.data.message +
          '</span>'
          : 'There was an error processing your request.',
      html: true,
      timeout: 2500
    });
  } finally {
    setTimeout(() => {
      showSpinner.value = false;
    }, 2000);
  }
}
function startAutoRefresh() {
  autoRefreshIntervalId.value = setInterval(() => {
    fetchRows();
  }, 30000);
}

function stopAutoRefresh() {
  clearInterval(autoRefreshIntervalId.value);
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value;

  if (autoRefresh.value) {
    startAutoRefresh();
    return;
  }

  stopAutoRefresh();
}

async function confirmAction() {
  try {
    const selectedIds = selectedQueues.value.map((item) => item);
    const uniqueIds = [...new Set(selectedIds)];
    let data = {
      ids: uniqueIds
    };
    await axios.put(
      `queue/${currentAction.value}`,
      data
    );
    clearSelection();
  } catch (err) {
    const error = err as AxiosError<errorRequest>;
    Notify.create({
      type: 'negative',
      position: 'top',
      message:
        error.response && error.response.data.message
          ? '<span class="nofification">' +
          error.response.data.message +
          '</span>'
          : 'There was an error processing your request.',
      html: true,
      timeout: 2500
    });
  }
  await fetchRows();
  showDialogActionConfirm.value = false;
}
function clearSelection() {
  selectedQueues.value = [];
  selectAll.value = false;
}
function pauseSelected() {
  if (selectedQueues.value.length > 0) {
    currentAction.value = 'pause';
    showDialogActionConfirm.value = true;
  }
}
function resumeSelected() {
  if (selectedQueues.value.length > 0) {
    currentAction.value = 'resume';
    showDialogActionConfirm.value = true;
  }
}

function isSelected(queueId: string) {
  return selectedQueues.value.includes(queueId);
}

function toggleSelectAll(value: boolean) {
  if (!value) {
    selectedQueues.value = [];
  }

  const filteredIds = filteredQueues.value.map((queue) => queue.id);
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
  selectAll.value = queues.value.length === selectedQueues.value.length;
}

</script>

<style scoped></style>
