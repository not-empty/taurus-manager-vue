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
import sessionMixin from 'src/mixins/sessionMixin';

export default {
  mixins: [
    sessionMixin,
  ],
  data() {
    return {
      entityName: 'Group',
      showDialogSave: false,
      showDialogDeleteConfirm: false,
      itemToDelete: null,
      role: '',
      row: {
        name: '',
        description: ''
      },
      isEditMode: false,
      filter: '',
      rows: [],
      columns: [
        {
          id: 'id',
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
      ]
    };
  },
  async mounted() {
    this.role = await this.validateUserRole('administrator');
    await this.fetchRows();
  },
  methods: {
    newRow() {
      this.isEditMode = false;
      this.row = { name: '', description: '' };
      this.showDialogSave = true;
    },
    editRow(rowData = null) {
      if (rowData) {
        this.isEditMode = true;
        this.row = { ...rowData };
      }
      this.showDialogSave = true;
    },
    deleteRow(row) {
      this.itemToDelete = row;
      this.showDialogDeleteConfirm = true;
    },
    async fetchRows() {
      try {
        const response = await axios.get(
          'group'
        );
        this.rows = response.data.groups;
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
        var works = false;
        if (this.isEditMode) {
          await axios.put(
            `group/${this.row.id}`,
            this.row
          );
        } else {
          await axios.post(
            'group', this.row
          );
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
        var works = false;
        await axios.delete(
          `group/${this.itemToDelete.id}`
        );
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
