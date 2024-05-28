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
        <q-breadcrumbs-el label="Dashboard" icon="dashboard" />
      </q-breadcrumbs>
    </div>

    <div class="q-gutter-md" style="display: flex; justify-content: space-between; align-items: center">
      <q-input outlined v-model="filter" placeholder="Filter in queues" style="max-width: 300px" autofocus>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div>
        <q-btn flat label="Refresh" icon="refresh" color="white" @click="fetchRows" />
        <q-btn flat label="Pause" icon="pause" color="primary" class="q-ml-xl"
          v-if="sessionMixin().checkPermission(role, 'controller')" :disabled="selected.length === 0"
          @click="pauseSelected" />
        <q-btn flat label="Resume" icon="play_arrow" color="primary" v-if="checkPermission(role, 'controller')"
          :disabled="selected.length === 0" @click="resumeSelected" />
      </div>
    </div>

    <div v-for="group in filteredGroups" :key="group.group.id">
      <div v-if="group.queues.length > 0" class="text-h6 q-my-md q-mt-xl cursor-pointer"
        @click="openGroup(group.group.id)">
        <q-icon name="table_view" size="1em" />
        {{ group.queues[0].group.name }}
      </div>
      <div v-if="group.queues.length > 0">
        <q-table flat bordered color="primary" :rows="group.queues" :columns="columns" row-key="id"
          :rows-per-page-options="[10000]" selection="multiple" v-model:selected="selected" :hide-bottom="true"
          :loading="loading">
          <template v-slot:header-cell-healthValue="props">
            <q-th :props="props">
              <q-icon name="favorite" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-name="props">
            <q-th :props="props">
              <q-icon name="dynamic_feed" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-waiting="props">
            <q-th :props="props">
              <q-icon name="pending" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-paused="props">
            <q-th :props="props">
              <q-icon name="pause_circle" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-active="props">
            <q-th :props="props">
              <q-icon name="play_circle" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-delayed="props">
            <q-th :props="props">
              <q-icon name="update" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-failed="props">
            <q-th :props="props">
              <q-icon name="report" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-cell-status="props">
            <q-th :props="props">
              <q-icon name="question_mark" size="2em" />
              {{ props.col.label }}
            </q-th>
          </template>

          <template v-slot:header-selection="scope">
            <q-checkbox v-model="scope.selected" v-if="checkPermission(role, 'controller')" />
          </template>

          <template v-slot:body-selection="scope">
            <q-checkbox v-if="checkPermission(role, 'controller')" :model-value="scope.selected" @update:model-value="(val, evt) => {
              Object.getOwnPropertyDescriptor(scope, 'selected').set(val, evt);
            }" />
          </template>

          <template v-slot:body-cell-healthValue="props">
            <q-td :props="props">
              <div @click="onRowClick(props.row.id)" class="cursor-pointer">
                <q-chip :color="calculateHealthColor(
                  props.row.healthValue,
                  props.row.jobCounts.waiting,
                  props.row.jobCounts.paused
                )
                  ">
                  Max: {{ props.row.healthValue }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div @click="onRowClick(props.row.id)" class="cursor-pointer">
                {{ props.row.name }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div @click="onRowClick(props.row.id)" class="cursor-pointer">
                <q-chip :color="calculateStatusColor(props.row.status)">
                  {{ props.row.status.substring(0, 1).toUpperCase() }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-waiting="props">
            <q-td :props="props">
              <div @click="onRowClickType(props.row.id, 'waiting')" class="cursor-pointer">
                {{ props.row.jobCounts.waiting }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-paused="props">
            <q-td :props="props">
              <div @click="onRowClickType(props.row.id, 'paused')" class="cursor-pointer">
                {{ props.row.jobCounts.paused }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-active="props">
            <q-td :props="props">
              <div @click="onRowClickType(props.row.id, 'active')" class="cursor-pointer">
                {{ props.row.jobCounts.active }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-delayed="props">
            <q-td :props="props">
              <div @click="onRowClickType(props.row.id, 'delayed')" class="cursor-pointer">
                {{ props.row.jobCounts.delayed }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-failed="props">
            <q-td :props="props">
              <div @click="onRowClickType(props.row.id, 'failed')" class="cursor-pointer">
                {{ props.row.jobCounts.failed }}
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios, { AxiosError } from 'axios';
import { onMounted, computed, ref } from 'vue';

import colorsMixin from 'src/mixins/colorsMixin';
import sessionMixin from 'src/mixins/sessionMixin';
import { Notify, QTableColumn } from 'quasar';
import { errorRequest } from 'src/types';
import { DashboardItem, Queue } from 'src/types/QueueTypes';
import { useRouter } from 'vue-router';

const { calculateHealthColor, calculateStatusColor, calculateActionColor } = colorsMixin();
const { validateUser, checkPermission } = sessionMixin();

const router = useRouter();

const loading = ref(false);
const role = ref<string>('');
const groups = ref<DashboardItem[]>();
const showDialogActionConfirm = ref(false);
const currentAction = ref<string>('');
const filter = ref<string>('');
const selected = ref<Queue[]>([]);

const columns: QTableColumn[] = [
  {
    name: 'healthValue',
    align: 'center',
    label: 'Health',
    field: 'healthValue',
    sortable: true
  },
  {
    name: 'name',
    align: 'center',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'waiting',
    align: 'center',
    label: 'Waiting',
    field: (row: Queue) => row.jobCounts.waiting,
    sortable: true
  },
  {
    name: 'paused',
    align: 'center',
    label: 'Paused',
    field: (row: Queue) => row.jobCounts.paused,
    sortable: true
  },
  {
    name: 'active',
    align: 'center',
    label: 'Active',
    field: (row: Queue) => row.jobCounts.active,
    sortable: true
  },
  {
    name: 'delayed',
    align: 'center',
    label: 'Delayed',
    field: (row: Queue) => row.jobCounts.delayed,
    sortable: true
  },
  {
    name: 'failed',
    align: 'center',
    label: 'Failed',
    field: (row: Queue) => row.jobCounts.failed,
    sortable: true
  },
  {
    name: 'status',
    align: 'center',
    label: 'Status',
    field: 'status',
    sortable: true
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
  role.value = await validateUser();
  await fetchRows();
});

async function fetchRows() {
  loading.value = true;
  try {
    const response = await axios.get<DashboardItem[]>(
      'group/dashboard'
    );
    groups.value = response.data;
  } catch (err) {
    const error = err as AxiosError<errorRequest>;
    Notify.create({
      type: 'negative',
      position: 'top',
      message:
        error.response && error?.response?.data?.message
          ? '<span class="nofification">' +
          error.response.data.message +
          '</span>'
          : 'There was an error processing your request.',
      html: true,
      timeout: 2500
    });
  } finally {
    loading.value = false;
  }
}

async function confirmAction() {
  try {
    const selectedIds = selected.value.map((item) => item.id);
    const uniqueIds = [...new Set(selectedIds)];

    let data = { ids: uniqueIds };

    await axios.put(
      `queue/${currentAction.value}`,
      data
    );

    Notify.create({
      type: 'positive',
      position: 'top',
      message: `<span class="nofification">Itens successfuly ${currentAction.value}d.</sapn>`,
      html: true,
      timeout: 2500
    });
    await fetchRows();
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

function openGroup(id: string) {
  router.push(`/view/group/${id}`);
}

function pauseSelected() {
  if (selected.value.length > 0) {
    currentAction.value = 'pause';
    showDialogActionConfirm.value = true;
  }
}

function resumeSelected() {
  if (selected.value.length > 0) {
    currentAction.value = 'resume';
    showDialogActionConfirm.value = true;
  }
}

function onRowClick(id: string) {
  router.push(`/view/queue/${id}`);
}

function onRowClickType(id: string, type: string) {
  router.push(`/view/queue/${id}?type=${type}`);
}
</script>
