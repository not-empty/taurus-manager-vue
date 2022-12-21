<template>
  <div>
    <template v-for="x in Array(5)">
      <div v-for="group in dashboardData" :key="group.group.id">
        <v-data-table
          hide-default-footer
          show-select
          :headers="queuesHeaders"
          :items="group.queues"
          sort-by="name"
          class="accent mb-8"
        >
          <template v-slot:top>
            <p class="px-4 py-4 font-weight-bold text-h6">
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
    </template>
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
    pauseQueue(id: string) {
      this.$api.queue.pause(id);
    },
    resumeQueue(id: string) {
      this.$api.queue.resume(id);
    },
  },
});
</script>

<style>
.card-border {
  border-bottom: 1px solid #cccccc50;
}
.pointer {
  cursor: pointer;
}
</style>
