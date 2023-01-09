<template>
  <div>
    <div class="px-4 py-4">
      <span class="font-weight-bold text-h6">Dashboard</span>
    </div>
    <v-flex class="d-flex py-4 align-center mb-2 rounded">
      <v-text-field
        v-model="search"
        filled
        hide-details
        single-line
        rounded
        dense
        label="Search for groups"
        append-icon="mdi-magnify"
      />
      <v-spacer />
      <v-btn
        text
        :disabled="!jobsSelected.length"
        color="secondary"
        @click="confirmPause()"
      >
        <v-icon left>
          mdi-pause
        </v-icon>
        <span>Pause</span>
      </v-btn>
      <v-btn
        text
        :disabled="!jobsSelected.length"
        color="secondary"
        @click="confirmResume()"
      >
        <v-icon left>
          mdi-play
        </v-icon>
        <span>Resume</span>
      </v-btn>
      <v-btn text color="secondary" @click="getUpdatedData()">
        <v-icon left>
          mdi-reload
        </v-icon>
        <span>Refresh</span>
      </v-btn>
    </v-flex>
    <div v-for="group in filteredData" :key="group.group.id">
      <v-data-table
        v-model="jobsSelected"
        hide-default-footer
        show-select
        :headers="queuesHeaders"
        :items="group.queues"
        sort-by="name"
        class="accent mb-8"
        @click:row="openQueue"
      >
        <template #top>
          <p
            class="px-4 py-4 font-weight-bold text-h6"
            @click="openGroup(group.group.id)"
          >
            <span class="pointer">
              {{ group.group.name }}
            </span>
          </p>
        </template>
        <template #[`item.status`]="{ item }">
          <v-chip small :color="item.status == 'running' ? 'green' : 'yellow'">
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </div>
    <confirmation
      :state="corfirmModal"
      :function="modalFunction"
      :message="modalMessage"
      @close="corfirmModal = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import confirmation from '../../components/utilities/confirmationModal.vue';
import { DashGroup } from '~/types/group';
import { IQueue } from '~/types/queue';
export default Vue.extend({
  name: 'IndexPage',
  components: {
    confirmation
  },
  middleware: 'auth',
  data () {
    return {
      logado: '',
      jobsSelected: [] as IQueue[],
      dashboardData: [] as DashGroup[],
      filteredData: [] as DashGroup[],
      corfirmModal: false,
      modalFunction: () => {},
      modalMessage: '',
      search: '',
      queuesHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Status',
          value: 'status'
        },
        {
          text: 'Waiting',
          value: 'jobCounts.waiting'
        },
        {
          text: 'Paused',
          value: 'jobCounts.paused'
        },
        {
          text: 'Active',
          value: 'jobCounts.active'
        },
        {
          text: 'Delayed',
          value: 'jobCounts.delayed'
        },
        {
          text: 'Failed',
          value: 'jobCounts.failed'
        }
      ],
      useCards: false
    };
  },
  watch: {
    search: function () {
      this.filteredData = this.dashboardData.filter((res) => {
        return res.group.name.match(this.search);
      });
    }
  },
  created () {
    this.getUpdatedData();
  },
  methods: {
    openQueue ({ id }: IQueue) {
      this.$router.push('/dashboard/queue/' + id);
    },
    openGroup (id: string) {
      this.$router.push('/dashboard/group/' + id);
    },
    confirmPause () {
      this.modalFunction = this.pauseQueue;
      this.modalMessage = 'Pause selected queues?';
      this.corfirmModal = true;
    },
    pauseQueue () {
      this.$api.queue.pauseBulk(this.mapSelected()).then(() => {
        this.getUpdatedData();
      });
    },
    confirmResume () {
      this.modalFunction = this.resumeQueue;
      this.modalMessage = 'Resume selected queues?';
      this.corfirmModal = true;
    },
    resumeQueue () {
      this.$api.queue.resumeBulk(this.mapSelected()).then(() => {
        this.getUpdatedData();
      });
    },
    mapSelected (): string[] {
      return this.jobsSelected.map((job) => {
        return job.id;
      });
    },
    getUpdatedData () {
      this.$api.dashboard.groupDash().then((res) => {
        this.dashboardData = res;
        this.filteredData = this.dashboardData;
      });
    }
  }
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
