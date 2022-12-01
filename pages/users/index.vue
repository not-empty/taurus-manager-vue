<template>
  <div>
    <v-data-table
      :headers="userHeaders"
      :items="users"
      sort-by="name"
      class="rounded my-4"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Users</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="newUser()">
            Novo Usuário
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon class="mr-4" @click="editUser(item)">mdi-pencil</v-icon>
        <v-icon @click="deleteUser(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>

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
      userHeaders: [
        {
          text: "Name",
          value: "name",
        },
        {
          text: "Email",
          value: "email",
        },
        {
          text: "Role",
          value: "role",
        },
        {
          text: "Actions",
          value: "actions",
          align: "end",
          sortable: false,
        },
      ],
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
    newUser() {
      this.edit = {
        id: "",
        name: "",
        email: "",
        role: ""
      }
      this.dialog = true;
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
  