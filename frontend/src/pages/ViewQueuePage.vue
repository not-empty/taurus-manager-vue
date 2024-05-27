<template v-if="!loading">
  <q-page padding v-if="group && dash && jobCounts">
    <q-dialog v-model="showDialogActionConfirm" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">
            Are you sure you want to {{ currentAction }} this queue?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat :label="currentAction" :color="calculateActionColor(currentAction)" @click="confirmAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialogDeleteConfirm" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Are you sure you want to delete all the selected itens?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="createJobModalOpen" class="crud-dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="margin-bottom: 10px">Create New Job</div>
          <div class="q-pa-md">
            <q-input v-model="jobJson" filled type="textarea" autogrow placeholder="Enter JSON here" />
          </div>
          <div v-if="jsonError" class="text-negative">Invalid JSON</div>
          <div v-if="!jsonError" class="text-primary">valid JSON</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="closeCreateJobModal" />
          <q-btn flat label="Create" color="positive" @click="createJob" :disabled="jsonError" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="payloadJobModalOpen" class="job-dialog">
      <q-card v-if="jobData">
        <div class="q-gutter-md" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
          <q-card-actions class="text-h6 q-pa-md q-pl-lg q-pt-lg" align="left">
            Job Information
          </q-card-actions>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" @click="closePayloadJobModal" />

            <q-btn flat label="Retry" icon="replay" color="white" class="q-ml-xl" @click="retryOneJob(jobData.id)" v-if="
              jobData.state === 'failed' && checkPermission(role, 'controller')
            " />

            <q-btn flat label="Clone" icon="content_copy" color="white" class="q-ml-xl" @click="cloneOneJob(jobData.id)"
              v-if="
                jobData.state === 'completed' &&
                checkPermission(role, 'controller')
              " />
          </q-card-actions>
        </div>

        <q-card-section>
          <q-input filled v-model="jobData.id" label="ID" readonly class="q-mb-md" />

          <q-input filled v-model="jobData.state" label="Status" readonly class="q-mb-md" />

          <q-input filled v-model="jobData.attemptsMade" label="Attempts Made" readonly class="q-mb-md" />

          <q-input v-model="jobData.data" filled label="Data" type="textarea" class="q-mb-md" autogrow readonly />

          <q-input v-model="jobData.failedReason" filled label="Failed Reason" type="textarea" class="q-mb-md" autogrow
            readonly />

          <q-input v-model="jobData.stacktrace" filled label="Trace" type="textarea" class="q-mb-md" autogrow
            readonly />
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el class="breadcrumb-white" label="Dashboard" icon="dashboard" to="/view/dashboard" />
        <q-breadcrumbs-el class="breadcrumb-white" :label="group.name" icon="table_view"
          :to="'/view/group/' + group.id" />
        <q-breadcrumbs-el class="breadcrumb-white" :label="dash.name" icon="dynamic_feed" />
      </q-breadcrumbs>
    </div>

    <div class="q-gutter-md" style="display: flex; justify-content: space-between; align-items: center">
      <div class="text-h4 q-ml-lg">
        {{ dash.name }}
        <q-chip :color="calculateHealthColor(
          dash.health_value,
          jobCounts.waiting,
          jobCounts.paused
        )
          ">
          {{ dash.health_value }}
        </q-chip>
        <q-chip :color="calculateStatusColor(dash.status)">
          {{ dash.status }}
        </q-chip>
      </div>
      <div>
        <q-btn flat label="Refresh" icon="refresh" color="white" @click="refreshAllData" />
        <q-btn flat label="Create Job" icon="add_circle" color="white" v-if="checkPermission(role, 'controller')"
          @click="openCreateJobModal" />
        <q-btn flat v-if="dash.status === 'running' && checkPermission(role, 'controller')" label="Pause" icon="pause"
          color="primary" class="q-ml-xl" @click="pauseSelected" />
        <q-btn flat v-if="dash.status === 'paused' && checkPermission(role, 'controller')" label="Resume"
          icon="play_arrow" color="primary" @click="resumeSelected" />
        <q-btn flat v-if="typeParam === 'failed' && checkPermission(role, 'controller')" label="Retry" icon="replay"
          color="white" class="q-ml-xl" :disabled="selected.length === 0" @click="retrySelected" />
        <q-btn flat v-if="typeParam === 'failed' && checkPermission(role, 'controller')" label="Retry All" icon="replay"
          color="white" :disabled="rows.length === 0" @click="retryAll" />
        <q-btn flat label="Remove" icon="delete_forever" color="red" class="q-ml-xl"
          v-if="checkPermission(role, 'administrator')" :disabled="selected.length === 0" @click="deleteRows" />
      </div>
    </div>

    <div class="tabs-container q-mt-lg">
      <div class="tab amount-container" :class="{
        'tab-active': listSelection === 'waiting-tab',
        'tab-hover': hoveredTab === 'waiting-tab'
      }" @click="selectTab('waiting-tab')" @mouseover="hoverTab('waiting-tab')" @mouseleave="hoverTab(null)">
        Waiting
        <br />
        <span>{{ jobCounts.waiting }}</span>
      </div>

      <div class="tab amount-container" :class="{
        'tab-active': listSelection === 'paused-tab',
        'tab-hover': hoveredTab === 'paused-tab'
      }" @click="selectTab('paused-tab')" @mouseover="hoverTab('paused-tab')" @mouseleave="hoverTab(null)">
        Paused
        <br />
        <span>{{ jobCounts.paused }}</span>
      </div>

      <div class="tab amount-container" :class="{
        'tab-active': listSelection === 'active-tab',
        'tab-hover': hoveredTab === 'active-tab'
      }" @click="selectTab('active-tab')" @mouseover="hoverTab('active-tab')" @mouseleave="hoverTab(null)">
        Active
        <br />
        <span>{{ jobCounts.active }}</span>
      </div>

      <div class="tab amount-container" :class="{
        'tab-active': listSelection === 'delayed-tab',
        'tab-hover': hoveredTab === 'delayed-tab'
      }" @click="selectTab('delayed-tab')" @mouseover="hoverTab('delayed-tab')" @mouseleave="hoverTab(null)">
        Delayed
        <br />
        <span>{{ jobCounts.delayed }}</span>
      </div>

      <div class="tab amount-container" :class="{
        'tab-active': listSelection === 'failed-tab',
        'tab-hover': hoveredTab === 'failed-tab'
      }" @click="selectTab('failed-tab')" @mouseover="hoverTab('failed-tab')" @mouseleave="hoverTab(null)">
        Failed
        <br />
        <span>{{ jobCounts.failed }}</span>
      </div>

      <div class="tab amount-container" :class="{
        'tab-active': listSelection === 'completed-tab',
        'tab-hover': hoveredTab === 'completed-tab'
      }" @click="selectTab('completed-tab')" @mouseover="hoverTab('completed-tab')" @mouseleave="hoverTab(null)">
        Completed
        <br />
        <span>{{ jobCounts.completed }}</span>
      </div>
    </div>

    <q-linear-progress size="10px" :value="calculateProgress(
      dash.health_value,
      jobCounts.waiting,
      jobCounts.paused
    )
      " :color="calculateHealthColor(
        dash.health_value,
        jobCounts.waiting,
        jobCounts.paused
      )
        " class="q-mt-md" />

    <q-table flat bordered color="primary" class="limited-table" ref="tableRef" :title="typeParam" :rows="rows"
      :columns="columns" v-model:pagination="pagination" :rows-per-page-options="[25, 100]" row-key="id"
      selection="multiple" @selection="handleSelection" v-model:selected="selected" @request="request"
      :loading="loading">
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <div @click="openPayloadJobModal(props.row.id)" class="cursor-pointer">
            {{ props.row.id }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div @click="openPayloadJobModal(props.row.id)" class="cursor-pointer">
            {{ props.row.name }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-attemptsMade="props">
        <q-td :props="props">
          <div @click="openPayloadJobModal(props.row.id)" class="cursor-pointer">
            {{ props.row.attemptsMade }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          <div @click="openPayloadJobModal(props.row.id)" class="cursor-pointer">
            {{ props.row.createdAt }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-processedAt="props">
        <q-td :props="props">
          <div @click="openPayloadJobModal(props.row.id)" class="cursor-pointer">
            {{ props.row.processedAt }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-finishedAt="props">
        <q-td :props="props">
          <div @click="openPayloadJobModal(props.row.id)" class="cursor-pointer">
            {{ props.row.finishedAt }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="data_object" @click="openPayloadJobModal(props.row.id)">
            <q-tooltip> Job Information </q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:header-selection="scope">
        <q-checkbox v-if="checkPermission(role, 'controller')" v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-checkbox v-if="checkPermission(role, 'controller')" :model-value="scope.selected" @update:model-value="(val, evt) => {
          Object.getOwnPropertyDescriptor(scope, 'selected').set(val, evt);
        }
          " />
      </template>
    </q-table>

    <div class="text-subtitle1 q-pa-sm">
      Use <kbd>SHIFT</kbd> to select / deselect a range and <kbd>CTRL</kbd> to
      add to selection
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios, { AxiosError } from 'axios';
import { Notify, QTableColumn } from 'quasar';
import { errorRequest } from 'src/api/types';
import { Group } from 'src/api/types/GroupTypes';
import { Job, ListJob } from 'src/api/types/JobTypes';
import { Queue, QueueJobCounts } from 'src/api/types/QueueTypes';
import colorsMixin from 'src/mixins/colorsMixin';
import sessionMixin from 'src/mixins/sessionMixin';
import { nextTick, onMounted, ref, toRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { calculateHealthColor, calculateStatusColor, calculateActionColor, calculateProgress } = colorsMixin();
const { validateUser, checkPermission } = sessionMixin();

const route = useRoute();
const router = useRouter();

const role = ref<string>('');
const loading = ref<boolean>(false);

const queueId = ref<string>('');
const typeParam = ref<string>('');
const listSelection = ref<string>('');

const rows = ref<Job[]>();
const dash = ref<Queue>();
const jobCounts = ref<QueueJobCounts>();
const group = ref<Group>();
const jobData = ref<Job>();

const selected = ref<Job[]>([]);
const storedSelectedRow = ref([]);
const pagination = ref<{
  page: number,
  rowsPerPage: number,
  rowsNumber: number,
}>({
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
});

const showDialogActionConfirm = ref<boolean>(false);
const showDialogDeleteConfirm = ref<boolean>(false);
const payloadJobModalOpen = ref<boolean>(false);
const createJobModalOpen = ref<boolean>(false);

const currentAction = ref<'' | 'pause' | 'resume' | 'retry' | 'retry all'>('');

const jobJson = ref<string>('');
const jsonError = ref<boolean>(false);

const hoveredTab = ref<string | null>(null);

const tableRef = ref();
const columns: QTableColumn[] = [
  {
    name: 'id',
    align: 'left',
    label: 'Id',
    field: 'id',
    sortable: false,
    style: 'width: 300px'
  },
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'attemptsMade',
    align: 'left',
    label: 'Attempts',
    field: 'attemptsMade',
    sortable: true
  },
  {
    name: 'createdAt',
    align: 'left',
    label: 'Created At',
    field: 'createdAt',
    sortable: true
  },
  {
    name: 'processedAt',
    align: 'left',
    label: 'Processed At',
    field: 'processedAt',
    sortable: true
  },
  {
    name: 'finishedAt',
    align: 'left',
    label: 'finished At',
    field: 'finishedAt',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    sortable: false
  }
];

onMounted(async () => {
  role.value = await validateUser();

  queueId.value = String(route.params?.id || '');
  typeParam.value = String(route.query?.type ? route.query?.type : 'waiting');
  listSelection.value = `${typeParam.value}-tab`;

  await refreshAllData();
});

watch(() => route.query.type, async (type) => {
  const newType = String(type || 'waiting');
  typeParam.value = newType;
  listSelection.value = `${newType}-tab`;
  await refreshAllData();
}, {
  deep: true,
})

watch(() => typeParam.value, () => {
  selected.value = [];
}, {
  immediate: true,
});

watch(() => pagination.value.page, async (newPage, oldPage) => {
  if (oldPage !== undefined && newPage > 0) {
    await fetchRows();
  }
});

watch(() => pagination.value.rowsPerPage, async (newRowsPerPage, oldRowsPerPage) => {
  if (newRowsPerPage !== oldRowsPerPage) {
    await fetchRows();
  }
});

watch(() => jobJson.value, (newVal) => {
  if (newVal.trim()) {
    validateJson();
    return;
  }

  jsonError.value = false;
});

async function refreshAllData() {
  try {
    await fetchRows();
    await fetchDash();
    await fetchGroup();
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
    selected.value = [];
    loading.value = false;
  }
}

async function fetchRows() {
  const { page, rowsPerPage } = pagination.value;

  if (!typeParam.value) {
    typeParam.value = 'waiting';
  }

  const response = await axios.get<ListJob>(
    `queue/${queueId.value}/job?state=${typeParam.value}&page=${page}&size=${rowsPerPage}`
  );

  rows.value = response.data.jobs;
  pagination.value.rowsNumber = response.data.total;
}

async function fetchDash() {
  const response = await axios.get<Queue>(
    `queue/${queueId.value}/dashboard`
  );

  dash.value = response.data;
  jobCounts.value = response.data.jobCounts;
}

async function fetchGroup() {
  const response = await axios.get<Group>(
    `group/${dash.value?.groupId}`
  );

  group.value = response.data;
}

async function confirmAction() {
  if (currentAction.value === 'pause' || currentAction.value === 'resume') {
    await pauseResumeAction();
  }

  if (currentAction.value === 'retry') {
    await retryAction();
  }

  if (currentAction.value === 'retry all') {
    await retryAllJobs();
  }
}

async function pauseResumeAction() {
  try {
    await axios.put(
      `queue/${currentAction.value}`,
      { ids: [queueId.value] }
    );

    Notify.create({
      type: 'positive',
      position: 'top',
      message: `<span class="nofification">queue successfuly ${currentAction.value}d.</sapn>`,
      html: true,
      timeout: 2500
    });

    await refreshAllData();
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
    showDialogActionConfirm.value = false;
  }
}

async function retryAction() {
  try {
    const selectedIds = selected.value.map((item) => item.id);
    const uniqueIds = [...new Set(selectedIds)];
    let data = {
      jobIds: uniqueIds
    };

    await axios.post(
      `queue/${dash.value?.id}/job/retry`,
      data
    );

    await refreshAllData();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Itens successfuly retried.</sapn>',
      html: true,
      timeout: 2500
    });
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
    showDialogActionConfirm.value = false;
  }
}

async function retryAllJobs() {
  try {
    await axios.post(
      `queue/${queueId.value}/job/retry-all`,
      {}
    );

    await refreshAllData();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Itens successfuly replayed.</sapn>',
      html: true,
      timeout: 2500
    });
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
    showDialogActionConfirm.value = false;
  }
}

async function confirmDelete() {
  try {
    const selectedIds = selected.value.map((item) => item.id);
    const uniqueIds = [...new Set(selectedIds)];

    let data = {
      jobIds: uniqueIds
    };

    await axios.delete(
      `queue/${dash.value?.id}/job`,
      { data: data }
    );

    await refreshAllData();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Itens successfuly retried.</sapn>',
      html: true,
      timeout: 2500
    });
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
    showDialogDeleteConfirm.value = false;
  }
}

