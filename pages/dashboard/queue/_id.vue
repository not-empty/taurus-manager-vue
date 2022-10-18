<template lang="">
  <div>
    <div class="d-flex justify-space-between align-center" v-if="!loader">
      <h2  class="my-4">{{dashQueueData.name}}</h2>
      <div>
        <span class="mr-3"><v-icon :color="dashQueueData.status == 'running' ? 'green' : 'red'" class="mr-1">mdi-{{dashQueueData.status == "running" ? "play-circle-outline" : "play-circle-outline"}}</v-icon>{{dashQueueData.status}}</span>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" v-bind="attrs" v-on="on">
              Actions <v-icon>mdi-triangle-small-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title @click="pauseQueue()" class="pointer">Pause</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title @click="resumeQueue()" class="pointer">Resume</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      
    </div>
    <v-row>
      <v-col v-if="loader" v-for="(countsLoad,keyLoad) in dashQueueData.jobCounts" :key="'load' + keyLoad" sm="4" md="6" lg="2">
        <v-skeleton-loader 
          height="102" 
          type="card">
        </v-skeleton-loader>
      </v-col>
      <template v-if="!loader">
        <v-col v-for="(counts,key) in dashQueueData.jobCounts" :key="'data' + key" sm="4" md="6" lg="2">
          <v-card elevation="3">
            <v-card-title tag="h2">
              {{ key }}
            </v-card-title>
            <v-card-text class="text-h2 d-flex justify-center font-weight-bold">
              {{ counts }}
            </v-card-text>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { DashQueue } from "~/types/queue";
export default Vue.extend({
  middleware: "auth",
  name: "ViewQueue",
  data() {
    return {
      loader: true,
      dashQueueData: {
        jobCounts: {
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          paused: 0,
        },
      } as DashQueue,
    };
  },
  created() {
    this.updateQueue()
  },
  methods: {
    resumeQueue() {
      this.$api.queue.resume(this.$route.params.id).then(() => {
        this.updateQueue()
      });
    },
    pauseQueue() {
      this.$api.queue.pause(this.$route.params.id).then(() => {
        this.updateQueue()
      });
    },
    updateQueue() {
      this.$api.dashboard
      .queueDash(this.$route.params.id)
      .then((res) => {
        this.dashQueueData = res;
      })
      .finally(() => {
        this.loader = false;
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
