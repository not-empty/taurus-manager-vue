<template>
  <div>
    <v-row>
      <v-col sm="12" md="12" lg="12">
        <h2>DashBoard</h2>
      </v-col>
    </v-row>
    <div>
      <h3>{{ group.name }}</h3>
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
                <tr v-for="item in queues" :key="item.id">
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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "IndexPage",
  data() {
    return {
      group: {
        id: "2daeeb0d-9c01-4499-82e2-add16cbfa682",
        name: "Group Name",
        description: "",
        createdAt: "2021-11-08T20:04:50.000Z",
        updatedAt: "2021-11-08T20:04:50.000Z",
        deletedAt: null,
      },
      queues: [
        {
          id: "6c4fe4ac-f137-4b3c-849f-a43d70f12119",
          name: "random-event",
          description: "",
          host: "cache.com",
          port: 6379,
          groupId: "2daeeb0d-9c01-4499-82e2-add16cbfa682",
          createdAt: "2021-11-08T20:11:48.000Z",
          updatedAt: "2021-11-08T20:11:48.000Z",
          deletedAt: null,
          status: "running",
          jobCounts: {
            waiting: 0,
            active: 8,
            completed: 100,
            failed: 0,
            delayed: 0,
            paused: 0,
          },
        },
      ],
    };
  },
  mounted() {
    this.$api
  },
});
</script>
