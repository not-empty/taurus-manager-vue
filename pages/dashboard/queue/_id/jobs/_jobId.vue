<template lang="">
  <div>
    <v-card v-if="!loader">
      <v-container>
        <v-row>
          <v-col sm="4" class="d-flex flex-column align-center">
            <span>ID</span>
            <span>{{job.id}}</span>
          </v-col>
          <v-col sm="4" class="d-flex flex-column align-center">
            <span>STATE</span>
            <span>{{job.state}}</span>
          </v-col>
          <v-col sm="4" class="d-flex flex-column align-center">
            <span>ATTEMPTS MADE</span>
            <span>{{job.attemptsMade}}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="4" class="d-flex flex-column align-center">
            <span>CREATED AT</span>
            <span>{{job.createdAt}}</span>
          </v-col>
          <v-col sm="4" class="d-flex flex-column align-center">
            <span>PROCESSED AT</span>
            <span>{{job.processedAt}}</span>
          </v-col>
          <v-col sm="4" class="d-flex flex-column align-center">
            <span>FINISHED AT</span>
            <span>{{job.finishedAt}}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col sm="12" class="d-flex flex-column">
            <span>DATA</span>
            <code class="language-markup"><pre class="language-markup">{{job.data}}</pre></code>
          </v-col>
          <v-col sm="12" class="d-flex flex-column" v-if="job.stacktrace">
            <span>TRACE</span>
            <code class="language-markup"><pre class="language-markup">{{job.stacktrace}}</pre></code>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
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
    };
  },
  created() {
    this.$api.jobs
      .getJob(this.$route.params.id, this.$route.params.jobId)
      .then((res) => {
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
