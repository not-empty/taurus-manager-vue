<template lang="">
  <div>
    <div v-if="!loader">
      <!-- <h2  class="my-4">{{dashQueueData.name}}</h2> -->
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
    </div>
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
      jobs: [] as IJob[],
    };
  },
  created() {
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
  },
});
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
