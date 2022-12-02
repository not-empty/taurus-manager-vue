<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>DashBoard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="useCards = !useCards">
        <v-icon>{{ useCards ? "mdi-view-list" : "mdi-table" }}</v-icon>
      </v-btn>
    </v-toolbar>

    <template v-if="!useCards">
      <div v-for="group in dashboardData" :key="group.group.id">
        <v-data-table
          hide-default-footer
          :headers="queuesHeaders"
          :items="group.queues"
          sort-by="createAt"
          class="rounded my-4"
          @click:row="openQueue"
        >
          <template v-slot:top>
            <v-toolbar flat class="pointer" @click="openGroup(group.group.id)">
              <v-toolbar-title>{{ group.group.name }}</v-toolbar-title>
            </v-toolbar>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip outlined color="green">
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon v-if="item.status === 'running'" @click.stop="pauseQueue(item.id)">
              mdi-pause
            </v-icon>
            <v-icon v-else @click.stop="resumeQueue(item.id)">
              mdi-play
            </v-icon>
          </template>
        </v-data-table>
      </div>
    </template>
    <div v-else>
      <v-sheet v-for="group in dashboardData" class="rounded my-4" :key="group.group.id">
        <v-toolbar flat class="pointer" @click="openGroup(group.group.id)">
          <v-toolbar-title>{{ group.group.name }}</v-toolbar-title>
        </v-toolbar>
        <v-divider></v-divider>
        <v-sheet v-for="queue in group.queues" :key="queue.id">
          <v-toolbar flat class="pointer" @click="openQueue(queue)">
            <v-toolbar-title>{{ queue.name }}</v-toolbar-title>
            <v-chip outlined class="pointer ml-4" color="green">
              {{ queue.status }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn v-if="queue.status === 'running'" color="primary" @click="pauseQueue(queue.id)">
              Pause
              <v-icon right>mdi-pause</v-icon>
            </v-btn>
            <v-btn v-else color="primary" @click="resumeQueue(queue.id)">
              Resume
              <v-icon right>mdi-play</v-icon>
            </v-btn>
          </v-toolbar>
          <v-sheet class="d-flex">
            <v-card tile width="100%">
              <v-card-text class="text-center">
                <span>Waiting</span>
                <p class="text-h4 text--primary">
                  {{ queue.jobCounts.waiting }}
                </p>
              </v-card-text>
            </v-card>
            <v-card tile width="100%">
              <v-card-text class="text-center">
                <span>Paused</span>
                <p class="text-h4 text--primary">
                  {{ queue.jobCounts.paused }}
                </p>
              </v-card-text>
            </v-card>
            <v-card tile width="100%">
              <v-card-text class="text-center">
                <span>Active</span>
                <p class="text-h4 text--primary">
                  {{ queue.jobCounts.active }}
                </p>
              </v-card-text>
            </v-card>
            <v-card tile width="100%">
              <v-card-text class="text-center">
                <span>Delayed</span>
                <p class="text-h4 text--primary">
                  {{ queue.jobCounts.delayed }}
                </p>
              </v-card-text>
            </v-card>
            <v-card tile width="100%">
              <v-card-text class="text-center">
                <span>Failed</span>
                <p class="text-h4 text--primary">
                  {{ queue.jobCounts.failed }}
                </p>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-sheet>
      </v-sheet>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DashGroup } from "~/types/group";
import { IQueue } from "~/types/queue";
export default Vue.extend({
  middleware: 'auth',
  name: "IndexPage",
  data() {
    return {
      logado: '',
      dashboardData: [] as DashGroup[],
      queuesHeaders: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "",
          value: "status",
          align: "start",
          sortable: false,
        },
        {
          text: "Waiting",
          value: "jobCounts.waiting",
        },{
          text: "Paused",
          value: "jobCounts.paused",
        }
        ,{
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
        {
          text: "Actions",
          value: "actions",
          align: "end",
          sortable: false,
        },
      ],
      useCards: false
    };
  },
  async created() {
    this.dashboardData = await this.$api.dashboard.groupDash()
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
  }
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
