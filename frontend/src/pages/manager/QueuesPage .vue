<template>
  <Modal :show="showDialogSave" @close="showDialogSave = false">
    <ModalTitle @close="showDialogSave = false">
      {{ isEditMode ? 'Edit Queue' : 'New Queue' }}
    </ModalTitle>

    <ModalBody>
      <Input v-if="isEditMode && 'id' in row" label="ID" name="id" v-model="row.id" type="text" readonly />

      <Input label="Name*" name="name" v-model="row.name" type="text" />

      <Select label="Group*" name="group" v-model="groupId"
        :options="groups.map(g => ({ value: g.id, label: g.name }))" />

      <Input label="Host*" name="host" v-model="row.host" type="text" />

      <Input label="Port*" name="port" v-model="row.port" type="number" />

      <Input label="Health Value*" name="healthValue" v-model="row.healthValue" type="number" />

      <Input label="Description" name="description" v-model="row.description" type="text" />

      <div class="text-xs text-gray-500 mt-2">*Required</div>
    </ModalBody>

    <ModalFooter>
      <fwb-button @click="showDialogSave = false" color="dark">Close</fwb-button>
      <fwb-button @click="saveRow" color="green" class="mr-2">Save</fwb-button>
    </ModalFooter>
  </Modal>

  <Modal :show="showDialogBatchEdit" @close="showDialogBatchEdit = false">
    <ModalTitle @close="showDialogBatchEdit = false">
      Batch Edit Queues
    </ModalTitle>

    <ModalBody>
      <Select label="Group" name="group" v-model="batchEditSafe.groupId"
        :options="groups.map(g => ({ value: g.id, label: g.name }))" />

      <Input label="Host*" name="host" v-model="batchEditSafe.host" type="text" />

      <Input label="Port*" name="port" v-model="batchEditSafe.port" type="number" />

      <Input label="Health Value" name="healthValue" v-model="batchEditSafe.healthValue" type="number" />

      <Input label="Description" name="description" v-model="batchEditSafe.description" type="text" />
    </ModalBody>

    <ModalFooter>
      <fwb-button @click="showDialogBatchEdit = false" color="dark">Close</fwb-button>
      <fwb-button @click="saveBatchEdit" color="green">Save All</fwb-button>
    </ModalFooter>
  </Modal>

  <div class="flex flex-col justify-start gap-6">
    <div class="text-2xl flex items-center justify-start gap-2 py-1">
      <i class="ph ph-queue"></i>
      <span>Queues</span>
    </div>
    <div class="flex flex-row justify-between">
      <fwb-input v-model="filter" placeholder="Filter queues"
        class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
        <template #prefix>
          <i class="ph ph-magnifying-glass text-xl"></i>
        </template>
      </fwb-input>
      <div>
        <router-link to="queues/import">
          <fwb-button color="default" class="mr-2 self-end cursor-pointer">Import queues</fwb-button>
        </router-link>
        <fwb-button color="yellow" class="mr-2" :disabled="selectedRowsIds.length === 0" @click="openBatchEditModal">
          Edit Selected
        </fwb-button>
        <fwb-button @click="newRow" color="green" class="mr-2">New Queue</fwb-button>
      </div>
    </div>
    <div class="relative overflow-auto shadow-md sm:rounded-lg">
      <TableData ref="tableRef" :actions="actions" :columns="columns" :data="rows" :selectable="true"
        @update:selected="rows => selectedRowsIds = rows.map((r) => (r.id))" />
      <TablePagination :max-visible-pages="5" :page="paginate.page" @load-data="onLoadData"
        :rows-per-page="paginate.size" :rows-number="paginate.total || 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { computed } from '@vue/reactivity';
