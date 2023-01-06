<template>
  <div>
    <v-breadcrumbs :items="items" class="pl-3" />
    <v-sheet class="px-4 py-4 accent d-flex justify-space-between">
      <span class="font-weight-bold text-h6">Jobs</span>
      <v-btn text color="secondary" @click="confirmClone()">
        <v-icon left>
          mdi-content-copy
        </v-icon>
        <span>Clone Job</span>
      </v-btn>
    </v-sheet>
    <v-flex class="d-flex">
      <v-card tile width="100%" color="accent">
        <v-card-text class="text-center">
          <span>Id</span>
          <p class="text-h6 text--primary">
            {{ job.id }}
          </p>
        </v-card-text>
      </v-card>
      <v-card tile width="100%" color="accent">
        <v-card-text class="text-center">
          <span>State</span>
          <p class="text-h6 text--primary">
            {{ job.state }}
          </p>
        </v-card-text>
      </v-card>
      <v-card tile width="100%" color="accent">
        <v-card-text class="text-center">
          <span>AttemptsMade</span>
          <p class="text-h6 text--primary">
            {{ job.attemptsMade }}
          </p>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex class="d-flex">
      <v-card tile width="100%" color="accent" class="pt-4 px-4">
        <v-card-text class="text-center">
          <span>CreatedAt</span>
          <p class="text-h6 text--primary">
            {{ job.createdAt ? new Date(job.createdAt).toLocaleString("pt-BR") : '---' }}
          </p>
        </v-card-text>
      </v-card>
      <v-card tile width="100%" color="accent" class="pt-4 px-4">
        <v-card-text class="text-center">
          <span>ProcessedAt</span>
          <p class="text-h6 text--primary">
            {{
              job.processedAt
                ? new Date(job.processedAt).toLocaleString("pt-BR")
                : '---'
            }}
          </p>
        </v-card-text>
      </v-card>
      <v-card tile width="100%" color="accent" class="pt-4 px-4">
        <v-card-text class="text-center">
          <span>FinishedAt</span>
          <p class="text-h6 text--primary">
            {{
              job.finishedAt
                ? new Date(job.finishedAt).toLocaleString("pt-BR")
                : '---'
            }}
          </p>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-sheet class="px-4 py-4 accent">
      <span class="font-weight-bold text-h6">Data</span>
    </v-sheet>
    <code class="d-flex py-1 rounded-0 code-border ">
      <pre class="language-markup overflow">{{ job.data }}</pre>
    </code>
    <v-sheet class="px-4 py-4 accent">
      <span class="font-weight-bold text-h6">Trace</span>
    </v-sheet>
    <code class="d-flex py-1 rounded-0 code-border ">
      <pre class="language-markup overflow">{{ job.stacktrace }}</pre>
    </code>
    <confirmation
      :state="ModalState"
      :function="ModalFunc"
      :mensage="ModalMessage"
      @close="ModalState = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import confirmation from '../../../../../components/utilities/confirmationModal.vue';
import { IJob } from '~/types/job';
export default Vue.extend({
  name: 'ViewQueue',
  components: {
    confirmation
  },
  middleware: 'auth',
  data () {
    return {
      loader: true,
      state: 'running',
      job: {} as IJob,
      ModalState: false,
      ModalFunc: function () {},
      ModalMessage: '',
      createDialog: false,
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
      ]
    };
  },
  created () {
    this.$api.jobs
      .getJob(this.$route.params.id, this.$route.params.jobId)
      .then(async (res) => {
        const queueId = this.$route.params.id;

        if (!this.queueById()(queueId)) {
          const queue = await this.$api.queue.getById(queueId);
          this.setQueue(queue);
        }

        this.items[1].text = this.queueById()(queueId).name;
        this.items[1].href = '/dashboard/queue/' + this.$route.params.id;
        this.items[2].text = res.name;
        this.job = res;
      })
      .finally(() => {
        this.loader = false;
      });
  },
  methods: {
    ...mapActions('queues', ['setQueue']),
    ...mapGetters('queues', ['queues', 'queueById']),

    confirmClone () {
      this.ModalFunc = this.cloneJob;
      this.ModalMessage = 'Clone job?';
      this.ModalState = true;
    },
    cloneJob () {
      this.$api.jobs.cloneJob(this.$route.params.id, this.$route.params.jobId);
    }
  }
});
</script>

<style scoped>
.code-border {
  border-left: 2px solid #db1e72;
}

.overflow {
  max-width: 100%;
  word-break: break-all;
  white-space: break-spaces;
}
</style>
