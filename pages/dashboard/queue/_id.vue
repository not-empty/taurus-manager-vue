<template lang="">
  <div>
    <v-row>
      <v-col v-if="loader" v-for="(countsLoad,keyLoad) in dashQueueData.jobCounts" :key="'load' + keyLoad" sm="6" md="12" lg="3">
        <v-skeleton-loader 
          height="102" 
          type="card">
        </v-skeleton-loader>
      </v-col>
      <template v-if="!loader">
        <v-col v-for="(counts,key) in dashQueueData.jobCounts" :key="'data' + key" sm="6" md="12" lg="3">
          <v-card>
            <v-card-title>
              {{ key }}
            </v-card-title>
            <v-card-text>
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
        }
      } as DashQueue
    };
  },
  created() {
    this.$api.dashboard.queueDash(
      this.$route.params.id
    ).then((res) => {
      this.dashQueueData = res;
    }).finally(() => {
      this.loader = false
    });

  },
});
</script>
