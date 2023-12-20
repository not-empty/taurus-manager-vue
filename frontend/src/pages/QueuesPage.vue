<template>
  <q-page padding>
    <q-dialog v-model="showDialogDeleteConfirm" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Are you sure you want to delete this item?</span
          >
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
          <q-input
            filled
            v-if="isEditMode"
            v-model="row.id"
            label="ID"
            readonly
            class="q-mb-md"
          />
          <q-input
            filled
            v-model="row.name"
            label="Name*"
            autofocus
            class="q-mb-md"
          />

          <q-select
            filled
            v-model="row.group"
            label="Group*"
            :options="groups"
            option-value="id"
            option-label="name"
            class="q-mb-md"
          />
          <q-input filled v-model="row.host" label="Host*" class="q-mb-md" />
          <q-input
            filled
            v-model="row.port"
            type="number"
            label="Port*"
            class="q-mb-md"
          />
          <q-input
            filled
            v-model="row.health_value"
            type="number"
            label="Health Value*"
            class="q-mb-md"
          />

          <q-input
            filled
            v-model="row.description"
            label="Description"
            class="q-mb-md"
          />
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

    <div
      class="q-gutter-md"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <q-input
        outlined
        v-model="filter"
        placeholder="Filter in data"
        style="max-width: 300px"
        autofocus
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-btn
        color="primary"
        :label="'New ' + entityName"
        class="q-ml-md"
        @click="newRow"
      />
    </div>
    <br />

    <q-table
      flat
      bordered
      color="primary"
      :title="entityName + 's'"
      :rows="rows"
      :columns="columns"
      :filter="filter"
      :rows-per-page-options="[15]"
      row-key="id"
    >
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

<script>
import axios from 'axios';

export default {
  data() {
    return {
      entityName: 'Queue',
      groups: [],
      showDialogSave: false,
      showDialogDeleteConfirm: false,
      itemToDelete: null,
      row: {
        name: '',
        group: '',
        host: '',
        port: '',
        health_value: ''
      },
      isEditMode: false,
      filter: '',
      rows: [],
      columns: [
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
          name: 'group',
          align: 'left',
          label: 'Group',
          field: (row) => row.group.name,
          sortable: false
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
          name: 'health_value',
          align: 'left',
          label: 'Health Val.',
          field: 'health_value',
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
      ]
    };
  },
  async mounted() {
    await this.fetchRows();
    await this.fetchGroups();
  },
  methods: {
    newRow() {
      this.isEditMode = false;
      this.row = {
        name: '',
        description: '',
        group: '',
        host: '',
        port: 6379,
        health_value: 100
      };
      this.showDialogSave = true;
    },
    editRow(rowData = null) {
      if (rowData) {
        this.isEditMode = true;
        this.row = { ...rowData, groupId: rowData.group.id };
      }
      this.showDialogSave = true;
    },
    deleteRow(row) {
      this.itemToDelete = row;
      this.showDialogDeleteConfirm = true;
    },
    async fetchRows() {
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await axios.get('http://localhost:3333/queue', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.rows = response.data.queues;
      } catch (error) {
        this.$q.notify({
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
    },
    async fetchGroups() {
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await axios.get('http://localhost:3333/group', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.groups = response.data.groups;
      } catch (error) {
        this.$q.notify({
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
    },
    async saveRow() {
      try {
        const token = sessionStorage.getItem('user-token');
        this.row.groupId = this.row.group.id;
        delete this.row['group'];
        var works = false;
        if (this.isEditMode) {
          await axios.put(
            `http://localhost:3333/queue/${this.row.id}`,
            this.row,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } else {
          await axios.post('http://localhost:3333/queue', this.row, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        works = true;
      } catch (error) {
        works = false;
        this.$q.notify({
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
        if (works) {
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message:
              '<span class="nofification">Item successfuly saved.</sapn>',
            html: true,
            timeout: 2500
          });
          await this.fetchRows();
          this.showDialogSave = false;
        }
      }
    },
    async confirmDelete() {
      try {
        const token = sessionStorage.getItem('user-token');
        var works = false;
        await axios.delete(
          `http://localhost:3333/queue/${this.itemToDelete.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        works = true;
      } catch (error) {
        this.$q.notify({
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
        if (works) {
          await this.fetchRows();
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message:
              '<span class="nofification">Item successfuly deleted.</sapn>',
            html: true,
            timeout: 2500
          });
        }
        this.showDialogDeleteConfirm = false;
      }
    }
  }
};
</script>

<style scoped></style>
