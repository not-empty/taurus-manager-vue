<template>
  <div>
    <v-sheet class="d-flex px-4 py-4 accent align-center mb-2">
      <span class="font-weight-bold text-h6">Dashboard</span>
      <v-spacer></v-spacer>
      <v-btn
        text
        :disabled="!jobsSelected.length"
        color="secondary"
        @click="confirmPause()"
      >
        <v-icon left>mdi-pause</v-icon>
        <span>Pause</span>
      </v-btn>
      <v-btn
        text
        :disabled="!jobsSelected.length"
        color="secondary"
        @click="confirmResume()"
      >
        <v-icon left>mdi-play</v-icon>
        <span>Resume</span>
      </v-btn>
    </v-sheet>
    <div v-for="group in dashboardData" :key="group.group.id">
      <v-data-table
        hide-default-footer
        show-select
        v-model="jobsSelected"
        :headers="queuesHeaders"
        :items="group.queues"
        sort-by="name"
        class="accent mb-8"
        @click:row="openQueue"
      >
        <template v-slot:top>
          <p
            class="px-4 py-4 font-weight-bold text-h6"
            @click="openGroup(group.group.id)"
          >
            {{ group.group.name }}
          </p>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status == 'running' ? 'green' : 'yellow'">
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </div>
    <confirmation :state="corfirmModal" :function="modalFunction" :mensage="modalMesage" @close="corfirmModal = false"></confirmation>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DashGroup } from "~/types/group";
import { IJob } from "~/types/job";
import { IQueue } from "~/types/queue";
import confirmation from "../../components/utilities/confirmationModal.vue"
export default Vue.extend({
  middleware: "auth",
  name: "IndexPage",
  components: {
    confirmation
  },
  data() {
    return {
      logado: "",
      jobsSelected: [] as IQueue[],
      dashboardData: [] as DashGroup[],
      corfirmModal: false,
      modalFunction: function(){},
      modalMesage: '',
      queuesHeaders: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Status",
          value: "status",
        },
        {
          text: "Waiting",
          value: "jobCounts.waiting",
        },
        {
          text: "Paused",
          value: "jobCounts.paused",
        },
        {
          text: "Active",
          value: "jobCounts.active",
        },
        {
          text: "Delayed",
          value: "jobCounts.delayed",
        },
        {
          text: "Failed",
          value: "jobCounts.failed",
        },
      ],
      useCards: false,
    };
  },
  async created() {
    this.getUpdatedData()
  },
  methods: {
    openQueue({ id }: IQueue) {
      this.$router.push("/dashboard/queue/" + id);
    },
    openGroup(id: string) {
      this.$router.push("/dashboard/group/" + id);
    },
    confirmPause(){
      this.modalFunction = this.pauseQueue;
      this.modalMesage = 'Pause selected queues?';
      this.corfirmModal = true;
    },
    pauseQueue() {
      this.$api.queue.pauseBulk(this.mapSelected()).then(() => {
        this.getUpdatedData()
      });
    },
    confirmResume() {
      this.modalFunction = this.resumeQueue;
      this.modalMesage = 'Resume selected queues?';
      this.corfirmModal = true;
    },
    resumeQueue() {
      this.$api.queue.resumeBulk(this.mapSelected()).then(() => {
        this.getUpdatedData()
      });
    },
    mapSelected(): string[] {
      return this.jobsSelected.map(job => {
        return job.id
      });
    },
    getUpdatedData() {
      this.$api.dashboard.groupDash().then((res) => {
        this.dashboardData = res;
      });
    }
  },
});
</script>
