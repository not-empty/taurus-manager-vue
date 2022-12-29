<template>
  <div>
    <v-data-table hide-default-footer show-select v-model="jobsSelected" :loading="loader" :headers="jobHeaders"
      :items="jobs" item-key="id" sort-by="createAt" class="accent" @click:row="openJob">
      <template v-slot:top>
        <template v-if="queueData.jobCounts">
          <v-sheet class="d-flex accent">
            <v-flex class="d-flex align-center px-4 py-4">
              <span class="font-weight-bold text-h6">
                {{ queueData.name }}
              </span>
              <v-chip small class="ml-4" :color="queueData.status == 'running' ? 'green' : 'yellow'">
                {{ queueData.status }}
              </v-chip>
              <v-spacer></v-spacer>
              <v-btn v-if="queueData.status === 'running'" text color="secondary" @click="confirmPause()">
                <v-icon left>mdi-pause</v-icon>
                <span>Pause</span>
              </v-btn>
              <v-btn v-else text color="secondary" @click="confirmResume()">
                <v-icon left>mdi-play</v-icon>
                <span>Resume</span>
              </v-btn>
            </v-flex>
          </v-sheet>
          <v-sheet class="d-flex">
            <v-card v-for="name in status" tile width="100%" :key="name" :color="state === name ? 'info' : 'accent'"
              @click="state = name">
              <v-card-text class="text-center">
                <span>{{ captalize(name) }}</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts[name] }}
                </p>
              </v-card-text>
            </v-card>
          </v-sheet>
          <v-sheet>
            <v-sheet class="d-flex px-4 py-4 accent">
              <p class="font-weight-bold text-h6">Jobs</p>
              <v-spacer></v-spacer>
              <v-btn text :disabled="!jobsSelected.length" v-if="state == 'failed'" color="secondary" @click="confirmRetry()">
                <v-icon left>mdi-reload</v-icon>
                <span>Retry</span>
              </v-btn>
              <v-btn text :disabled="!jobsSelected.length" color="secondary" @click="confirmRemove()">
                <v-icon left>mdi-delete</v-icon>
                <span>Remove</span>
              </v-btn>
            </v-sheet>
          </v-sheet>
        </template>
      </template>
    </v-data-table>
    <confirmation :state="ModalState" :function="ModalFunc" :mensage="ModalMessage" @close="ModalState = false"></confirmation>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { IJob } from "~/types/job";
import { DashQueue, JobCounts } from "~/types/queue";
import confirmation from "../../../../components/utilities/confirmationModal.vue"
export default Vue.extend({
  middleware: "auth",
  name: "ViewQueue",
  components: {
    confirmation
  },
  data() {
    return {
      loader: false,
      state: "waiting",
      ModalState: false,
      ModalFunc: function(){},
      ModalMessage: '',
      jobsSelected: [] as IJob[],
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
          text: "Dashboard",
          disabled: false,
          href: "/dashboard",
        },
        {
          text: "",
          disabled: false,
          href: "",
        },
        {
          text: "",
          disabled: true,
          href: "",
        },
      ],
      status: [
        "waiting",
        "paused",
        "active",
        "delayed",
        "failed",
        "completed",
      ] as (keyof JobCounts)[],
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
    this.getUpdatedData();
  },
  methods: {
    captalize(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
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
    confirmPause(){
      this.ModalFunc = this.pauseQueue;
      this.ModalMessage = 'Pausar a fila?';
      this.ModalState = true;
    },
    pauseQueue() {
      this.$api.queue.pause(this.$route.params.id).then(() => {
        this.getUpdatedData();
      });
    },
    confirmResume(){
      this.ModalFunc = this.resumeQueue;
      this.ModalMessage = 'Retomar a fila?';
      this.ModalState = true;
    },
    resumeQueue() {
      this.$api.queue.resume(this.$route.params.id).then(() => {
        this.getUpdatedData();
      });
    },
    confirmRetry(){
      this.ModalFunc = this.retryJobs;
      this.ModalMessage = 'Retentar todos os jobs selecionados?';
      this.ModalState = true;
    },
    retryJobs() {
      this.$api.jobs.retryJob(this.$route.params.id, {
        jobIds: this.mapSelected(),
        state: this.state,
      }).then(() => {
        this.getUpdatedData();
      });

      this.jobsSelected = [];
      this.filterJobs();
    },
    confirmRemove(){
      this.ModalFunc = this.removeJobs;
      this.ModalMessage = 'Remover todos os jobs selecionados?';
      this.ModalState = true;
    },
    removeJobs() {
      this.$api.jobs.deleteJob(this.$route.params.id, {
        jobIds: this.mapSelected(),
      }).then(() => {
        this.getUpdatedData();
      });

      this.jobsSelected = [];
      this.filterJobs();
    },
    mapSelected(): string[] {
      return this.jobsSelected.map(job => {
        return job.id
      });
    },
    getUpdatedData() {
      this.filterJobs();
      this.$api.dashboard.queueDash(this.$route.params.id).then((res) => {
        this.items[1].text = res.groupId;
        this.items[1].href = "/dashboard/group/" + res.groupId;
        this.items[2].text = res.name;
        this.items[2].disabled = true;
        this.queueData = res;
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
