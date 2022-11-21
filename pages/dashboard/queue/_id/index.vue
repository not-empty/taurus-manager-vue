<template lang="">
  <div>
    <v-breadcrumbs
      :items="items"
      divider="/"
    ></v-breadcrumbs>
    <div v-if="!loader">
      <div class="d-flex justify-space-around mb-5">
        <v-card class="px-5 py-5" @click="filterJobs('waiting')">
          <h2>Waiting</h2>
          <h1>{{ queueData.jobCounts.waiting }}</h1>
        </v-card>
        <v-card class="px-5 py-5" @click="filterJobs('paused')">
          <h2>Paused</h2>
          <h1>{{ queueData.jobCounts.paused }}</h1>
        </v-card>
        <v-card class="px-5 py-5" @click="filterJobs('active')">
          <h2>Active</h2>
          <h1>{{ queueData.jobCounts.active }}</h1>
        </v-card>
        <v-card class="px-5 py-5" @click="filterJobs('delayed')">
          <h2>Delayed</h2>
          <h1>{{ queueData.jobCounts.delayed }}</h1>
        </v-card>
        <v-card class="px-5 py-5" @click="filterJobs('failed')">
          <h2>Failed</h2>
          <h1>{{ queueData.jobCounts.failed }}</h1>
        </v-card>
      </div>
      <v-container>
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">
                ID
              </th>
              <th class="text-left">
                Name
              </th>
              <th class="text-left">
                Attempts
              </th>
              <th class="text-left">
                Created at
              </th>
              <th class="text-left">
                Processed at
              </th>
              <th class="text-left">
                Finished at
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in jobs"
              :key="item.name"
              @click="$router.push('/dashboard/queue/' + $route.params.id + '/jobs/'+ item.id)"
            >
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.attemptsMade }}</td>
              <td>{{ item.createdAt }}</td>
              <td>{{ item.processedAt }}</td>
              <td>{{ item.finishedAt }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-container>
    </div>
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
      loader: true,
      state: "waiting",
      jobs: [] as IJob[],
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
  created() {
    this.$api.dashboard.queueDash(this.$route.params.id).then((res) => {
      this.items[1].text = res.groupId
      this.items[1].href = '/dashboard/group/' + res.groupId
      this.items[2].text = res.name
      this.items[2].disabled = true
      this.queueData = res
    })
    this.$api.jobs
      .getJobPaginate(this.$route.params.id, 1, 25, this.state)
      .then((res) => {
        this.jobs = res.jobs;
      })
      .finally(() => {
        this.loader = false;
      });
  },
  methods: {
    filterJobs(state: string) {
      this.$api.jobs
        .getJobPaginate(this.$route.params.id, 1, 25, state)
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
