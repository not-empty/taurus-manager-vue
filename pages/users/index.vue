<template>
  <div>
    <v-flex class="d-flex align-center px-4 py-4">
      <span class="font-weight-bold text-h6">Users</span>
      <v-spacer />
      <v-btn text color="secondary" @click="newUser">
        <v-icon left>
          mdi-account-multiple-plus
        </v-icon>
        <span>New user</span>
      </v-btn>
    </v-flex>
    <v-data-table
      hide-default-footer
      :headers="userHeaders"
      :items-per-page="pagination.itemsPerPage"
      :items="users"
      sort-by="name"
      class="accent"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon class="mr-4" @click="editUser(item)">
          mdi-pencil
        </v-icon>
        <v-icon @click="deleteUser(item)">
          mdi-delete
        </v-icon>
      </template>
      <template #footer>
        <v-data-footer
          :items-per-page-options="itemQuantities"
          :pagination="pagination"
          :options.sync="pagination"
          show-current-page
          :page-text="`Total pages: ${pagination.pageCount}`"
          @update:options="getUsers"
        />
      </template>
    </v-data-table>

    <v-dialog v-if="dialog" v-model="dialog" persistent max-width="600px">
      <UsersFrom :user="edit" @close="closeModal()" />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IUser } from '~/types/user';
import UsersFrom from '~/components/users/form.vue';
import { pagination } from '~/types/pagination';
export default Vue.extend({
  name: 'Users',
  components: {
    UsersFrom
  },
  middleware: 'auth',
  data () {
    return {
      users: [] as IUser[],
      pagination: {
        page: 1,
        itemsPerPage: 25,
        pageCount: 1,
        pageStart: 0,
        pageStop: 1,
        itemsLength: 1
      },
      itemQuantities: [
        25,
        50,
        100,
        1000
      ],
      userHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Email',
          value: 'email'
        },
        {
          text: 'Role',
          value: 'role'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'end',
          sortable: false
        }
      ],
      dialog: false,
      edit: {} as IUser | null
    };
  },
  created () {
    this.getUsers();
  },
  methods: {
    getUsers (pagination?: pagination) {
      if (typeof pagination !== 'undefined') {
        this.pagination = pagination;
      }
      this.$api.user
        .getPaginated(this.pagination.page, this.pagination.itemsPerPage)
        .then((response) => {
          this.users = response.users;
          this.pagination.itemsLength = response.total;
          const pages = response.total / this.pagination.itemsPerPage;
          this.pagination.pageCount = Math.ceil(pages);
        });
    },
    newUser () {
      this.edit = {
        id: '',
        name: '',
        email: '',
        role: '',
        password: '',
        groups: [],
        groupIds: []
      };
      this.dialog = true;
    },
    editUser (user: IUser) {
      this.edit = user;
      this.dialog = true;
    },
    deleteUser (user: IUser) {
      this.$api.user.deleteById(user.id).then(() => {
        this.getUsers();
      });
    },
    closeModal () {
      this.dialog = false;
      this.getUsers();
    }
  }
});
</script>
