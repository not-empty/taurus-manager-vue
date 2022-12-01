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
      <v-data-table
        hide-default-footer
        :headers="queuesHeaders"
        :items="dashboardData.queues"
        sort-by="createAt"
        class="rounded my-4"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>{{ dashboardData.group.name }}</v-toolbar-title>
          </v-toolbar>
        </template>
        <template v-slot:item="{ item }">
            <tr class="pointer">
              <td>{{ item.name }}</td>
              <td>{{ item.status }}</td>
              <td>{{ item.jobCounts.waiting }}</td>
              <td>{{ item.jobCounts.paused }}</td>
              <td>{{ item.jobCounts.active }}</td>
              <td>{{ item.jobCounts.delayed }}</td>
              <td>{{ item.jobCounts.failed }}</td>
            </tr>
          </template>
      </v-data-table>
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
      queuesHeaders: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Status",
          value: "status",
        },
        {
          text: "Waiting",
          value: "jobCounts.waiting",
        },{
          text: "Paused",
          value: "jobCounts.paused",
        }
        ,{
          text: "Active",
          value: "jobCounts.active",
        },
        {
          text: "Delayed",
          value: "jobCounts.delayed",
        },
        {
          text: "Failed",
          value: "jobCounts.failed",
        },
      ],
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
