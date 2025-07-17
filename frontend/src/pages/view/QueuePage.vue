<template>
  <Modal :show="createJobModal" @close="() => (createJobModal = false)">
    <ModalTitle @close="() => (createJobModal = false)">New Job</ModalTitle>

    <ModalBody>
      <textarea v-model="jsonInput"
        class="w-full p-2 border rounded-md text-sm font-mono bg-neutral-800 text-white border-neutral-700"
        rows="10" placeholder='Enter JSON Here'></textarea>
      <p v-if="jsonError" class="text-red-500 text-sm mt-1">{{ jsonError }}</p>
    </ModalBody>

    <ModalFooter>
      <fwb-button @click="() => (createJobModal = false)" color="dark">Cancel</fwb-button>
      <fwb-button @click="createJob" color="green" class="mr-2">Create</fwb-button>
    </ModalFooter>
  </Modal>

  <Modal :show="detailJobModal" @close="() => (detailJobModal = false)">
    <ModalTitle @close="() => (detailJobModal = false)">Job Information</ModalTitle>

    <ModalBody v-if="selectedJob" class="space-y-4 text-sm text-white">
      <div>
        <label class="block text-xs font-medium text-gray-400">ID</label>
        <input type="text"
          class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
          :value="selectedJob.id" readonly />
      </div>

      <div>
        <label class="block text-xs font-mediu text-gray-400">Status</label>
        <input type="text"
          class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
          :value="selectedJob.state" readonly />
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-400">Attempts Made</label>
        <input type="text"
          class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
          :value="selectedJob.attemptsMade" readonly />
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-400">Data</label>
        <textarea
          class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
          :value="JSON.stringify(selectedJob.data, null, 2)" rows="4" readonly></textarea>
      </div>

      <div v-if="selectedJob.failedReason">
        <label class="block text-xs font-medium text-gray-400">Failed Reason</label>
        <textarea
          class="w-full bg-red-950 borderborder-red-700 text-red-400 rounded px-3 py-2"
          :value="selectedJob.failedReason" rows="2" readonly></textarea>
      </div>

      <div v-if="selectedJob.stacktrace">
        <label class="block text-xs font-medium text-gray-400">Trace</label>
        <textarea
          class="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2"
          :value="String(selectedJob.stacktrace)" rows="8" readonly></textarea>
      </div>
    </ModalBody>

    <ModalFooter class="flex justify-between items-center">
      <div class="flex gap-3">
        <fwb-button @click="() => (detailJobModal = false)" color="dark">Cancel</fwb-button>

        <fwb-button v-if="selectedJob && selectedJob.state === 'failed' && hasMinRole('controller')" @click="retryOneJob(selectedJob.id)"
          icon="replay">
          Retry
        </fwb-button>

        <fwb-button v-if="selectedJob && selectedJob.state === 'completed' && hasMinRole('controller')" @click="cloneOneJob(selectedJob.id)"
          icon="content_copy">
          Clone
        </fwb-button>
      </div>
    </ModalFooter>
  </Modal>

  <Breadcrumb :group="group" :queue="dashboard" class="mb-6" />
  <div class="flex">
    <div class="flex flex-auto text-2xl items-center gap-2 py-1">
      <i class="ph ph-queue"></i>
      <span>{{ dashboard?.name || '' }}</span>

      <fwb-badge v-if="dashboard?.status === 'running'" type="green" class="rounded-full">Running</fwb-badge>
      <fwb-badge v-if="dashboard?.status === 'paused'" type="yellow" class="rounded-full">Paused</fwb-badge>
    </div>

    <div class="flex flex-auto items-center justify-end-safe gap-2">
      <fwb-button color="alternative" @click="fetchData()">
        <template #prefix>
          <i class="ph ph-arrow-clockwise"></i>
        </template>
        Refresh
      </fwb-button>

      <fwb-button v-if="hasMinRole('controller')" color="alternative" @click="createJobModal = true">
        <template #prefix>
          <i class="ph ph-plus"></i>
        </template>
        Create Job
      </fwb-button>

      <template v-if="jobState === 'failed' && hasMinRole('controller')">
        <fwb-button @click="retrySelectedJob" class="ml-2">
          <template #prefix>
            <i class="ph ph-arrow-counter-clockwise"></i>
          </template>
          Retry
        </fwb-button>

        <fwb-button v-if="hasMinRole('controller')" @click="retryAllJobs" class="mr-2">
          <template #prefix>
            <i class="ph ph-arrow-u-down-left"></i>
          </template>
          Retry All
        </fwb-button>
      </template>

      <fwb-button v-if="hasMinRole('controller')" @click="chageQueueStatus(dashboard?.status === 'running' ? 'pause' : 'resume')"
        :color="dashboard?.status === 'running' ? 'green' : 'yellow'"
        :class="dashboard?.status === 'paused' ? 'resume-btn' : 'pause-btn'"
        >
        <template #prefix>
          <i class="ph ph-pause"></i>
        </template>
        {{ dashboard?.status === 'running' ? 'Pause' : 'Resume' }}
      </fwb-button>

      <fwb-button v-if="hasMinRole('controller')" color="red" @click="removeJobs">
        <template #prefix>
          <i class="ph ph-trash"></i>
        </template>
        Remove
      </fwb-button>
    </div>
  </div>


  <div v-if="dashboard" class="flex gap-4 flex-wrap mt-4">
    <div class="flex-auto cursor-pointer" v-for="state in jobStates" :key="state" @click="selectJobState(state, 1)">
      <fwb-card :class="[
        '!bg-neutral-800 !border-neutral-700',
        'transition duration-200',
        jobState === state
          ? 'ring-2 ring-blue-500'
          : 'hover:ring-2 hover:ring-gray-600'
      ]">
        <div class="p-5">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-white">
            {{ state }}
          </h5>
          <p class="font-normal text-gray-400">
            {{ dashboard?.jobCounts[state] ?? 0 }}
          </p>
        </div>
      </fwb-card>
    </div>
  </div>

  <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-5">
    <TableData :columns="columns" :data="jobs" :selectable="hasMinRole('controller')" @row-click="openDetailJobModal"
      @update:selected="rows => selectedJobs = rows" />
    <TablePagination :max-visible-pages="5" :page="jobsPaginate.page"
      @load-data="(newPage: number) => selectJobState(jobState, newPage)" :rows-per-page="jobsPaginate.size"
      :rows-number="jobsPaginate.total || 0" />
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { FwbCard, FwbButton, FwbBadge } from 'flowbite-vue';
import { jobStates, type IJob, type IJobState } from '@/types/job';
import { onMounted, ref } from 'vue';
import { useConfirmModal } from '@/composables/useConfirmModal';
import { usePermission } from '@/composables/permission';
import { useRoute } from 'vue-router';

