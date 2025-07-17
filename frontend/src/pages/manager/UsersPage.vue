<template>
  <Modal :show="showDialogSave" @close="showDialogSave = false">
    <ModalTitle @close="showDialogSave = false">{{ isEditMode ? 'Edit User' : 'New User' }}</ModalTitle>
    <ModalBody>
      <Input v-if="isEditMode && 'id' in row" label="ID" name="id" v-model="row.id" type="text" readonly />

      <Input label="Name*" name="name" v-model="row.name" type="text" />
      <Input label="Login*" login="login" v-model="row.login" type="text" />
      <Select v-model="row.role" :options="categoryOptions" label="Role*" name="role" />
      <Input :label="isEditMode ? 'Password' : 'Password*'" login="login" v-model="row.password" type="password" />
    </ModalBody>
    <ModalFooter>
      <fwb-button @click="showDialogSave = false" color="dark">Close</fwb-button>
      <fwb-button @click="saveRow" color="green" class="mr-2">Save</fwb-button>
    </ModalFooter>
  </Modal>

  <Modal :show="showDialogGroups" @close="showDialogGroups = false">
    <ModalTitle @close="showDialogGroups = false">{{ isEditMode ? 'Edit User' : 'New User' }}</ModalTitle>
    <ModalBody>
      <div>
        <Input label="User" name="user" v-model="row.name" type="text" readonly />
        <fwb-radio v-model="allowAll" name="allowAll" label="All" value="true" />
        <fwb-radio v-model="allowAll" name="allowAll" label="Some" value="false" />
      </div>
      <div v-if="allowAll === 'false'">
        <div class="flex flex-col gap-6 mb-8">
          <div v-for="(group, index) in groups" :key="index" class="flex items-end gap-4">
            <div class="flex-1">
              <Select :model-value="(group.selectedGroup?.value as string)" :options="groupsOptions" label="Group"
                name="group" />
            </div>
            <fwb-button color="dark" class="cursor-pointer h-10.5 flex justify-center items-center" outline square
              @click="removeGroup(index)">
              <span class="flex items-center gap-2">
                <i class="ph ph-bold ph-minus text-2xl"></i>
              </span>
            </fwb-button>
          </div>
        </div>
        <div class="flex ">
          <fwb-button color="dark" class="cursor-pointer" outline square @click="addGroup">
            <span class="flex items-center gap-2">
              <i class="ph ph-bold ph-plus text-2xl"></i>
              Add Group
            </span>
          </fwb-button>
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <fwb-button @click="showDialogGroups = false" color="dark">Close</fwb-button>
      <fwb-button @click="saveGroups" color="green" class="mr-2">Save</fwb-button>
    </ModalFooter>
  </Modal>

  <div class="flex flex-col justify-start gap-6">
    <div class="text-2xl flex items-center justify-start gap-2 py-1">
      <i class="ph ph-users"></i>
      <span>Users</span>
    </div>
    <div class="flex flex-row items-center justify-between">
      <fwb-input v-model="filter" placeholder="Filter users"
        class="dark:bg-neutral-800 dark:border-neutral-600 dark:placeholder-neutral-400 dark:text-white">
        <template #prefix>
          <i class="ph ph-magnifying-glass text-xl"></i>
        </template>
      </fwb-input>
      <fwb-button @click="newRow" color="green" class="mr-2">New User</fwb-button>
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
import { FilterType, type Filter } from '@/api/types';
import { FwbInput, FwbButton, FwbRadio } from 'flowbite-vue'
import { onMounted, ref, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { useConfirmModal } from '@/composables/useConfirmModal';

import Input from '@/components/ui/Input.vue';
import Modal from '@/components/modal/Modal.vue';
import ModalBody from '@/components/modal/ModalBody.vue';
import ModalFooter from '@/components/modal/ModalFooter.vue';
import ModalTitle from '@/components/modal/ModalTitle.vue';
import Select, { type SelectOption } from '@/components/ui/Select.vue';
import TableData from '@/components/table/TableData.vue';
import TablePagination from '@/components/table/TablePagination.vue';

import type { AxiosError } from 'axios';
import type { ErrorRequest } from '@/types';
import type { IUser, IUserAdd } from '@/types/user';
import type { TableAction, TableColumn } from '@/components/table/TableData.vue';

const actions: TableAction<IUser>[] = [
  {
    icon: 'pencil-simple',
    label: 'Edit',
    name: 'edit',
    onClick: editRow
  },
  {
    icon: 'users',
    label: 'Edit Groups',
    name: 'edit-groups',
    onClick: editGroups
  },
  {
    icon: 'trash-simple',
    label: 'Delete',
    name: 'delete',
    onClick: deleteRow
  },
];


const api = new Api();
const confirm = useConfirmModal();

const page = ref<number>(1);
const totalRows = ref<number>(1);
const row = ref<IUser | IUserAdd>({
  name: '',
  login: '',
  password: '',
  role: 'guest',
});
const rows = ref<IUser[]>([]);

const filter = ref<string>('');
const categoryOptions: SelectOption[] = [
  { value: 'administrator', label: 'administrator' },
  { value: 'controller', label: 'controller' },
  { value: 'guest', label: 'guest' },
];

interface option {
  label: string;
  value: string;
}

interface GroupsSelected {
  selectedGroup: option | null
}

const groups = ref<GroupsSelected[]>([]);
const groupsOptions = ref<option[]>([]);

const allowAll = ref<string>('false');
const isEditMode = ref<boolean>(false);

const showDialogSave = ref<boolean>(false);
const showDialogGroups = ref<boolean>(false);

const columns: TableColumn<IUser>[] = [
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
    name: 'login',
    align: 'left',
    label: 'Login',
    field: 'login',
    sortable: true
  },
  {
    name: 'role',
    align: 'left',
    label: 'Role',
    field: 'role',
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
  {
    name: 'allowAll',
    align: 'left',
    label: 'Allow All',
    field: (row) => `${Boolean(row.allowAll)}`,
    sortable: true
  },
];

onMounted(async () => {
  await fetchRows();
  await fetchGroups();
});

watch(filter, () => {
  page.value = 1;
  fetchRows();
});

function onLoadData(newPage: number) {
  page.value = newPage;
  fetchRows();
}

async function fetchRows() {
  try {
    const filters: Filter<IUser>[] = [];

    if (filter.value) {
      filters.push({ field: 'name', type: FilterType.FILTER_LIKE, value: filter.value });
    }

    const res = await api.user.getPaginate({
      page: page.value,
      size: 25,
      filters,
    });
    rows.value = res.data;
    totalRows.value = res.pagination.total || 0;
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
    const res = await api.group.getPaginate();

    groupsOptions.value = res.data.map((group) => ({
      label: group.name,
      value: group.id
    }));
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
    if (!row.value) {
      return;
    }

    if (isEditMode.value) {
      const user = row.value as IUser;

      await api.user.put({
        id: user.id,
        data: user
      });
    } else {
      await api.userAdd.post(row.value);
    }

    await fetchRows();
    showDialogSave.value = false;

    toast.success('<span class="nofification">Item successfuly saved.</sapn>');
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  }
}

async function saveGroups() {
  let allowAllValue = 0;
  try {
    if (!row.value) {
      return;
    }

    let groupIds = groups.value.map((g) => g.selectedGroup?.value ? g.selectedGroup.value : '');
    const uniqueIds = [...new Set(groupIds)];

    if (allowAll.value === 'true') {
      allowAllValue = 1;
      groupIds = [];
    }

    const updatedGroupData = {
      allowAll: allowAllValue,
      groups: JSON.stringify(uniqueIds)
    };

    const user = row.value as IUser;
    await api.user.put({
      id: user.id,
      data: updatedGroupData,
    })

    await fetchRows();

    toast.success('<span class="nofification">Groups successfuly saved.</sapn>');
  } catch (err) {
    const error = err as AxiosError<ErrorRequest>;
    toast.error(
      error.response && error.response.data.message
        ? '<span class="nofification">' + error.response.data.message + '</span>'
        : 'There was an error processing your request.'
    );
  } finally {
    showDialogGroups.value = false;
  }
}

async function editGroups(rowData: IUser) {
  await fetchGroups();

  row.value = { ...rowData };
  allowAll.value = rowData.allowAll ? 'true' : 'false';

  if (!rowData.groups || rowData.groups.length <= 0) {
    groups.value = [{ selectedGroup: null }];
    showDialogGroups.value = true;
    return;
  }

  const groupsIds = parseUserGroups(rowData.groups);
  groups.value = groupsIds
    .map((gId) => {
      const groupValue = groupsOptions.value.find(
        (option) => option.value === gId
      );

      return groupValue ? { selectedGroup: groupValue } : null;
    }).filter((g): g is { selectedGroup: option } => g !== null);

  showDialogGroups.value = true;
}

function newRow() {
  isEditMode.value = false;
  row.value = {
    name: '',
    login: '',
    role: 'guest',
    password: '',
  } as IUserAdd;
  showDialogSave.value = true;
}

async function deleteRow(row: IUser) {
  try {
    if (!row) return;

    const res = await confirm('', 'Are you sure you want to delete this user?');
    if (!res) return;

    await api.user.deleteById(row.id);

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

function addGroup() {
  groups.value.push({ selectedGroup: null });
}

function editRow(rowData: IUser | null = null) {
  if (rowData) {
    isEditMode.value = true;
    row.value = { ...rowData };
  }

  showDialogSave.value = true;
}

function removeGroup(index: number) {
  if (groups.value.length > 1) {
    groups.value.splice(index, 1);
  }
}

function parseUserGroups(groupsJson: string): string[] {
  if (!groupsJson) {
    return [];
  }

  try {
    return JSON.parse(groupsJson) as string[];
  } catch (_) {
    return [];
  }
}
</script>