async function openPayloadJobModal(jobId: string) {
  await fetchJob(jobId);
  payloadJobModalOpen.value = true;
}

async function createJob() {
  validateJson();

  if (jsonError.value) {
    Notify.create({
      type: 'negative',
      position: 'top',
      message: '<span class="nofification">Invalid JSON</span>',
      html: true,
      timeout: 2500
    });
    return;
  }

  try {
    const jobData = JSON.parse(jobJson.value);
    const data = {
      data: jobData
    };

    await axios.post(
      `queue/${queueId.value}/job`,
      data
    );

    await refreshAllData();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Item successfuly deleted.</sapn>',
      html: true,
      timeout: 2500
    });

    closeCreateJobModal();
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
}

async function cloneOneJob(jobId: string) {
  try {
    await axios.post(
      `queue/${queueId.value}/job/${jobId}/clone`,
      {}
    );

    await refreshAllData();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Item successfuly cloned.</sapn>',
      html: true,
      timeout: 2500
    });

    payloadJobModalOpen.value = false;
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
    payloadJobModalOpen.value = false;
  }
}

async function retryOneJob(jobId: string) {
  try {
    const data = {
      jobIds: [jobId]
    };

    await axios.post(
      `queue/${queueId.value}/job/retry`,
      data
    );

    await refreshAllData();
    payloadJobModalOpen.value = false;

    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Item successfuly retried.</sapn>',
      html: true,
      timeout: 2500
    });
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
}

