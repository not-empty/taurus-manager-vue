<template>
  <div>
    <div class="d-flex justify-space-between">
      <h2 class="mb-4">User</h2>
      <v-btn color="primary" dark @click="dialog = true">
        Novo Usuário
      </v-btn>
    </div>
    <div>
      <v-row>
        <v-col sm="12" md="12" lg="12">
          <v-simple-table v-if="users">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Email</th>
                  <th class="text-left">Role</th>
                  <th class="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in users" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.email }}</td>
                  <td>{{ item.role }}</td>
                  <td>
                      <v-icon class="mr-4" @click="editUser(item)">mdi-pencil</v-icon>
                      <v-icon @click="deleteUser(item)">mdi-delete</v-icon>
                    </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </div>
    <v-dialog v-model="dialog" persistent max-width="600px" v-if="dialog">
      <UsersFrom @close="dialog = false" :user="edit"></UsersFrom>
    </v-dialog>
  </div>
</template>
  
<script lang="ts">
import Vue from "vue";
import { IUser } from "~/types/user";
import UsersFrom from "~/components/users/form.vue"
export default Vue.extend({
  middleware: "auth",
  name: "Users",
  components: {
    UsersFrom
  },
  data() {
    return {
      users: [] as IUser[],
      dialog: false,
      edit: {} as IUser | null
    };
  },
  created() {
    this.getUsers()
  },
  methods: {
    getUsers() {
      this.$api.user.getPaginated(1, 25)
      .then(response => this.users = response.users);
    },
    editUser(user: IUser) {
      this.edit = user
      this.dialog = true
    },
    deleteUser(user: IUser) {
      this.$api.user.deleteById(user.id).then(() => {
        this.getUsers()
      })
    },
  },
});
</script>
  