<template>
  <div>
    <v-sheet class="d-flex px-4 py-4 accent align-center mb-2">
      <span class="font-weight-bold text-h6">Dashboard</span>
      <v-spacer></v-spacer>
      <v-btn
        text
        :disabled="!jobsSelected.length"
        color="secondary"
        @click="pauseQueue"
      >
        <v-icon left>mdi-pause</v-icon>
        <span>Pause</span>
      </v-btn>
      <v-btn
        text
        :disabled="!jobsSelected.length"
        color="secondary"
        @click="pauseQueue"
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
          <v-chip small color="green">
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DashGroup } from "~/types/group";
import { IQueue } from "~/types/queue";
export default Vue.extend({
  middleware: "auth",
  name: "IndexPage",
  data() {
    return {
      logado: "",
      jobsSelected: [] as string[],
      dashboardData: [] as DashGroup[],
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
    this.dashboardData = await this.$api.dashboard.groupDash();
  },
  methods: {
    openQueue({ id }: IQueue) {
      this.$router.push("/dashboard/queue/" + id);
    },
    openGroup(id: string) {
      this.$router.push("/dashboard/group/" + id);
    },
    pauseQueue() {
      this.$api.queue.pauseBulk(this.jobsSelected);
    },
    resumeQueue() {
      this.$api.queue.resumeBulk(this.jobsSelected);
    },
  },
});
</script>
