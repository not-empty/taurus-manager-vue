<template>
  <div>
    <v-sheet class="px-4 py-4 accent d-flex justify-space-between" >
      <span class="font-weight-bold text-h6">Jobs</span>
      <v-btn text color="secondary">
        <v-icon left>mdi-content-copy</v-icon>
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
            {{ job.createdAt }}
          </p>
        </v-card-text>
      </v-card>
      <v-card tile width="100%" color="accent" class="pt-4 px-4">
        <v-card-text class="text-center">
          <span>ProcessedAt</span>
          <p class="text-h6 text--primary">
            {{ job.processedAt }}
          </p>
        </v-card-text>
      </v-card>
      <v-card tile width="100%" color="accent" class="pt-4 px-4">
        <v-card-text class="text-center">
          <span>FinishedAt</span>
          <p class="text-h6 text--primary">
            {{ job.finishedAt }}
          </p>
        </v-card-text>
      </v-card>
    </v-flex>
    <v-sheet class="px-4 py-4 accent">
      <span class="font-weight-bold text-h6">Data</span>
    </v-sheet>
    <code class="d-flex py-1 rounded-0 code-border overflow">
      <pre class="language-markup">{{ job.data }}</pre>
    </code>
    <v-sheet class="px-4 py-4 accent">
      <span class="font-weight-bold text-h6">Trace</span>
    </v-sheet>
    <code class="d-flex py-1 rounded-0 code-border overflow">
      <pre class="language-markup">{{ job.stacktrace }}</pre>
    </code>
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
.code-border {
  border-left: 2px solid #db1e72;
}

.overflow {
  overflow: auto;
  max-width: 100%;
}
</style>
