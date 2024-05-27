<template>
  <q-page padding>
    <q-dialog v-model="showDialogDeleteConfirm" class="crud-dialog">
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

        <q-card-section>
          <q-input filled v-if="isEditMode" v-model="row.id" label="ID" readonly class="q-mb-md" />
          <q-input filled v-model="row.name" label="Name*" autofocus class="q-mb-md" />
          <q-input filled v-model="row.description" label="Description" class="q-mb-md" />
          <div>*Required</div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Close" color="white" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el :label="entityName + 's Data'" icon="table_view" />
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
import { Group, ListGroup } from 'src/api/types/GroupTypes';
import sessionMixin from 'src/mixins/sessionMixin';
import { onMounted, ref } from 'vue';

const { validateUserRole } = sessionMixin();

const entityName = 'Group';
const showDialogSave = ref(false);
const showDialogDeleteConfirm = ref<boolean>(false);
const itemToDelete = ref<Group | null>(null);
const role = ref('');
const row = ref({ id: '', name: '', description: '' });
const isEditMode = ref(false);
const filter = ref('');
const rows = ref<Group[]>([]);
const columns : QTableColumn[] = [
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
})

async function fetchRows() {
  try {
    const response = await axios.get<ListGroup>(
      'group'
    );
    rows.value = response.data.groups;
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

async function confirmDelete() {
  try {
    if (!itemToDelete.value) {
      return;
    }

    await axios.delete(
      `group/${itemToDelete.value.id}`
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
    showDialogDeleteConfirm.value = false;
  }
}

async function saveRow() {
  try {
    if (isEditMode.value) {
      await axios.put(
        `group/${row.value.id}`,
        row.value
      );
    } else {
      await axios.post('group', row.value);
    }

    Notify.create({
      type: 'positive',
      position: 'top',
      message:
        '<span class="nofification">Item successfuly saved.</sapn>',
      html: true,
      timeout: 2500
    });

    await fetchRows();
    showDialogSave.value = false;
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

function newRow() {
  isEditMode.value = false;
  row.value = { id: '', name: '', description: '' };
  showDialogSave.value = true;
}

function editRow(rowData : {id: string, name: string, description: string} | null = null) {
  if (rowData) {
    isEditMode.value = true;
    row.value = { ...rowData };
  }

  showDialogSave.value = true;
}

function deleteRow(row: Group) {
  itemToDelete.value = row;
  showDialogDeleteConfirm.value = true;
}
</script>
