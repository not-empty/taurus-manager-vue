<template>
  <div>
    <v-breadcrumbs :items="items" divider="/" />
    <v-data-table
      hide-default-footer
      show-select
      v-model="jobsSelected"
      :loading="loader"
      :headers="jobHeaders"
      :items="jobs"
      sort-by="createAt"
      class="rounded"
      @click:row="openJob"
    >
      <template v-slot:top>
        <template v-if="queueData.jobCounts">
          <v-toolbar flat>
            <v-toolbar-title>{{ queueData.name }}</v-toolbar-title>
            <v-chip outlined class="ml-4" color="green">
              {{ queueData.status }}
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn v-if="queueData.status === 'running'" color="primary" @click="pauseQueue">
              Pause
              <v-icon right>mdi-pause</v-icon>
            </v-btn>
            <v-btn v-else color="primary" @click="resumeQueue">
              Resume
              <v-icon right>mdi-play</v-icon>
            </v-btn>
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
          <v-spacer></v-spacer>
          <v-btn class="mr-4" color="primary" :disabled="!hasJobsSelected" @click="retryJobs">
            Retry
            <v-icon right>mdi-reload</v-icon>
          </v-btn>
          <v-btn color="primary" :disabled="!hasJobsSelected" @click="removeJobs">
            Remove
            <v-icon right>mdi-delete</v-icon>
          </v-btn>
        </v-toolbar>
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
      jobsSelected: [] as string[],
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
  computed: {
    hasJobsSelected() {
      return this.jobsSelected.length > 0;
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
    },
    openJob({ id }: IJob) {
      this.$router.push(`/dashboard/queue/${this.$route.params.id}/jobs/${id}`);
    },
    pauseQueue() {
      this.$api.queue.pause(this.$route.params.id);
    },
    resumeQueue() {
      this.$api.queue.resume(this.$route.params.id);
    },
    retryJobs() {
      this.$api.jobs.retryJob(this.$route.params.id, {
        jobIds: this.jobsSelected,
        state: this.state,
      });

      this.jobsSelected = [];
      this.filterJobs();
    },
    removeJobs() {
      this.$api.jobs.deleteJob(this.$route.params.id, {
        jobIds: this.jobsSelected,
      });

      this.jobsSelected = [];
      this.filterJobs();
    },
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
