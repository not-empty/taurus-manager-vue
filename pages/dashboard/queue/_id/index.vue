<template>
  <div>
    <v-breadcrumbs :items="items" divider="/" />
    <v-data-table
      hide-default-footer
      :loading="loader"
      :headers="jobHeaders"
      :items="jobs"
      sort-by="createAt"
      class="rounded"
    >
      <template v-slot:top>
        <template v-if="queueData.jobCounts">
          <v-toolbar flat>
            <v-toolbar-title>{{ queueData.name }}</v-toolbar-title>
          </v-toolbar>
          <v-sheet class="d-flex">
            <v-card
              tile
              width="100%"
              :color="state === 'waiting' ? '#272727' : null"
              @click="state = 'waiting'"
            >
              <v-card-text class="text-center">
                <span>Waiting</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts.waiting }}
                </p>
              </v-card-text>
            </v-card>
            <v-card
              tile
              width="100%"
              :color="state === 'paused' ? '#272727' : null"
              @click="state = 'paused'"
            >
              <v-card-text class="text-center">
                <span>Paused</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts.paused }}
                </p>
              </v-card-text>
            </v-card>
            <v-card
              tile
              width="100%"
              :color="state === 'active' ? '#272727' : null"
              @click="state = 'active'"
            >
              <v-card-text class="text-center">
                <span>Active</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts.active }}
                </p>
              </v-card-text>
            </v-card>
            <v-card
              tile
              width="100%"
              :color="state === 'delayed' ? '#272727' : null"
              @click="state = 'delayed'"
            >
              <v-card-text class="text-center">
                <span>Delayed</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts.delayed }}
                </p>
              </v-card-text>
            </v-card>
            <v-card
              tile
              width="100%"
              :color="state === 'failed' ? '#272727' : null"
              @click="state = 'failed'"
            >
              <v-card-text class="text-center">
                <span>Failed</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts.failed }}
                </p>
              </v-card-text>
            </v-card>
            <v-card
              tile
              width="100%"
              :color="state === 'completed' ? '#272727' : null"
              @click="state = 'completed'"
            >
              <v-card-text class="text-center">
                <span>Completed</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts.completed }}
                </p>
              </v-card-text>
            </v-card>
          </v-sheet>
        </template>
        <v-toolbar flat>
          <v-toolbar-title>Jobs</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item="{ item }">
        <tr class="pointer" @click="$router.push('/dashboard/queue/' + $route.params.id + '/jobs/'+ item.id)">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.attemptsMade }}</td>
          <td>{{ item.createdAt }}</td>
          <td>{{ item.processedAt }}</td>
          <td>{{ item.finishedAt }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { IJob } from "~/types/job";
import { DashQueue } from "~/types/queue";
export default Vue.extend({
  middleware: "auth",
  name: "ViewQueue",
  data() {
    return {
      loader: false,
      state: "waiting",
      jobs: [] as IJob[],
      jobHeaders: [
        {
          text: "ID",
          value: "id",
        },
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Attempts",
          value: "attemptsMade",
        },
        {
          text: "Created At",
          value: "createdAt",
        },
        {
          text: "Processed At",
          value: "processedAt",
        },
        {
          text: "Finished At",
          value: "finishedAt",
        },
      ],
      queueData: {} as DashQueue,
      items: [
        {
          text: 'Dashboard',
          disabled: false,
          href: '/dashboard',
        },
        {
          text: '',
          disabled: false,
          href: '',
        },
        {
          text: '',
          disabled: true,
          href: '',
        },
      ],
    };
  },
  watch: {
    state() {
      this.filterJobs();
    },
  },
  created() {
    this.filterJobs();
    this.$api.dashboard.queueDash(this.$route.params.id).then((res) => {
      this.items[1].text = res.groupId
      this.items[1].href = '/dashboard/group/' + res.groupId
      this.items[2].text = res.name
      this.items[2].disabled = true
      this.queueData = res
    })
  },
  methods: {
    filterJobs() {
      this.loader = true;
      this.$api.jobs
        .getJobPaginate(this.$route.params.id, 1, 25, this.state)
        .then((res) => {
          this.jobs = res.jobs;
        })
        .finally(() => {
          this.loader = false;
        });
    }
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
