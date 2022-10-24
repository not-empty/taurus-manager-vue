<template>
  <div>
    <v-breadcrumbs
      :items="items"
      divider="/"
    ></v-breadcrumbs>
    <v-row>
      <v-col sm="12" md="12" lg="12">
        <h2>DashBoard</h2>
      </v-col>
    </v-row>
    <div v-if="dashboardData.group">
      <h3 class="my-4" >{{ dashboardData.group.name }}</h3>
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
                <tr v-for="item in dashboardData.queues" :key="item.id">
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
import { DashGroup } from "~/types/group";
export default Vue.extend({
  middleware: 'auth',
  name: "IndexPage",
  data() {
    return {
      logado: '',
      dashboardData: {} as DashGroup,
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
      ],
    };
  },
  created() {
    this.$api.dashboard.groupDashById(this.$route.params.id).then(((res) => {
      this.dashboardData = res
      this.items[1].text = res.group.name
      this.items[1].href = '/dashboard/group/'+res.group.id
    }))
  },
  methods: {
    openToPage(id:string) {
      this.$router.push("/dashboard/queue/" + id);
    }
  }
});
</script>
