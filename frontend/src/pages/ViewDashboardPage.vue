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
          <q-btn
            flat
            :label="currentAction"
            :color="getActionColor"
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Dashboard" icon="dashboard" />
      </q-breadcrumbs>
    </div>

    <div
      class="q-gutter-md"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <q-input
        outlined
        v-model="filter"
        placeholder="Filter in queues"
        style="max-width: 300px"
        autofocus
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div>
        <q-btn
          flat
          label="Refresh"
          icon="refresh"
          color="white"
          @click="fetchRows"
        />
        <q-btn
          flat
          label="Pause"
          icon="pause"
          color="primary"
          class="q-ml-xl"
          v-if="hasPermission('controller')"
          :disabled="selected.length === 0"
          @click="pauseSelected"
        />
        <q-btn
          flat
          label="Resume"
          icon="play_arrow"
          color="primary"
          v-if="hasPermission('controller')"
          :disabled="selected.length === 0"
          @click="resumeSelected"
        />
      </div>
    </div>

    <div v-for="group in filteredGroups" :key="group.group">
      <div
        v-if="group.queues.length > 0"
        class="text-h6 q-my-md q-mt-xl cursor-pointer"
        @click="openGroup(group.group)"
      >
        <q-icon name="table_view" size="1em" />
        {{ group.queues[0].group.name }}
      </div>
      <div v-if="group.queues.length > 0">
        <q-table
          flat
          bordered
          color="primary"
          :rows="group.queues"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[10000]"
          selection="multiple"
          v-model:selected="selected"
          :hide-bottom="true"
          :loading="loading"
        >
          <template v-slot:header-cell-health_value="props">
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
            <q-checkbox
              v-model="scope.selected"
              v-if="hasPermission('controller')"
            />
          </template>

          <template v-slot:body-selection="scope">
            <q-checkbox
              v-if="hasPermission('controller')"
              :model-value="scope.selected"
              @update:model-value="
                (val, evt) => {
                  Object.getOwnPropertyDescriptor(scope, 'selected').set(
                    val,
                    evt
                  );
                }
              "
            />
          </template>

          <template v-slot:body-cell-health_value="props">
            <q-td :props="props">
              <div @click="onRowClick(props.row.id)" class="cursor-pointer">
                <q-chip
                  :color="
                    getHealthColor(
                      props.row.health_value,
                      props.row.jobCounts.waiting,
                      props.row.jobCounts.paused
                    )
                  "
                >
                  Max: {{ props.row.health_value }}
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
                <q-chip :color="getStatusColor(props.row.status)">
                  {{ props.row.status.substring(0, 1).toUpperCase() }}
                </q-chip>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-waiting="props">
            <q-td :props="props">
              <div
                @click="onRowClickType(props.row.id, 'waiting')"
                class="cursor-pointer"
              >
                {{ props.row.jobCounts.waiting }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-paused="props">
            <q-td :props="props">
              <div
                @click="onRowClickType(props.row.id, 'paused')"
                class="cursor-pointer"
              >
                {{ props.row.jobCounts.paused }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-active="props">
            <q-td :props="props">
              <div
                @click="onRowClickType(props.row.id, 'active')"
                class="cursor-pointer"
              >
                {{ props.row.jobCounts.active }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-delayed="props">
            <q-td :props="props">
              <div
                @click="onRowClickType(props.row.id, 'delayed')"
                class="cursor-pointer"
              >
                {{ props.row.jobCounts.delayed }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-failed="props">
            <q-td :props="props">
              <div
                @click="onRowClickType(props.row.id, 'failed')"
                class="cursor-pointer"
              >
                {{ props.row.jobCounts.failed }}
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { store, initializeStore } from 'src/store';
import { checkPermission } from 'src/utils/permissions';
import {
  calculateHealthColor,
  calculateStatusColor,
  calculateActionColor
} from 'src/utils/colors';

export default {
  data() {
    return {
      loading: false,
      role: '',
      groups: [],
      selectedGroups: [{ selectedGroup: null }],
      showDialogActionConfirm: false,
      currentAction: '',
      filter: '',
      rows: [],
      columns: [
        {
          name: 'health_value',
          align: 'center',
          label: 'Health',
          field: 'health_value',
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
          field: (row) => row.jobCounts.waiting,
          sortable: true
        },
        {
          name: 'paused',
          align: 'center',
          label: 'Paused',
          field: (row) => row.jobCounts.paused,
          sortable: true
        },
        {
          name: 'active',
          align: 'center',
          label: 'Active',
          field: (row) => row.jobCounts.active,
          sortable: true
        },
        {
          name: 'delayed',
          align: 'center',
          label: 'Delayed',
          field: (row) => row.jobCounts.delayed,
          sortable: true
        },
        {
          name: 'failed',
          align: 'center',
          label: 'Failed',
          field: (row) => row.jobCounts.failed,
          sortable: true
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          sortable: true
        }
      ]
    };
  },
  setup() {
    const selected = ref([]);
    return {
      selected
    };
  },
  async mounted() {
    initializeStore();
    this.role = store.user.role;
    await this.fetchRows();
  },
  methods: {
    hasPermission(requiredRole) {
      return checkPermission(store.user.role, requiredRole);
    },
    openGroup(id) {
      this.$router.push(`/view/group/${id}`);
    },
    pauseSelected() {
      if (this.selected.length > 0) {
        this.currentAction = 'pause';
        this.showDialogActionConfirm = true;
      }
    },
    resumeSelected() {
      if (this.selected.length > 0) {
        this.currentAction = 'resume';
        this.showDialogActionConfirm = true;
      }
    },
    async confirmAction() {
      var works = false;
      try {
        const selectedIds = this.selected.map((item) => item.id);
        const uniqueIds = [...new Set(selectedIds)];
        let data = {
          ids: uniqueIds
        };
        await this.$api.put(
          `queue/${this.currentAction}`,
          data,
        );
        works = true;
      } catch (error) {
        works = false;
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
            message: `<span class="nofification">Itens successfuly ${this.currentAction}d.</sapn>`,
            html: true,
            timeout: 2500
          });
          await this.fetchRows();
        }
        this.showDialogActionConfirm = false;
      }
    },
    getHealthColor(health_value, waiting, paused) {
      return calculateHealthColor(health_value, waiting, paused);
    },
    getStatusColor(status) {
      return calculateStatusColor(status);
    },
    onRowClick(id) {
      this.$router.push(`/view/queue/${id}`);
    },
    onRowClickType(id, type) {
      this.$router.push(`/view/queue/${id}?type=${type}`);
    },
    async fetchRows() {
      this.loading = true;
      try {
        const response = await this.$api.get('group/dashboard');
        this.groups = response.data;
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
        this.loading = false;
      }
    }
  },
  computed: {
    filteredGroups() {
      if (!this.filter) {
        return this.groups;
      }
      return this.groups
        .map((group) => {
          return {
            ...group,
            queues: group.queues.filter((queue) => {
              return queue.name
                .toLowerCase()
                .includes(this.filter.toLowerCase());
            })
          };
        })
        .filter((group) => group.queues.length > 0);
    },
    getActionColor() {
      return calculateActionColor(this.currentAction);
    }
  }
};
</script>

<style scoped></style>
