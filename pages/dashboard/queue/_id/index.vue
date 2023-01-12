<template>
  <div>
    <BreadCrumbs :items="items" />
    <v-data-table
      v-model="jobsSelected"
      hide-default-footer
      show-select
      :loading="loader"
      :headers="jobHeaders"
      :items="jobs"
      item-key="id"
      sort-by="createAt"
      class="accent"
      :items-per-page="pagination.itemsPerPage"
      fixed-header
      height="55vh"
      @click:row="openJob"
    >
      <template #top>
        <template v-if="queueData.jobCounts">
          <v-sheet class="d-flex accent">
            <v-flex class="d-flex align-center px-4 py-4">
              <span class="font-weight-bold text-h6">
                {{ queueData.name }}
              </span>
              <v-chip
                small
                class="ml-4"
                :color="queueData.status == 'running' ? 'green' : 'yellow'"
              >
                {{ queueData.status }}
              </v-chip>
              <v-spacer />
              <v-btn text color="secondary" @click="createDialog = true">
                <v-icon left>
                  mdi-plus
                </v-icon>
                <span>Create job</span>
              </v-btn>
              <v-btn
                v-if="queueData.status === 'running'"
                text
                color="secondary"
                @click="confirmPause()"
              >
                <v-icon left>
                  mdi-pause
                </v-icon>
                <span>Pause</span>
              </v-btn>
              <v-btn v-else text color="secondary" @click="confirmResume()">
                <v-icon left>
                  mdi-play
                </v-icon>
                <span>Resume</span>
              </v-btn>
            </v-flex>
          </v-sheet>
          <v-sheet class="d-flex">
            <v-card
              v-for="name in status"
              :key="name"
              tile
              width="100%"
              :color="state === name ? 'info' : 'accent'"
              @click="changeState(name)"
            >
              <v-card-text class="text-center">
                <span>{{ captalize(name) }}</span>
                <p class="text-h4 text--primary">
                  {{ queueData.jobCounts[name] }}
                </p>
              </v-card-text>
            </v-card>
          </v-sheet>
          <v-sheet>
            <v-sheet class="d-flex px-4 py-4 accent align-center">
              <p class="font-weight-bold text-h6 mb-0">
                Jobs
              </p>
              <v-spacer />
              <v-btn
                v-if="state == 'failed'"
                text
                :disabled="!jobsSelected.length"
                color="secondary"
                @click="confirmRetry()"
              >
                <v-icon left>
                  mdi-reload-alert
                </v-icon>
                <span>Retry</span>
              </v-btn>
              <v-btn
                text
                :disabled="!jobsSelected.length"
                color="secondary"
                @click="confirmRemove()"
              >
                <v-icon left>
                  mdi-delete
                </v-icon>
                <span>Remove</span>
              </v-btn>
              <v-btn text color="secondary" @click="getUpdatedData()">
                <v-icon left>
                  mdi-reload
                </v-icon>
                <span>Refresh</span>
              </v-btn>
            </v-sheet>
          </v-sheet>
        </template>
      </template>
      <template #footer>
        <v-data-footer
          :items-per-page-options="itemQuantities"
          :pagination="pagination"
          :options.sync="pagination"
          show-current-page
          :page-text="`Total pages: ${pagination.pageCount}`"
          @update:options="filterJobs"
        />
      </template>
    </v-data-table>
    <confirmation
      :state="ModalState"
      :function="ModalFunc"
      :message="ModalMessage"
      @close="ModalState = false"
    />
    <v-dialog v-if="createDialog" v-model="createDialog" persistent max-width="800px">
      <createJob :queue-id="$route.params.id" @close="createdJob" />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import confirmation from '../../../../components/utilities/confirmationModal.vue';
import createJob from '../../../../components/jobs/form.vue';
import { IJob } from '~/types/job';
import { DashQueue, JobCounts } from '~/types/queue';
import { pagination } from '~/types/pagination';
import BreadCrumbs from '~/components/utilities/Breadcrumbs.vue';