async function fetchJob(jobId: string) {
  try {
    const response = await axios.get<Job>(`queue/${queueId.value}/job/${jobId}`);

    jobData.value = response.data;
    jobData.value.data = JSON.stringify(jobData.value.data, null, 4);
    jobData.value.failedReason = JSON.stringify(
      jobData.value.failedReason,
      null,
      4
    );

    jobData.value.stacktrace = JSON.stringify(
      jobData.value.stacktrace,
      null,
      4
    );
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
}

async function request(props: {
  pagination: {
    page: number,
    rowsPerPage: number,
    rowsNumber: number,
  }
}) {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
}

function handleSelection({ rows, added, evt }) {
  if (rows.length !== 1 || evt === void 0) {
    return;
  }

  const oldSelectedRow = storedSelectedRow.value;
  const [newSelectedRow] = rows;
  const { ctrlKey, shiftKey } = evt;

  if (shiftKey !== true) {
    storedSelectedRow.value = newSelectedRow;
  }

  nextTick(() => {
    if (shiftKey === true) {
      const tableRows = tableRef.value.filteredSortedRows;
      let firstIndex = tableRows.indexOf(oldSelectedRow);
      let lastIndex = tableRows.indexOf(newSelectedRow);

      if (firstIndex < 0) {
        firstIndex = 0;
      }

      if (firstIndex > lastIndex) {
        [firstIndex, lastIndex] = [lastIndex, firstIndex];
      }

      const rangeRows = tableRows.slice(firstIndex, lastIndex + 1).map(toRaw);
      const selectedRows = selected.value.map(toRaw);

      selected.value = added ?
        selected.value = selectedRows.concat(
          rangeRows.filter((row) => !selectedRows.some(selectedRow => selectedRow.id === row.id))
        ) :
        selected.value = selectedRows.filter(
          (row) => !rangeRows.some(rangeRow => rangeRow.id === row.id)
        );

    } else if (ctrlKey !== true && added === true) {
      selected.value = [newSelectedRow];
    }
  });
}

function validateJson() {
  try {
    JSON.parse(jobJson.value);
    jsonError.value = false;
  } catch (_) {
    jsonError.value = true;
  }
}

function openCreateJobModal() {
  createJobModalOpen.value = true;
}

function closeCreateJobModal() {
  createJobModalOpen.value = false;
  jobJson.value = '';
  jsonError.value = false;
}

function hoverTab(tab: string | null) {
  hoveredTab.value = tab;
}

function closePayloadJobModal() {
  payloadJobModalOpen.value = false;
}

function pauseSelected() {
  currentAction.value = 'pause';
  showDialogActionConfirm.value = true;
}

function resumeSelected() {
  currentAction.value = 'resume';
  showDialogActionConfirm.value = true;
}

function retrySelected() {
  currentAction.value = 'retry';
  showDialogActionConfirm.value = true;
}

function retryAll() {
  currentAction.value = 'retry all';
  showDialogActionConfirm.value = true;
}

function updateRouteQuery(type: string) {
  router.push({ query: { ...route.query, type: type } });
}

function selectTab(tab: string) {
  listSelection.value = tab;
  updateRouteQuery(tab.replace('-tab', ''));
}

function deleteRows() {
  showDialogDeleteConfirm.value = true;
}
</script>

<style scoped></style>
