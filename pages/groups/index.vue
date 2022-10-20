<template>
  <div>
    <v-row>
      <v-col sm="12" md="12" lg="12">
        <h2>Grupos</h2>
      </v-col>
    </v-row>
    <div>
      <v-row>
        <v-col sm="12" md="12" lg="12">
          <v-simple-table>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in groups" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.description }}</td>
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
import { IGroup } from "~/types/group";
export default Vue.extend({
  middleware: "auth",
  name: "Groups",
  data() {
    return {
      groups: [] as IGroup[],
    };
  },
  async created() {
    this.$api.group.getPaginated(1, 25)
      .then(response => this.groups = response.groups);
  },
  methods: {},
});
</script>
  