import { FilterType, type Filter, type Pagination } from '@/api/types';
import { FwbInput, FwbButton } from 'flowbite-vue';
import { onMounted, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { useConfirmModal } from '@/composables/useConfirmModal';

import Input from '@/components/ui/Input.vue';
import Modal from '@/components/modal/Modal.vue';
import ModalBody from '@/components/modal/ModalBody.vue';
import ModalFooter from '@/components/modal/ModalFooter.vue';
import ModalTitle from '@/components/modal/ModalTitle.vue';
import Select from '@/components/ui/Select.vue';
import TableData, { type TableAction, type TableColumn } from '@/components/table/TableData.vue';
import TablePagination from '@/components/table/TablePagination.vue';

import type { AxiosError } from 'axios';
import type { ErrorRequest } from '@/types';
import type { IGroup } from '@/types/group';
import type { INewQueue, IQueue, IQueueBatchEdit } from '@/types/queues';

const api = new Api();

const confirm = useConfirmModal();

const showDialogSave = ref<boolean>(false);
const isEditMode = ref<boolean>(false);

const tableRef = ref<InstanceType<typeof TableData> | null>(null);

const showDialogBatchEdit = ref(false);
const batchEdit = ref<IQueueBatchEdit>({});

const batchEditSafe = computed(() => ({
  groupId: batchEdit.value.groupId ?? '',
  healthValue: batchEdit.value.healthValue ?? '',
  description: batchEdit.value.description ?? '',
  host: batchEdit.value.host ?? '',
  port: batchEdit.value.port ?? '',
}));

const row = ref<INewQueue | IQueue>({
  name: '',
  description: '',
  host: '',
  port: 6379,
  healthValue: 100
} as INewQueue);
const rows = ref<IQueue[]>([]);
const selectedRowsIds = ref<string[]>([]);

const groups = ref<IGroup[]>([]);
const groupId = computed({
  get: () => row.value.group?.id || '',
  set: (value: string) => {
    const group = groups.value.find(g => g.id === value);
    if (group) {
      row.value.group = group;
    }
  }
});

const actions: TableAction<IQueue>[] = [
  {
    icon: 'pencil-simple',
    label: 'Edit',
    name: 'edit',
    onClick: editRow,
  },
  {
    icon: 'trash-simple',
    label: 'Delete',
    name: 'delete',
    onClick: deleteRow
  },
];

const columns: TableColumn<IQueue>[] = [
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'group',
    align: 'left',
    label: 'Group',
    field: (q) => q.group?.name || '-',
    sortable: true
  },
  {
    name: 'host',
    align: 'left',
    label: 'Host',
    field: 'host',
    sortable: true
  },
  {
    name: 'port',
    align: 'left',
    label: 'Port',
    field: 'port',
    sortable: true
  },
  {
    name: 'healthValue',
    align: 'left',
    label: 'Health Val.',
    field: 'healthValue',
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

const filter = ref<string>();
const paginate = ref<Pagination<IQueue>>({
  page: 1,
  size: 25,
  total: 0,
  totalPages: 0,
});

onMounted(async () => {
  await fetchRows();
  await fetchGroups();
});

watch(filter, () => {
  paginate.value.page = 1;
  fetchRows();
});

async function fetchRows() {
  try {
    tableRef.value?.clearSelection();
    const filters: Filter<IQueue>[] = [];

    if (filter.value) {
      filters.push({ field: 'name', type: FilterType.FILTER_LIKE, value: filter.value });
    }

    const res = await api.queue.getPaginate({
      page: paginate.value.page,
      size: paginate.value.size,
      filters,
    });

    rows.value = res.data;
    paginate.value.total = res.pagination.total || 0;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;

    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

async function fetchGroups() {
  try {
    const response = await api.group.getPaginate();
    groups.value = response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;

    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

async function onLoadData(newPage: number) {
  paginate.value.page = newPage;
  await fetchRows();
}

function newRow() {
  isEditMode.value = false;
  row.value = {
    name: '',
    description: '',
    host: '',
    port: 6379,
    healthValue: 100
  } as INewQueue;
  showDialogSave.value = true;
}

async function saveRow() {
  try {
    if (!row.value) return;

    if (isEditMode.value) {
      const queue = row.value as IQueue;
      queue.groupId = queue.group?.id || '';
      delete queue.group;

      await api.queue.put({
        id: queue.id,
        data: queue,
      })
    } else {
      const queue = row.value as INewQueue;
      queue.groupId = queue.group?.id || '';
      delete queue.group;

      await api.queue.queueAdd(row.value as INewQueue);
    }

    await fetchRows();
    showDialogSave.value = false;

    toast.success('<span class="nofification">Item successfully saved.</span>');
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response?.data?.message
        ? `<span class="nofification">${error.response.data.message}</span>`
        : 'There was an error processing your request.'
    );
  }
}

function editRow(rowData: IQueue | null = null) {
  if (rowData) {
    isEditMode.value = true;
    row.value = { ...rowData };
  }

  showDialogSave.value = true;
}

async function saveBatchEdit() {
  if (selectedRowsIds.value.length === 0) return;

  try {
    await api.queue.batchUpdate(selectedRowsIds.value, batchEditSafe.value as IQueueBatchEdit);

    toast.success('<span class="nofification">Queues updated successfully.</span>');
    showDialogBatchEdit.value = false;
    await fetchRows();
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response?.data?.message
        ? `<span class="nofification">${error.response.data.message}</span>`
        : 'There was an error processing your request.'
    );
  }
}

async function deleteRow(itemToDelete: IQueue) {
  try {
    if (!itemToDelete) {
      return;
    }

    const confirmed = await confirm('', 'Are you sure you want to delete this item?', 'Delete');
    if (!confirmed) return;

    await api.queue.deleteById(itemToDelete.id);

    await fetchRows();
    toast.success('<span class="nofification">Item successfuly deleted.</sapn>');
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

function openBatchEditModal() {
  const selectedItems = rows.value.filter(r => selectedRowsIds.value.includes(r.id));

  const getCommonValue = <T>(getter: (item: IQueue) => T): T | undefined => {
    const firstValue = getter(selectedItems[0]);
    return selectedItems.every(item => getter(item) === firstValue) ? firstValue : undefined;
  };

  batchEdit.value = {
    groupId: getCommonValue(item => item.group?.id),
    healthValue: getCommonValue(item => item.healthValue),
    description: getCommonValue(item => item.description),
    host: getCommonValue(item => item.host),
    port: getCommonValue(item => item.port),
  };

  showDialogBatchEdit.value = true;
}
</script>