export default Vue.extend({
  name: 'ViewQueue',
  components: {
    confirmation,
    createJob,
    BreadCrumbs
  },
  middleware: 'auth',
  data () {
    return {
      loader: false,
      state: 'waiting',
      ModalState: false,
      ModalFunc: function () {},
      ModalMessage: '',
      jobsSelected: [] as IJob[],
      jobs: [] as IJob[],
      createDialog: false,
      pagination: {
        page: 1,
        itemsPerPage: 25,
        pageCount: 2,
        pageStart: 0,
        pageStop: 1,
        itemsLength: 1
      },
      itemQuantities: [
        25,
        50,
        100,
        1000
      ],
      jobHeaders: [
        {
          text: 'ID',
          value: 'id'
        },
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Attempts',
          value: 'attemptsMade'
        },
        {
          text: 'Created At',
          value: 'createdAt'
        },
        {
          text: 'Processed At',
          value: 'processedAt'
        },
        {
          text: 'Finished At',
          value: 'finishedAt'
        }
      ],
      queueData: {} as DashQueue,
      items: [
        {
          text: 'Dashboard',
          disabled: false,
          href: '/dashboard'
        },
        {
          text: '',
          disabled: false,
          href: ''
        },
        {
          text: '',
          disabled: true
        }
      ],
      status: [
        'waiting',
        'paused',
        'active',
        'delayed',
        'failed',
        'completed'
      ] as (keyof JobCounts)[]
    };
  },
  watch: {
    'pagination.itemsPerPage': function (items) {
      this.setPagination(items);
    }
  },
  created () {
    this.getUpdatedData();
  },
  methods: {
    ...mapActions('groups', ['setGroups']),
    ...mapGetters('groups', {
      groups: 'groups',
      groupById: 'groupById'
    }),
    ...mapActions('options', ['setPagination']),
    ...mapGetters('options', {
      itemsPerPage: 'pagination'
    }),

    changeState (name: string) {
      this.state = name;
      this.filterJobs();
    },
    createdJob () {
      this.createDialog = false;
      this.getUpdatedData();
    },
    captalize (str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    filterJobs (pagination?: pagination) {
      this.loader = true;
      if (typeof pagination !== 'undefined') {
        this.pagination = pagination;
      }

      this.$api.jobs
        .getJobPaginate(
          this.$route.params.id,
          this.pagination.page,
          this.pagination.itemsPerPage,
          this.state
        )
        .then((res) => {
          this.jobs = res.jobs;
          this.pagination.itemsLength = res.total;
          if (res.total !== 0) {
            this.pagination.pageCount = Math.ceil(
              res.total / this.pagination.itemsPerPage
            );
            this.pagination.pageStop = this.pagination.pageCount;
            return;
          }
          this.pagination.pageCount = 1;
          this.pagination.pageStop = 1;
        })
        .finally(() => {
          this.loader = false;
        });
    },
    openJob (
      { id }: IJob
    ) {
      this.$router.push(`/dashboard/queue/${this.$route.params.id}/jobs/${id}`);
    },
    confirmPause () {
      this.ModalFunc = this.pauseQueue;
      this.ModalMessage = 'Pause Queue?';
      this.ModalState = true;
    },
    pauseQueue () {
      this.$api.queue.pause(this.$route.params.id).then(() => {
        this.getUpdatedData();
      });
    },
    confirmResume () {
      this.ModalFunc = this.resumeQueue;
      this.ModalMessage = 'Resume Queue?';
      this.ModalState = true;
    },
    resumeQueue () {
      this.$api.queue.resume(this.$route.params.id).then(() => {
        this.getUpdatedData();
      });
    },
    confirmRetry () {
      this.ModalFunc = this.retryJobs;
      this.ModalMessage = 'Retry selected jobs?';
      this.ModalState = true;
    },
    retryJobs () {
      this.$api.jobs.retryJob(this.$route.params.id, {
        jobIds: this.mapSelected()
      }).then(() => {
        this.getUpdatedData();
      });

      this.jobsSelected = [];
      this.filterJobs();
    },
    confirmRemove () {
      this.ModalFunc = this.removeJobs;
      this.ModalMessage = 'Remove selected jobs?';
      this.ModalState = true;
    },
    removeJobs () {
      this.$api.jobs.deleteJob(this.$route.params.id, {
        jobIds: this.mapSelected()
      }).then(() => {
        this.getUpdatedData();
      });

      this.jobsSelected = [];
      this.filterJobs();
    },
    mapSelected (): string[] {
      return this.jobsSelected.map((job) => {
        return job.id;
      });
    },
    getUpdatedData () {
      this.pagination.itemsPerPage = this.itemsPerPage();
      this.filterJobs();
      this.$api.dashboard.queueDash(this.$route.params.id).then(async (res) => {
        if (!this.groupById()(res.groupId)) {
          const group = await this.$api.group.getById(res.groupId);
          this.setGroups(group);
        }

        this.items[1].text = this.groupById()(res.groupId).name;
        this.items[1].href = '/dashboard/group/' + res.groupId;
        this.items[2].text = res.name;
        this.items[2].disabled = true;
        this.queueData = res;
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
