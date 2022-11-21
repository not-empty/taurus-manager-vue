<template>
  <div>
    <v-row>
      <v-col sm="6" md="6" lg="6">
        <h2>DashBoard</h2>
      </v-col>
      <v-col sm="6" md="6" lg="6" class="d-flex justify-end">
        <v-btn @click="useCards = !useCards">
          <v-icon> {{ useCards ? "mdi-view-list" : "mdi-table" }}</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <div v-for="group in dashboardData" :key="group.group.id" v-if="!useCards">
      <h3 class="my-4" @click="openGroup(group.group.id)">{{ group.group.name }}</h3>
      <v-row>
        <v-col sm="12" md="12" lg="12">
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Status</th>
                  <th class="text-left">Waiting</th>
                  <th class="text-left">Paused</th>
                  <th class="text-left">Active</th>
                  <th class="text-left">Delayed</th>
                  <th class="text-left">Failed</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in group.queues" :key="item.id" @click="openQueue(item.id)">
                  <td>{{ item.name }}</td>
                  <td>{{ item.status }}</td>
                  <td>{{ item.jobCounts.waiting }}</td>
                  <td>{{ item.jobCounts.paused }}</td>
                  <td>{{ item.jobCounts.active }}</td>
                  <td>{{ item.jobCounts.delayed }}</td>
                  <td>{{ item.jobCounts.failed }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </div>
    <div v-else>
      <v-card v-for="group in dashboardData" :key="group.group.id" class="my-3 px-3 py-3">
        <h3 class="py-3">{{ group.group.name }}</h3>
        <div v-for="queue, index in group.queues" @click="openQueue(queue.id)" :key="queue.id" class="mb-3 pb-2" :class="(index +1) != group.queues.length ? 'card-border': ''">
          <h4>{{ queue.name }}</h4>
          <div class="d-flex justify-space-around">
            <div>
              <h5>Waiting</h5>
              <h1>{{ queue.jobCounts.waiting }}</h1>
            </div>
            <div>
              <h5>Paused</h5>
              <h1>{{ queue.jobCounts.paused }}</h1>
            </div>
            <div>
              <h5>Active</h5>
              <h1>{{ queue.jobCounts.active }}</h1>
            </div>
            <div>
              <h5>Delayed</h5>
              <h1>{{ queue.jobCounts.delayed }}</h1>
            </div>
            <div>
              <h5>Failed</h5>
              <h1>{{ queue.jobCounts.failed }}</h1>
            </div>
          </div>
        </div>


      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DashGroup } from "~/types/group";
export default Vue.extend({
  middleware: 'auth',
  name: "IndexPage",
  data() {
    return {
      logado: '',
      dashboardData: [] as DashGroup[],
      useCards: false
    };
  },
  async created() {
    this.dashboardData = await this.$api.dashboard.groupDash()
  },
  methods: {
    openQueue(id: string) {
      this.$router.push("/dashboard/queue/" + id);
    },
    openGroup(id: string) {
      this.$router.push("/dashboard/group/" + id);
    },
  }
});
</script>

<style>
.card-border {
  border-bottom: 1px solid #cccccc50;
}
</style>