import Breadcrumb from '@/components/layout/Breadcrumb.vue';
import Modal from '@/components/modal/Modal.vue';
import ModalBody from '@/components/modal/ModalBody.vue';
import ModalFooter from '@/components/modal/ModalFooter.vue';
import ModalTitle from '@/components/modal/ModalTitle.vue';
import TableData, { type TableColumn } from '@/components/table/TableData.vue';
import TablePagination from '@/components/table/TablePagination.vue';

import type { IGroup } from '@/types/group';
import type { IQueueDash } from '@/types/queues';
import type { Pagination } from '@/api/types';

const api = new Api();
const route = useRoute();

const createJobModal = ref(false);
const detailJobModal = ref(false);
const jsonInput = ref('')
const jsonError = ref<string | null>(null)

const confirm = useConfirmModal();

const id = ref<string>('');
const jobState = ref<IJobState>('waiting');
const selectedJobs = ref<IJob[]>([]);
const selectedJob = ref<IJob>();

const dashboard = ref<IQueueDash>();
const jobs = ref<IJob[]>([]);
const group = ref<IGroup>();
const { hasMinRole } = usePermission();

const jobsPaginate = ref<Pagination<IJob>>({
  page: 1,
  size: 25,
  total: 25,
  totalPages: 0,
});

