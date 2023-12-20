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
        <form @submit.prevent="handleLogin">
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
              v-model="row.login"
              label="Login*"
              class="q-mb-md"
            />
            <q-select
              filled
              v-model="row.role"
              :options="categoryOptions"
              label="Role*"
              class="q-mb-md"
            />
            <q-input
              filled
              v-model="row.password"
              type="password"
              :label="isEditMode ? 'Password' : 'Password*'"
              class="q-mb-md"
            />

            <div>*Required</div>
          </q-card-section>
        </form>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Close" color="white" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogGroups" persistent class="crud-dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="text-align: center">Manage Groups</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-sm">
            <q-input
              filled
              v-model="row.name"
              label="User"
              readonly
              class="q-mb-md"
            />
            <q-radio v-model="allowAll" val="true" autofocus label="All" />
            <q-radio v-model="allowAll" val="false" label="Some" />
          </div>
          <br />

          <transition name="fade">
            <q-card-section v-if="allowAll === 'false'" class="q-mt-md">
              <div class="manage-groups-form">
                <div
                  v-for="(group, index) in groups"
                  :key="index"
                  class="q-mb-md row items-center"
                >
                  <q-select
                    filled
                    v-model="group.selectedGroup"
                    :options="groupsOptions"
                    label="Group"
                    class="col"
                    :disable="allowAll === true"
                  />
                  <q-btn
                    flat
                    icon="remove_circle"
                    color="white"
                    @click="removeGroup(index)"
                    class="q-ml-md"
                  />
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

<script>
import axios from 'axios';

export default {
  data() {
    return {
      allowAll: 'true',
      groups: [{ selectedGroup: null }],
      groupsOptions: [],
      entityName: 'User',
      showDialogSave: false,
      dialogGroups: false,
      showDialogDeleteConfirm: false,
      itemToDelete: null,
      row: {
        name: '',
        login: '',
        role: '',
        password: '',
        allowAll: '',
        groups: ''
      },
      categoryOptions: ['administrator', 'controller', 'guest'],
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
      ]
    };
  },
  async mounted() {
    await this.fetchRows();
    await this.fetchGroups();
  },
  methods: {
    parseUserGroups(groupsJson) {
      if (!groupsJson) {
        return [];
      }

      try {
        return JSON.parse(groupsJson);
      } catch (e) {
        console.error('Error parsing groups:', e);
        return [];
      }
    },
    addGroup() {
      this.groups.push({ selectedGroup: null });
    },
    removeGroup(index) {
      if (this.groups.length > 1) {
        this.groups.splice(index, 1);
      }
    },
    newRow() {
      this.isEditMode = false;
      this.row = { name: '', login: '', role: '', password: '' };
      this.showDialogSave = true;
    },
    editRow(rowData = null) {
      if (rowData) {
        this.isEditMode = true;
        this.row = { ...rowData };
      }
      this.showDialogSave = true;
    },
    editGroups(rowData) {
      this.fetchGroups().then(() => {
        this.row = { ...rowData };
        this.allowAll = rowData.allowAll ? 'true' : 'false';

        if (rowData.groups && rowData.groups.length > 0) {
          const userGroupIds = this.parseUserGroups(rowData.groups);
          this.groups = userGroupIds
            .map((groupId) => {
              const groupsOptions = this.groupsOptions.find(
                (option) => option.value === groupId
              );
              return groupsOptions ? { selectedGroup: groupsOptions } : null;
            })
            .filter((group) => group !== null);
        } else {
          this.groups = [{ selectedGroup: null }];
        }
        this.dialogGroups = true;
      });
    },
    deleteRow(row) {
      this.itemToDelete = row;
      this.showDialogDeleteConfirm = true;
    },
    async fetchRows() {
      try {
        const token = sessionStorage.getItem('user-token');
        const response = await axios.get('http://localhost:3333/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.rows = response.data.users;
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
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.groupsOptions = response.data.groups.map((group) => ({
          label: group.name,
          value: group.id
        }));
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
        var works = false;
        if (this.isEditMode) {
          await axios.put(
            `http://localhost:3333/user/${this.row.id}`,
            this.row,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
        } else {
          await axios.post('http://localhost:3333/user', this.row, {
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
    async saveGroups() {
      let allowAllValue = 0;
      var works = false;
      try {
        let groupIds = this.groups.map((group) => group.selectedGroup.value);
        const uniqueIds = [...new Set(groupIds)];
        if (this.allowAll === 'true') {
          allowAllValue = 1;
          groupIds = '[]';
        }
        const updatedGroupData = {
          allowAll: allowAllValue,
          groups: JSON.stringify(uniqueIds)
        };
        const token = sessionStorage.getItem('user-token');
        const userId = this.row.id;
        await axios.put(
          `http://localhost:3333/user/${userId}`,
          updatedGroupData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
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
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message:
              '<span class="nofification">Groups successfuly saved.</sapn>',
            html: true,
            timeout: 2500
          });
          await this.fetchRows();
          this.dialogGroups = false;
        }
      }
    },
    async confirmDelete() {
      try {
        const token = sessionStorage.getItem('user-token');
        var works = false;
        await axios.delete(
          `http://localhost:3333/user/${this.itemToDelete.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
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
