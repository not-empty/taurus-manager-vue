<template>
  <Modal :show="showDialogSave" @close="showDialogSave = false">
    <ModalTitle @close="showDialogSave = false">{{ isEditMode ? 'Edit Group' : 'New Group' }}</ModalTitle>
    <ModalBody>
      <Input v-if="isEditMode && 'id' in row" label="ID" name="id" v-model="row.id" type="text" readonly />

      <Input label="Name*" name="name" v-model="row.name" type="text" />
      <Input label="Description" name="description" v-model="row.description" type="text" />
    </ModalBody>
    <ModalFooter>
      <fwb-button @click="saveRow" color="green" class="mr-2">Save</fwb-button>
      <fwb-button @click="showDialogSave = false" color="dark">Close</fwb-button>
    </ModalFooter>
  </Modal>
  <div class="flex flex-col justify-start gap-6">
    <div class="text-2xl flex items-center justify-start gap-2 py-1">
      <i class="ph ph-square-half"></i>
      <span>Groups</span>
    </div>
    <div class="flex flex-row justify-between">
      <fwb-input v-model="filter" placeholder="Filter queues"
        class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
        <template #prefix>
          <i class="ph ph-magnifying-glass text-xl"></i>
        </template>
      </fwb-input>
      <fwb-button @click="newRow" color="green" class="mr-2">New Group</fwb-button>
    </div>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
      <TableData :actions="actions" :columns="columns" :data="rows" />
      <TablePagination :max-visible-pages="5" :page="page" @load-data="onLoadData" :rows-per-page="25"
        :rows-number="totalRows" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/api';
import { AxiosError } from 'axios';
import { FilterType, type Filter } from '@/api/types';
import { FwbInput, FwbButton } from 'flowbite-vue';
import { onMounted, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { useConfirmModal } from '@/composables/useConfirmModal';

import Input from '@/components/ui/Input.vue';
import Modal from '@/components/modal/Modal.vue';
import ModalBody from '@/components/modal/ModalBody.vue';
import ModalFooter from '@/components/modal/ModalFooter.vue';
import ModalTitle from '@/components/modal/ModalTitle.vue';
import TableData, { type TableAction, type TableColumn } from '@/components/table/TableData.vue';
import TablePagination from '@/components/table/TablePagination.vue';

import type { ErrorRequest } from '@/types';
import type { IGroup } from '@/types/group';

const api = new Api();
const confirm = useConfirmModal();

const showDialogSave = ref(false);
const showDialogDeleteConfirm = ref<boolean>(false);

const page = ref<number>(1);
const totalRows = ref<number>(1);
const row = ref({ id: '', name: '', description: '' });
const isEditMode = ref(false);
const filter = ref('');
const rows = ref<IGroup[]>([]);
const columns: TableColumn<IGroup>[] = [
  {
    name: 'id',
    align: 'left',
    label: 'Id',
    field: 'id',
    sortable: false,
    // style: 'width: 300px'
  },
  {
    name: 'name',
    align: 'left',
    label: 'Name',
    field: 'name',
    sortable: true
  },
  {
    name: 'description',
    align: 'left',
    label: 'Description',
    field: 'description',
    sortable: true
  },
  {
    name: 'createdAt',
    align: 'left',
    label: 'Created',
    field: 'createdAt',
    sortable: true
  },
  {
    name: 'updatedAt',
    align: 'left',
    label: 'Updated',
    field: 'updatedAt',
    sortable: true
  },
];

const actions: TableAction<IGroup>[] = [
  {
    icon: 'pencil-simple',
    label: 'Edit',
    name: 'edit',
    onClick: editRow
  },
  {
    icon: 'trash-simple',
    label: 'Delete',
    name: 'delete',
    onClick: deleteRow
  },
];

onMounted(async () => {
  await fetchRows();
})

function onLoadData(newPage: number) {
  page.value = newPage;
  fetchRows();
}

watch(filter, () => {
  page.value = 1;
  fetchRows();
});

async function fetchRows() {
  try {
    const filters: Filter<IGroup>[] = [];

    if (filter.value) {
      filters.push({ field: 'name', type: FilterType.FILTER_LIKE, value: filter.value });
    }

    const response = await api.group.getPaginate({
      page: page.value,
      size: 25,
      filters,
    });
    rows.value = response.data;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

async function saveRow() {
  try {
    if (isEditMode.value) {
      await api.group.put({
        id: row.value.id,
        data: row.value,
      });
    } else {
      await api.group.newGroup(row.value);
    }

    toast.success(
      '<span class="nofification">Item successfuly saved.</span>',
    );

    await fetchRows();
    showDialogSave.value = false;
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

function newRow() {
  isEditMode.value = false;
  row.value = { id: '', name: '', description: '' };
  showDialogSave.value = true;
}

async function editRow(rowData: { id: string, name: string, description: string } | null = null) {
  if (rowData) {
    isEditMode.value = true;
    row.value = { ...rowData };
  }

  showDialogSave.value = true;
}

async function deleteRow(row: IGroup) {
  try {
    if (!row) {
      return;
    }

    const confirmed = await confirm('', 'Are you sure you want to delete this group?', 'Delete');
    if (!confirmed) {
      return;
    }

    await api.group.deleteById(row.id);

    await fetchRows();
    toast.success(
      '<span class="nofification">Item successfuly deleted.</span>',
    );
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  } finally {
    showDialogDeleteConfirm.value = false;
  }
}
</script>