const columns: TableColumn<IJob>[] = [
  {
    name: 'id',
    align: 'left',
    label: 'Id',
    field: 'id',
    sortable: false,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'attempts',
    align: 'left',
    label: 'attempts',
    field: (v) => String(v.attemptsMade),
    sortable: true
  },
  {
    name: 'processedAt',
    align: 'left',
    label: 'processedAt',
    field: 'processedAt',
    sortable: true
  },
  {
    name: 'createdAt',
    align: 'left',
    label: 'Created',
    field: 'createdAt',
    sortable: true
  },
];

onMounted(async () => {
  id.value = String(route.params.id);

  jobState.value = route.query.type as IJobState || 'waiting';
  await fetchData();
});

async function fetchData() {
  dashboard.value = await api.queue.getQueueDashboard(id.value);
  group.value = await api.group.getById(dashboard.value.groupId);

  await selectJobState(jobState.value, jobsPaginate.value.page);
}

async function selectJobState(state: IJobState, page: number) {
  jobState.value = state

  const jobRes = await api.queue.getJobPaginated(id.value, {
    page,
    size: jobsPaginate.value.size,
    state,
  });

  jobsPaginate.value = jobRes.pagination,
    jobs.value = jobRes.data;
}

async function removeJobs() {
  if (selectedJobs.value.length <= 0) return;

  const confirmed = await confirm('', 'Are you sure you want to delete all the selected itens?', 'Delete');
  if (!confirmed) return;

  await api.queue.deleteJob(id.value, {
    jobIds: selectedJobs.value.map((selectedJob) => selectedJob.id),
  })

  selectedJobs.value = [];
  await fetchData();
}

async function createJob() {
  try {
    jsonError.value = null
    const parsed = JSON.parse(jsonInput.value)

    await api.queue.createJob(id.value, {
      data: parsed,
    })

    createJobModal.value = false;
    await fetchData();
  } catch (error) {
    jsonError.value = 'Invalid JSON'
  }
}

async function openDetailJobModal(job: IJob) {
  selectedJob.value = await api.queue.getJobById(id.value, job.id);

  selectedJob.value.stacktrace = JSON.stringify(
    selectedJob.value.stacktrace,
    null,
    4
  );

  detailJobModal.value = true;
}

async function retryOneJob(jobId: string) {
  await api.queue.retryAction(id.value, {
    jobIds: [jobId],
  });

  await fetchData();
  detailJobModal.value = false;
}

async function retrySelectedJob() {
  if (selectedJobs.value.length <= 0) return;

  const confirmed = await confirm('', 'Are you sure you want to retry all the selected itens?', 'Confirm');
  if (!confirmed) return;

  await api.queue.retryAction(id.value, {
    jobIds: selectedJobs.value.map((selectedJob) => selectedJob.id),
  });

  await fetchData();
}

async function cloneOneJob(jobId: string) {
  await api.queue.cloneJob(id.value, jobId);

  await fetchData();
  detailJobModal.value = false;
}

async function retryAllJobs() {
  const confirmed = await confirm('', 'Are you sure you want to retry all jobs?', 'Confirm');
  if (!confirmed) return;

  await api.queue.retryAllAction(id.value);
  await fetchData();
}

async function chageQueueStatus(action: 'resume' | 'pause') {
  const confirmed = await confirm('', `Are you sure you want to ${action} this queue?`, 'Confirm');
  if (!confirmed) return;

  await api.queue.chageQueueStatus(action, {
    ids: [id.value],
  });

  await fetchData();
}
</script>
