<template v-if="!loading">
  <q-page padding>
    <q-dialog v-model="showDialogActionConfirm" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">
            Are you sure you want to {{ currentAction }} this queue?
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

    <q-dialog v-model="showDialogDeleteConfirm" class="crud-dialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >Are you sure you want to delete all the selected itens?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="createJobModalOpen" class="crud-dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="margin-bottom: 10px">Create New Job</div>
          <div class="q-pa-md">
            <q-input
              v-model="jobJson"
              filled
              type="textarea"
              autogrow
              placeholder="Enter JSON here"
            />
          </div>
          <div v-if="jsonError" class="text-negative">Invalid JSON</div>
          <div v-if="!jsonError" class="text-primary">valid JSON</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            @click="closeCreateJobModal"
          />
          <q-btn
            flat
            label="Create"
            color="positive"
            @click="createJob"
            :disabled="jsonError"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="payloadJobModalOpen" class="job-dialog">
      <q-card>
        <div
          class="q-gutter-md"
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <q-card-actions class="text-h6 q-pa-md q-pl-lg q-pt-lg" align="left">
            Job Information
          </q-card-actions>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              @click="closePayloadJobModal"
            />

            <q-btn
              flat
              label="Retry"
              icon="replay"
              color="white"
              class="q-ml-xl"
              @click="retryOneJob(jobData.id)"
              v-if="
                this.jobData.state === 'failed' && hasPermission('controller')
              "
            />

            <q-btn
              flat
              label="Clone"
              icon="content_copy"
              color="white"
              class="q-ml-xl"
              @click="cloneOneJob(jobData.id)"
              v-if="
                this.jobData.state === 'completed' &&
                hasPermission('controller')
              "
            />
          </q-card-actions>
        </div>

        <q-card-section>
          <q-input
            filled
            v-model="jobData.id"
            label="ID"
            readonly
            class="q-mb-md"
          />

          <q-input
            filled
            v-model="jobData.state"
            label="Status"
            readonly
            class="q-mb-md"
          />

          <q-input
            filled
            v-model="jobData.attemptsMade"
            label="Attempts Made"
            readonly
            class="q-mb-md"
          />

          <q-input
            v-model="jobData.data"
            filled
            label="Data"
            type="textarea"
            class="q-mb-md"
            autogrow
            readonly
          />

          <q-input
            v-model="jobData.failedReason"
            filled
            label="Failed Reason"
            type="textarea"
            class="q-mb-md"
            autogrow
            readonly
          />

          <q-input
            v-model="jobData.stacktrace"
            filled
            label="Trace"
            type="textarea"
            class="q-mb-md"
            autogrow
            readonly
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-pa-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el
          class="breadcrumb-white"
          label="Dashboard"
          icon="dashboard"
          to="/view/dashboard"
        />
        <q-breadcrumbs-el
          class="breadcrumb-white"
          :label="this.group.name"
          icon="table_view"
          :to="'/view/group/' + this.group.id"
        />
        <q-breadcrumbs-el
          class="breadcrumb-white"
          :label="this.dash.name"
          icon="dynamic_feed"
        />
      </q-breadcrumbs>
    </div>

    <div
      class="q-gutter-md"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div class="text-h4 q-ml-lg">
        {{ this.dash.name }}
        <q-chip
          :color="
            getHealthColor(
              this.dash.health_value,
              this.jobCounts.waiting,
              this.jobCounts.paused
            )
          "
        >
          {{ this.dash.health_value }}
        </q-chip>
        <q-chip :color="getStatusColor(this.dash.status)">
          {{ this.dash.status }}
        </q-chip>
      </div>
      <div>
        <q-btn
          flat
          label="Refresh"
          icon="refresh"
          color="white"
          @click="refreshAllData"
        />
        <q-btn
          flat
          label="Create Job"
          icon="add_circle"
          color="white"
          v-if="hasPermission('controller')"
          @click="openCreateJobModal"
        />
        <q-btn
          flat
          v-if="this.dash.status === 'running' && hasPermission('controller')"
          label="Pause"
          icon="pause"
          color="primary"
          class="q-ml-xl"
          @click="pauseSelected"
        />
        <q-btn
          flat
          v-if="this.dash.status === 'paused' && hasPermission('controller')"
          label="Resume"
          icon="play_arrow"
          color="primary"
          @click="resumeSelected"
        />
        <q-btn
          flat
          v-if="this.typeParam === 'failed' && hasPermission('controller')"
          label="Retry"
          icon="replay"
          color="white"
          class="q-ml-xl"
          :disabled="selected.length === 0"
          @click="retrySelected"
        />
        <q-btn
          flat
          v-if="this.typeParam === 'failed' && hasPermission('administrator')"
          label="Retry All"
          icon="replay"
          color="white"
          :disabled="rows.length === 0"
          @click="retryAll"
        />
        <q-btn
          flat
          label="Remove"
          icon="delete_forever"
          color="red"
          class="q-ml-xl"
          v-if="hasPermission('administrator')"
          :disabled="selected.length === 0"
          @click="deleteRows"
        />
      </div>
    </div>

    <div class="tabs-container q-mt-lg">
      <div
        class="tab amount-container"
        :class="{
          'tab-active': listSelection === 'waiting-tab',
          'tab-hover': hoveredTab === 'waiting-tab'
        }"
        @click="selectTab('waiting-tab')"
        @mouseover="hoverTab('waiting-tab')"
        @mouseleave="hoverTab(null)"
      >
        Waiting
        <br />
        <span>{{ this.jobCounts.waiting }}</span>
      </div>

      <div
        class="tab amount-container"
        :class="{
          'tab-active': listSelection === 'paused-tab',
          'tab-hover': hoveredTab === 'paused-tab'
        }"
        @click="selectTab('paused-tab')"
        @mouseover="hoverTab('paused-tab')"
        @mouseleave="hoverTab(null)"
      >
        Paused
        <br />
        <span>{{ this.jobCounts.paused }}</span>
      </div>

      <div
        class="tab amount-container"
        :class="{
          'tab-active': listSelection === 'active-tab',
          'tab-hover': hoveredTab === 'active-tab'
        }"
        @click="selectTab('active-tab')"
        @mouseover="hoverTab('active-tab')"
        @mouseleave="hoverTab(null)"
      >
        Active
        <br />
        <span>{{ this.jobCounts.active }}</span>
      </div>

      <div
        class="tab amount-container"
        :class="{
          'tab-active': listSelection === 'delayed-tab',
          'tab-hover': hoveredTab === 'delayed-tab'
        }"
        @click="selectTab('delayed-tab')"
        @mouseover="hoverTab('delayed-tab')"
        @mouseleave="hoverTab(null)"
      >
        Delayed
        <br />
        <span>{{ this.jobCounts.delayed }}</span>
      </div>

      <div
        class="tab amount-container"
        :class="{
          'tab-active': listSelection === 'failed-tab',
          'tab-hover': hoveredTab === 'failed-tab'
        }"
        @click="selectTab('failed-tab')"
        @mouseover="hoverTab('failed-tab')"
        @mouseleave="hoverTab(null)"
      >
        Failed
        <br />
        <span>{{ this.jobCounts.failed }}</span>
      </div>

      <div
        class="tab amount-container"
        :class="{
          'tab-active': listSelection === 'completed-tab',
          'tab-hover': hoveredTab === 'completed-tab'
        }"
        @click="selectTab('completed-tab')"
        @mouseover="hoverTab('completed-tab')"
        @mouseleave="hoverTab(null)"
      >
        Completed
        <br />
        <span>{{ this.jobCounts.completed }}</span>
      </div>
    </div>

    <q-linear-progress
      size="10px"
      :value="
        getProgress(
          this.dash.health_value,
          this.jobCounts.waiting,
          this.jobCounts.paused
        )
      "
      :color="
        getHealthColor(
          this.dash.health_value,
          this.jobCounts.waiting,
          this.jobCounts.paused
        )
      "
      class="q-mt-md"
    />

    <q-table
      flat
      bordered
      color="primary"
      class="limited-table"
      ref="tableRef"
      :title="this.typeParam"
      :rows="rows"
      :columns="columns"
      v-model:pagination="pagination"
      :rows-per-page-options="[25, 100]"
      row-key="id"
      selection="multiple"
      @selection="handleSelection"
      v-model:selected="selected"
      @request="request"
      :loading="loading"
    >
      <template v-slot:body-cell-id="props">
        <q-td :props="props">
          <div
            @click="openPayloadJobModal(props.row.id)"
            class="cursor-pointer"
          >
            {{ props.row.id }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div
            @click="openPayloadJobModal(props.row.id)"
            class="cursor-pointer"
          >
            {{ props.row.name }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-attemptsMade="props">
        <q-td :props="props">
          <div
            @click="openPayloadJobModal(props.row.id)"
            class="cursor-pointer"
          >
            {{ props.row.attemptsMade }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          <div
            @click="openPayloadJobModal(props.row.id)"
            class="cursor-pointer"
          >
            {{ props.row.createdAt }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-processedAt="props">
        <q-td :props="props">
          <div
            @click="openPayloadJobModal(props.row.id)"
            class="cursor-pointer"
          >
            {{ props.row.processedAt }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-finishedAt="props">
        <q-td :props="props">
          <div
            @click="openPayloadJobModal(props.row.id)"
            class="cursor-pointer"
          >
            {{ props.row.finishedAt }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            icon="data_object"
            @click="openPayloadJobModal(props.row.id)"
          >
            <q-tooltip> Job Information </q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:header-selection="scope">
        <q-checkbox
          v-if="hasPermission('controller')"
          v-model="scope.selected"
        />
      </template>

      <template v-slot:body-selection="scope">
        <q-checkbox
          v-if="hasPermission('controller')"
          :model-value="scope.selected"
          @update:model-value="
            (val, evt) => {
              Object.getOwnPropertyDescriptor(scope, 'selected').set(val, evt);
            }
          "
        />
      </template>
    </q-table>

    <div class="text-subtitle1 q-pa-sm">
      Use <kbd>SHIFT</kbd> to select / deselect a range and <kbd>CTRL</kbd> to
      add to selection
    </div>
  </q-page>
</template>

<script>
import { ref, toRaw, nextTick } from 'vue';
import { store, initializeStore } from 'src/store';
import { checkPermission } from 'src/utils/permissions';
import {
  calculateHealthColor,
  calculateStatusColor,
  calculateActionColor,
  calculateProgress
} from 'src/utils/colors';

export default {
  data() {
    return {
      loading: true,
      createJobModalOpen: false,
      payloadJobModalOpen: false,
      jobJson: '',
      jobData: [],
      jsonError: false,
      typeParam: '',
      jobCounts: {},
      queueId: '',
      listSelection: 'waiting-tab',
      hoveredTab: null,
      currentAction: '',
      showDialogActionConfirm: false,
      showDialogDeleteConfirm: false,
      row: {
        name: '',
        group: '',
        host: '',
        port: '',
        health_value: ''
      },
      dash: {},
      group: {},
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
          name: 'attemptsMade',
          align: 'left',
          label: 'Attempts',
          field: 'attemptsMade',
          sortable: true
        },
        {
          name: 'createdAt',
          align: 'left',
          label: 'Created At',
          field: 'createdAt',
          sortable: true
        },
        {
          name: 'processedAt',
          align: 'left',
          label: 'Processed At',
          field: 'processedAt',
          sortable: true
        },
        {
          name: 'finishedAt',
          align: 'left',
          label: 'finished At',
          field: 'finishedAt',
          sortable: true
        },
        {
          name: 'actions',
          label: 'Actions',
          field: 'actions',
          align: 'center',
          sortable: false
        }
      ],
      pagination: {
        page: 1,
        rowsPerPage: 25,
        rowsNumber: 0
      },
      maxPages: 1
    };
  },
  setup() {
    const tableRef = ref();
    const selected = ref([]);
    let storedSelectedRow;

    return {
      tableRef,
      selected,

      handleSelection({ rows, added, evt }) {
        if (rows.length !== 1 || evt === void 0) {
          return;
        }

        const oldSelectedRow = storedSelectedRow;
        const [newSelectedRow] = rows;
        const { ctrlKey, shiftKey } = evt;

        if (shiftKey !== true) {
          storedSelectedRow = newSelectedRow;
        }
        nextTick(() => {
          if (shiftKey === true) {
            const tableRows = tableRef.value.filteredSortedRows;
            let firstIndex = tableRows.indexOf(oldSelectedRow);
            let lastIndex = tableRows.indexOf(newSelectedRow);

            if (firstIndex < 0) {
              firstIndex = 0;
            }

            if (firstIndex > lastIndex) {
              [firstIndex, lastIndex] = [lastIndex, firstIndex];
            }

            const rangeRows = tableRows.slice(firstIndex, lastIndex + 1);
            const selectedRows = selected.value.map(toRaw);

            selected.value =
              added === true
                ? selectedRows.concat(
                    rangeRows.filter(
                      (row) => selectedRows.includes(row) === false
                    )
                  )
                : selectedRows.filter(
                    (row) => rangeRows.includes(row) === false
                  );
          } else if (ctrlKey !== true && added === true) {
            selected.value = [newSelectedRow];
          }
        });
      }
    };
  },
  computed: {
    getActionColor() {
      return calculateActionColor(this.currentAction);
    },
    updateListSelection() {
      const type = this.$route.query.type;
      return type ? `${type}-tab` : 'waiting-tab';
    }
  },
  watch: {
    async '$route.query.type'(newType) {
      this.typeParam = newType;
      this.listSelection = newType + '-tab';
      await this.refreshAllData();
    },
    typeParam: {
      handler() {
        this.selected = [];
      },
      immediate: true
    },
    'pagination.page': {
      handler(newPage, oldPage) {
        if (oldPage !== undefined && newPage > 0) {
          this.fetchRows();
        }
      },
      immediate: true
    },
    'pagination.rowsPerPage': function (newRowsPerPage, oldRowsPerPage) {
      if (newRowsPerPage !== oldRowsPerPage) {
        this.fetchRows();
      }
    },
    jobJson(newVal) {
      if (newVal.trim()) {
        this.validateJson();
      } else {
        this.jsonError = false;
      }
    }
  },
  async mounted() {
    initializeStore();
    this.role = store.user.role;
    this.queueId = this.$route.params.uuid;
    this.typeParam = this.$route.query.type
      ? this.$route.query.type
      : 'waiting';
    this.listSelection = this.typeParam + '-tab';
    await this.refreshAllData();
  },
  methods: {
    hasPermission(requiredRole) {
      return checkPermission(store.user.role, requiredRole);
    },
    openCreateJobModal() {
      this.createJobModalOpen = true;
    },
    async openPayloadJobModal(jobId) {
      await this.fetchJob(jobId);
      this.payloadJobModalOpen = true;
    },
    closeCreateJobModal() {
      this.createJobModalOpen = false;
      this.jobJson = '';
      this.jsonError = false;
    },
    closePayloadJobModal() {
      this.payloadJobModalOpen = false;
    },
    validateJson() {
      try {
        JSON.parse(this.jobJson);
        this.jsonError = false;
      } catch (e) {
        this.jsonError = true;
      }
    },
    async createJob() {
      this.validateJson();
      if (this.jsonError) {
        this.$q.notify({
          type: 'negative',
          position: 'top',
          message: '<span class="nofification">Invalid JSON</span>',
          html: true,
          timeout: 2500
        });
        return;
      }
      try {
        var works = false;
        const jobData = JSON.parse(this.jobJson);
        const data = {
          data: jobData
        };
        await this.$api.post(
          `queue/${this.queueId}/job`,
          data,
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
              '<span class="nofification">Item successfuly deleted.</sapn>',
            html: true,
            timeout: 2500
          });
          await this.refreshAllData();
          this.closeCreateJobModal();
        }
      }
    },
    pauseSelected() {
      this.currentAction = 'pause';
      this.showDialogActionConfirm = true;
    },
    resumeSelected() {
      this.currentAction = 'resume';
      this.showDialogActionConfirm = true;
    },
    retrySelected() {
      this.currentAction = 'retry';
      this.showDialogActionConfirm = true;
    },
    retryAll() {
      this.currentAction = 'retry all';
      this.showDialogActionConfirm = true;
    },
    cloneSelected() {
      this.currentAction = 'resume';
      this.showDialogActionConfirm = true;
    },
    async confirmAction() {
      if (this.currentAction === 'pause' || this.currentAction === 'resume') {
        await this.pauseResumeAction();
      }
      if (this.currentAction === 'retry') {
        await this.retryAction();
      }

      if (this.currentAction === 'retry all') {
        await this.retryAllJobs();
      }
    },
    async retryAction() {
      try {
        var works = false;
        const selectedIds = this.selected.map((item) => item.id);
        const uniqueIds = [...new Set(selectedIds)];
        let data = {
          jobIds: uniqueIds
        };
        await this.$api.post(
          `queue/${this.dash.id}/job/retry`,
          data,
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
          await this.refreshAllData();
          this.$q.notify({
            type: 'positive',
            position: 'top',
            message:
              '<span class="nofification">Itens successfuly retried.</sapn>',
            html: true,
            timeout: 2500
          });
        }
      }
      this.showDialogActionConfirm = false;
    },
    async pauseResumeAction() {
      var works = false;
      try {
        const data = {
          ids: [this.queueId]
        };
        await this.$api.put(
          `queue/${this.currentAction}`,
          data,
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
            message: `<span class="nofification">queue successfuly ${this.currentAction}d.</sapn>`,
            html: true,
            timeout: 2500
          });
          await this.refreshAllData();
        }
        this.showDialogActionConfirm = false;
      }
    },
    async refreshAllData() {
      try {
        await this.fetchRows();
        await this.fetchDash();
        await this.fetchGroup();
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
        this.selected = [];
        this.loading = false;
      }
    },
    updateRouteQuery(type) {
      this.$router.push({ query: { ...this.$route.query, type: type } });
    },
    getProgress(health_value, waiting, paused) {
      return calculateProgress(health_value, waiting, paused);
    },
    getHealthColor(health_value, waiting, paused) {
      return calculateHealthColor(health_value, waiting, paused);
    },
    getStatusColor(status) {
      return calculateStatusColor(status);
    },
    selectTab(tab) {
      this.listSelection = tab;
      this.updateRouteQuery(tab.replace('-tab', ''));
    },
    hoverTab(tab) {
      this.hoveredTab = tab;
    },
    deleteRows() {
      this.showDialogDeleteConfirm = true;
    },
    async request(props) {
      const { page, rowsPerPage } = props.pagination;
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
    },
    async cloneOneJob(jobId) {
      try {
        var works = false;
        await this.$api.post(`queue/${this.queueId}/job/${jobId}/clone`);
        await this.refreshAllData();
        works = true;
        this.payloadJobModalOpen = false;
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
              '<span class="nofification">Item successfuly cloned.</sapn>',
            html: true,
            timeout: 2500
          });
        }
        this.payloadJobModalOpen = false;
      }
    },
    async retryAllJobs() {
      try {
        var works = false;
        await this.$api.post(`queue/${this.queueId}/job/retry-all`);
        await this.refreshAllData();
        this.showDialogActionConfirm = false;
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
              '<span class="nofification">Itens successfuly replayed.</sapn>',
            html: true,
            timeout: 2500
          });
        }
      }
    },
    async retryOneJob(jobId) {
      try {
        var works = false;
        const data = {
          jobIds: [jobId]
        };
        await this.$api.post(
          `queue/${this.queueId}/job/retry`,
          data,
        );
        await this.refreshAllData();
        this.payloadJobModalOpen = false;
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
              '<span class="nofification">Item successfuly retried.</sapn>',
            html: true,
            timeout: 2500
          });
        }
      }
    },
    async fetchRows() {
      this.loading = true;
      try {
        const { page, rowsPerPage } = this.pagination;
        if (this.typeParam == undefined) {
          this.typeParam = 'waiting';
        }
        const response = await this.$api.get(`queue/${this.queueId}/job?state=${this.typeParam}&page=${page}&size=${rowsPerPage}`);

        this.rows = response.data.jobs;
        this.pagination.rowsNumber = response.data.total;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        throw error;
      }
    },
    async fetchDash() {
      try {
        const response = await this.$api.get(`queue/${this.queueId}/dashboard`);
        this.dash = response.data;
        this.jobCounts = response.data.jobCounts;
      } catch (error) {
        throw error;
      }
    },
    async fetchGroup() {
      try {
        const response = await this.$api.get(`group/${this.dash.groupId}`);
        this.group = response.data;
      } catch (error) {
        throw errro;
      }
    },
    async fetchJob(jobId) {
      try {
        const response = await this.$api.get(`queue/${this.queueId}/job/${jobId}`);
        this.jobData = response.data;
        this.jobData.data = JSON.stringify(this.jobData.data, null, 4);
        this.jobData.failedReason = JSON.stringify(
          this.jobData.failedReason,
          null,
          4
        );
        this.jobData.stacktrace = JSON.stringify(
          this.jobData.stacktrace,
          null,
          4
        );
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
    async confirmDelete() {
      try {
        var works = false;
        const selectedIds = this.selected.map((item) => item.id);
        const uniqueIds = [...new Set(selectedIds)];
        let data = {
          jobIds: uniqueIds
        };
        await this.$api.delete(`queue/${this.dash.id}/job`, {
          data,
        });
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
              '<span class="nofification">Itens successfuly retried.</sapn>',
            html: true,
            timeout: 2500
          });
          this.refreshAllData();
        }
      }
      this.showDialogDeleteConfirm = false;
    }
  }
};
</script>

<style scoped></style>
