<template lang="">
  <div>
    <v-breadcrumbs :items="items" divider="/" />
    <v-sheet v-if="!loader">
      <v-toolbar flat>
        <v-toolbar-title>Job</v-toolbar-title>
      </v-toolbar>
      <v-sheet class="d-flex">
        <v-card tile width="40%">
          <v-card-text class="text-center">
            <span>ID</span>
            <p class="text-h6 text--primary">
              {{ job.id }}
            </p>
          </v-card-text>
        </v-card>
        <v-card tile width="30%">
          <v-card-text class="text-center">
            <span>State</span>
            <p class="text-h6 text--primary">
              {{ job.state }}
            </p>
          </v-card-text>
        </v-card>
        <v-card tile width="30%">
          <v-card-text class="text-center">
            <span>Attempts Made</span>
            <p class="text-h6 text--primary">
              {{ job.attemptsMade }}
            </p>
          </v-card-text>
        </v-card>
      </v-sheet>
      <v-sheet class="d-flex">
        <v-card tile width="100%">
          <v-card-text class="text-center">
            <span>Created At</span>
            <p class="text-h6 text--primary">
              {{ job.createdAt }}
            </p>
          </v-card-text>
        </v-card>
        <v-card tile width="100%">
          <v-card-text class="text-center">
            <span>Processed At</span>
            <p class="text-h6 text--primary">
              {{ job.processedAt }}
            </p>
          </v-card-text>
        </v-card>
        <v-card tile width="100%">
          <v-card-text class="text-center">
            <span>Finished At</span>
            <p class="text-h6 text--primary">
              {{ job.finishedAt }}
            </p>
          </v-card-text>
        </v-card>
      </v-sheet>
      <v-toolbar flat>
        <v-toolbar-title>Data</v-toolbar-title>
      </v-toolbar>
      <code class="language-markup d-flex py-1 rounded-0">
        <pre class="language-markup">{{ job.data }}</pre>
      </code>
      <v-toolbar flat>
        <v-toolbar-title>Trace</v-toolbar-title>
      </v-toolbar>
      <code class="language-markup d-flex py-1 rounded-0">
        <pre class="language-markup">{{ job.stacktrace }}</pre>
      </code>
    </v-sheet>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { IJob } from "~/types/job";
export default Vue.extend({
  middleware: "auth",
  name: "ViewQueue",
  data() {
    return {
      loader: true,
      state: "running",
      job: {} as IJob,
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
  created() {
    this.$api.jobs
      .getJob(this.$route.params.id, this.$route.params.jobId)
      .then((res) => {
        this.items[1].text = this.$route.params.id;
        this.items[1].href = "/dashboard/queue/" + this.$route.params.id;
        this.items[2].text = res.id;
        this.job = res;
      })
      .finally(() => {
        this.loader = false;
      });
  },
  methods: {},
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
