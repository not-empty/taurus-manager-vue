<template>
  <q-page padding>
    <q-dialog v-model="showDialogDelete" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Are you sure you want to delete this item?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialogSave" persistent class="crud-dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="text-align: center">
            {{ isEditMode ? 'Edit ' + entityName : 'New ' + entityName }}
          </div>
        </q-card-section>
        <form>
          <q-card-section>
            <q-input filled v-if="isEditMode" v-model="row.id" label="ID" readonly class="q-mb-md" />
            <q-input filled v-model="row.name" label="Name*" autofocus class="q-mb-md" />
            <q-input filled v-model="row.login" label="Login*" class="q-mb-md" />
            <q-select filled v-model="row.role" :options="categoryOptions" label="Role*" class="q-mb-md" />
            <q-input filled v-model="row.password" type="password" :label="isEditMode ? 'Password' : 'Password*'"
              class="q-mb-md" />

            <div>*Required</div>
          </q-card-section>
        </form>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Close" color="white" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDialogGroups" persistent class="crud-dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="text-align: center">Manage Groups</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-sm">
            <q-input filled v-model="row.name" label="User" readonly class="q-mb-md" />
            <q-radio v-model="allowAll" val="true" autofocus label="All" />
            <q-radio v-model="allowAll" val="false" label="Some" />
          </div>
          <br />

          <transition name="fade">
            <q-card-section v-if="allowAll === 'false'" class="q-mt-md">
              <div class="manage-groups-form">
                <div v-for="(group, index) in groups" :key="index" class="q-mb-md row items-center">
                  <q-select filled v-model="group.selectedGroup" :options="groupsOptions" label="Group" class="col" />
                  <q-btn flat icon="remove_circle" color="white" @click="removeGroup(index)" class="q-ml-md" />
                </div>
              </div>

              <div class="q-mb-md">
                <q-btn flat label="Add Group" icon="add" @click="addGroup" />
              </div>
            </q-card-section>
          </transition>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Close" color="white" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveGroups" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el :label="entityName + 's Data'" icon="group" />
      </q-breadcrumbs>
    </div>

    <div class="q-gutter-md" style="display: flex; justify-content: space-between; align-items: center">
      <q-input outlined v-model="filter" placeholder="Filter in data" style="max-width: 300px" autofocus>
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn color="primary" :label="'New ' + entityName" class="q-ml-md" @click="newRow" />
    </div>
    <br />

    <q-table flat bordered color="primary" :title="entityName + 's'" :rows="rows" :columns="columns" :filter="filter"
      :rows-per-page-options="[15]" row-key="id">
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat icon="edit" @click="editRow(props.row)">
            <q-tooltip> Edit row </q-tooltip>
          </q-btn>
          <q-btn flat icon="table_view" @click="editGroups(props.row)">
            <q-tooltip> Edit groups </q-tooltip>
          </q-btn>
          <q-btn flat icon="delete" @click="deleteRow(props.row)">
            <q-tooltip> Delete row </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import axios, { AxiosError } from 'axios';
import { Notify, QTableColumn } from 'quasar';
import { errorRequest } from 'src/api/types';
import { ListGroup } from 'src/api/types/GroupTypes';
import { ListUsers, User, newUser } from 'src/api/types/UsersTypes';
import sessionMixin from 'src/mixins/sessionMixin';
import { ref, onMounted } from 'vue';

const { validateUserRole } = sessionMixin();

const entityName = 'User';
const role = ref<string>('');

const row = ref<User | newUser>({
  name: '',
  login: '',
  password: '',
  role: '',
} as newUser);
const rows = ref<User[]>([]);
const itemToDelete = ref<User | null>(null);

const filter = ref<string>('');
const categoryOptions = ['administrator', 'controller', 'guest'];

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
const showDialogDelete = ref<boolean>(false);

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
    name: 'lofin',
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
    field: 'allowAll',
    format: (val) => `${Boolean(val)}`,
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
  role.value = await validateUserRole('administrator');
  await fetchRows();
  await fetchGroups();
});

async function fetchRows() {
  try {
    const response = await axios.get<ListUsers>(
      'user'
    );

    rows.value = response.data.users;
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

async function fetchGroups() {
  try {
    const response = await axios.get<ListGroup>(
      'group'
    );

    groupsOptions.value = response.data.groups.map((group) => ({
      label: group.name,
      value: group.id
    }));
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

async function saveRow() {
  try {
    if (!row.value) {
      return;
    }

    if (isEditMode.value) {
      const user = row.value as User;
      await axios.put(
        `user/${user.id}`,
        user
      );
    } else {
      await axios.post(
        'user',
        row.value
      );
    }

    await fetchRows();
    showDialogSave.value = false;

    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Item successfuly saved.</sapn>',
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

    const user = row.value as User;
    await axios.put(
      `user/${user.id}`,
      updatedGroupData
    );

    await fetchRows();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Groups successfuly saved.</sapn>',
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
    showDialogGroups.value = false;
  }
}

async function confirmDelete() {
  try {
    if (!itemToDelete.value) {
      return;
    }

    await axios.delete(
      `user/${itemToDelete.value.id}`
    );

    await fetchRows();
    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Item successfuly deleted.</sapn>',
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
    showDialogDelete.value = false;
  }
}

function newRow() {
  isEditMode.value = false;
  row.value = {
    name: '',
    login: '',
    role: '',
    password: ''
  } as newUser;
  showDialogSave.value = true;
}

function deleteRow(row: User) {
  itemToDelete.value = row;
  showDialogDelete.value = true;
}

async function editGroups(rowData: User) {
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

function addGroup() {
  groups.value.push({ selectedGroup: null });
}

function editRow(rowData: User | null = null) {
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

<style scoped></style>
