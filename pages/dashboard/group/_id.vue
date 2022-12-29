<template>
  <div>
    <v-data-table :search="search" hide-default-footer show-select :headers="queuesHeaders" :items="dashboardData.queues"
      v-model="jobsSelected" @click:row="openQueue" sort-by="createAt" class="accent">
      <template v-slot:top>
        <div class="d-flex align-center">
          <p class="px-4 py-4 font-weight-bold text-h6">
            {{ dashboardData.group?.name }}
          </p>
          <v-spacer></v-spacer>
          <v-text-field label="Search for groups" v-model="search" append-icon="mdi-magnify"></v-text-field>
          <v-spacer></v-spacer>
          <v-btn text :disabled="!jobsSelected.length" color="secondary" @click="confirmPause()">
            <v-icon left>mdi-pause</v-icon>
            <span>Pause</span>
          </v-btn>
          <v-btn text :disabled="!jobsSelected.length" color="secondary" @click="confirmResume()">
            <v-icon left>mdi-play</v-icon>
            <span>Resume</span>
          </v-btn>
        </div>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip small :color="item.status == 'running' ? 'green' : 'yellow'">
          {{ item.status }}
        </v-chip>
      </template>
    </v-data-table>
    <confirmation :state="corfirmModal" :function="modalFunction" :mensage="modalMesage" @close="corfirmModal = false">
    </confirmation>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DashGroup } from "~/types/group";
import { IQueue } from "~/types/queue";
import confirmation from "../../../components/utilities/confirmationModal.vue"
export default Vue.extend({
  middleware: "auth",
  name: "IndexPage",
  components: {
    confirmation
  },
  data() {
    return {
      logado: "",
      dashboardData: {} as DashGroup,
      jobsSelected: [] as IQueue[],
      search: '',
      corfirmModal: false,
      modalFunction: function () { },
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
      items: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/dashboard",
        },
        {
          text: "",
          disabled: false,
          href: "",
        },
      ],
    };
  },
  created() {
    this.getUpdatedData()
  },
  methods: {
    openToPage(id: string) {
      this.$router.push("/dashboard/queue/" + id);
    },
    pauseQueue() {
      this.$api.queue.pauseBulk(this.mapSelected()).then(() => {
        this.getUpdatedData();
      });
    },
    confirmPause() {
      this.modalFunction = this.pauseQueue;
      this.modalMesage = 'Pause selected queues?';
      this.corfirmModal = true;
    },
    resumeQueue() {
      this.$api.queue.resumeBulk(this.mapSelected()).then(() => {
        this.getUpdatedData();
      });
    },
    confirmResume() {
      this.modalFunction = this.resumeQueue;
      this.modalMesage = 'Resume selected queues?';
      this.corfirmModal = true;
    },
    openQueue({ id }: IQueue) {
      this.$router.push("/dashboard/queue/" + id);
    },
    mapSelected(): string[] {
      return this.jobsSelected.map(job => {
        return job.id
      });
    },
    getUpdatedData() {
      this.$api.dashboard.groupDashById(this.$route.params.id).then((res) => {
        this.dashboardData = res;
        this.items[1].text = res.group.name;
        this.items[1].href = "/dashboard/group/" + res.group.id;
      });
    }
  },
});
</script>
