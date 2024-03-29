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
            :color="calculateActionColor(this.currentAction)"
            @click="confirmAction"
          />
        </q-card-actions>
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
          :label="group.name"
          icon="table_view"
        />
      </q-breadcrumbs>
    </div>
    <div
      class="q-gutter-md"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <q-input
        outlined
        v-model="filter"
        placeholder="Filter in queues names"
        style="max-width: 300px"
        autofocus
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div>
        <q-checkbox
          label="Select All"
          v-model="selectAll"
          @update:model-value="toggleSelectAll"
          v-if="checkPermission(this.role, 'controller')"
          class="q-mr-xl"
        />
        <q-btn
          flat
          label="Pause"
          icon="pause"
          color="primary"
          v-if="checkPermission(this.role, 'controller')"
          :disabled="selectedQueues.length === 0"
          @click="pauseSelected"
        />
        <q-btn
          flat
          label="Resume"
          icon="play_arrow"
          color="primary"
          v-if="checkPermission(this.role, 'controller')"
          :disabled="selectedQueues.length === 0"
          @click="resumeSelected"
        />
        <q-btn
          flat
          label="Refresh"
          icon="refresh"
          color="white"
          @click="fetchRows"
        />
      </div>
    </div>
    <br />
    <div class="row q-col-gutter-md">
      <div
        v-for="queue in filteredQueues"
        :key="queue.id"
        class="col-12 col-md-4 col-lg-2"
      >
        <q-card
          :class="{ 'selected-card': isSelected(queue.id) }"
          :to="{ name: 'queueDetail', params: { queueName: queue.id } }"
        >
          <q-card-section class="row items-center">
            <div class="row">
              <div class="col-12 flex">
                <q-checkbox
                  v-if="checkPermission(this.role, 'controller')"
                  :model-value="isSelected(queue.id)"
                  @update:model-value="toggleSelection(queue.id)"
                  :label="queue.name"
                  class="custom-checkbox"
                />
                <div class="text-h6" v-if="!checkPermission(this.role, 'controller')">
                  {{ queue.name }}
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="row items-center">
            <div class="row">
              <div class="col-12 flex">
                <q-badge
                  rounded
                  :color="
                    calculateHealthColor(
                      queue.health_value,
                      queue.jobCounts.waiting,
                      queue.jobCounts.paused
                    )
                  "
                  :label="queue.health_value"
                />
                <q-badge
                  class="q-ml-md"
                  rounded
                  :color="calculateStatusColor(queue.status)"
                  :label="queue.status"
                />
                <div class="q-ml-md">
                  {{ queue.jobCounts.completed }} completed
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="pending" size="1.5em" class="q-mr-md" />
                <span>Waiting:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.waiting }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="pause_circle" size="1.5em" class="q-mr-md" />
                <span>Paused:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.paused }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="play_circle" size="1.5em" class="q-mr-md" />
                <span>Active:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.active }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="update" size="1.5em" class="q-mr-md" />
                <span>Delayed:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.delayed }}</span>
              </div>
            </div>
            <div class="row">
              <div class="col-6 flex">
                <q-icon name="report" size="1.5em" class="q-mr-md" />
                <span>Error:</span>
              </div>
              <div class="col-6 flex">
                <span class="q-ml-md">{{ queue.jobCounts.failed }}</span>
              </div>
            </div>
            <div class="row justify-end q-mt-md">
              <q-btn
                flat
                label="Details"
                icon="info"
                color="white"
                :to="'/view/queue/' + queue.id"
              />
            </div>
          </q-card-section>

          <q-linear-progress
            size="10px"
            :value="
              calculateProgress(
                queue.health_value,
                queue.jobCounts.waiting,
                queue.jobCounts.paused
              )
            "
            :color="
              calculateHealthColor(
                queue.health_value,
                queue.jobCounts.waiting,
                queue.jobCounts.paused
              )
            "
            class="q-mt-md"
          />
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios';
import colorsMixin from 'src/mixins/colorsMixin';
import sessionMixin from 'src/mixins/sessionMixin';

export default {
  mixins: [
    colorsMixin,
    sessionMixin,
  ],
  data() {
    return {
      selectAll: false,
      role: '',
      filter: '',
      group: '',
      groupId: '',
      queues: [],
      selectedQueues: [],
      showDialogActionConfirm: false
    };
  },
  methods: {
    async confirmAction() {
      try {
        const selectedIds = this.selectedQueues.map((item) => item);
        const uniqueIds = [...new Set(selectedIds)];
        let data = {
          ids: uniqueIds
        };
        await axios.put(
          `queue/${this.currentAction}`,
          data
        );
        this.clearSelection();
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
      await this.fetchRows();
      this.showDialogActionConfirm = false;
    },
    clearSelection() {
      this.selectedQueues = [];
      this.selectAll = false;
    },
    pauseSelected() {
      if (this.selectedQueues.length > 0) {
        this.currentAction = 'pause';
        this.showDialogActionConfirm = true;
      }
    },
    resumeSelected() {
      if (this.selectedQueues.length > 0) {
        this.currentAction = 'resume';
        this.showDialogActionConfirm = true;
      }
    },
    isSelected(queueId) {
      return this.selectedQueues.includes(queueId);
    },
    toggleSelectAll(value) {
      if (value) {
        const filteredIds = this.filteredQueues.map((queue) => queue.id);
        this.selectedQueues = [...new Set(filteredIds)];
      } else {
        this.selectedQueues = [];
      }
    },
    toggleSelection(queueId) {
      const index = this.selectedQueues.indexOf(queueId);
      if (index === -1) {
        this.selectedQueues.push(queueId);
      } else {
        this.selectedQueues.splice(index, 1);
      }
      this.selectAll = this.queues.length === this.selectedQueues.length;
    },
    async fetchRows() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_URL}/group/dashboard/${this.groupId}`
        );
        this.group = response.data.group;
        this.queues = response.data.queues;
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
    }
  },
  async mounted() {
    this.role = await this.validateUser();
    this.groupId = this.$route.params.uuid;
    await this.fetchRows();
  },
  watch: {
    selectedQueues: {
      handler() {
        const allSelected = this.queues.every((queue) =>
          this.selectedQueues.includes(queue.id)
        );
        const anySelected = this.queues.some((queue) =>
          this.selectedQueues.includes(queue.id)
        );

        this.selectAll = allSelected ? true : anySelected ? null : false;
      },
      deep: true,
      immediate: true
    },
    filteredQueues: {
      handler(filtered) {
        const allSelected = filtered.every((queue) => queue.selected);
        const anySelected = filtered.some((queue) => queue.selected);

        this.selectAll = allSelected ? true : anySelected ? null : false;
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    filteredQueues() {
      if (!this.filter) {
        return this.queues;
      }
      const filterLower = this.filter.toLowerCase();
      return this.queues.filter((queue) =>
        queue.name.toLowerCase().includes(filterLower)
      );
    },
  }
};
</script>

<style scoped></style>
