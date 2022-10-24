<template>
  <div>
    <div class="d-flex justify-space-between">
      <h2 class="mb-4">Grupos</h2>
      <v-btn color="primary" dark @click="dialog = true">
        Novo grupo
      </v-btn>
    </div>

    <v-card class="mb-5">
      <v-container>
        <v-row>
          <v-col sm="12" md="12" lg="12">
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Name</th>
                    <th class="text-left">Description</th>
                    <th class="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in groups" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                    <td>
                      <v-icon class="mr-4" @click="editGroups(item)">mdi-pencil</v-icon>
                      <v-icon @click="deleteGroups(item)">mdi-delete</v-icon>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-dialog v-model="dialog" persistent max-width="600px" v-if="dialog">
      <GroupForm @close="close()" :group="edit"></GroupForm>
    </v-dialog>
  </div>
</template>
  
<script lang="ts">
import Vue from "vue";
import { IGroup } from "~/types/group";
import GroupForm from "~/components/groups/form.vue";
export default Vue.extend({
  middleware: "auth",
  name: "Groups",
  components: { GroupForm },
  data() {
    return {
      groups: [] as IGroup[],
      dialog: false,
      edit: {} as IGroup | null,
    };
  },
  async created() {
    this.$api.group.getPaginated(1, 25)
      .then(response => this.groups = response.groups);
  },
  methods: {
    editGroups(group: IGroup) {
      this.edit = group
      this.dialog = true
    },
    close() {
      this.edit = null
      this.dialog = false
    },
    deleteGroups(group: IGroup) {
      this.$api.group.delete(group.id).then(() => {
        this.getGroups()
      })
    },
    getGroups() {
      this.$api.group.getPaginated(1, 20).then((response) => {
        this.groups = response.groups
      })
    }
  },
});
</script>
  