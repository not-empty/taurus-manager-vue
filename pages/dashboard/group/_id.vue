<template>
  <div>
    <v-data-table
      hide-default-footer
      show-select
      :headers="queuesHeaders"
      :items="dashboardData.queues"
      sort-by="createAt"
      class="accent"
    >
      <template v-slot:top>
        <p class="px-4 py-4 font-weight-bold text-h6">
          {{ dashboardData.group?.name }}
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

<script lang="ts">
import Vue from "vue";
import { DashGroup } from "~/types/group";
export default Vue.extend({
  middleware: "auth",
  name: "IndexPage",
  data() {
    return {
      logado: "",
      dashboardData: {} as DashGroup,
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
    this.$api.dashboard.groupDashById(this.$route.params.id).then((res) => {
      this.dashboardData = res;
      this.items[1].text = res.group.name;
      this.items[1].href = "/dashboard/group/" + res.group.id;
    });
  },
  methods: {
    openToPage(id: string) {
      this.$router.push("/dashboard/queue/" + id);
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
