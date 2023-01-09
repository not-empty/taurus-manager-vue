<template>
  <div>
    <v-flex class="d-flex align-center px-4 py-4">
      <span class="font-weight-bold text-h6">Groups</span>
      <v-spacer />
      <v-btn text color="secondary" @click="dialog = true">
        <v-icon left>
          mdi-archive-plus
        </v-icon>
        <span>New group</span>
      </v-btn>
    </v-flex>
    <v-data-table
      hide-default-footer
      :headers="groupHeaders"
      :items="groups"
      sort-by="name"
      class="accent"
    >
      <template #[`item.actions`]="{ item }">
        <v-icon class="mr-4" @click="editGroups(item)">
          mdi-pencil
        </v-icon>
        <v-icon @click="deleteGroups(item)">
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
          @update:options="getGroups"
        />
      </template>
    </v-data-table>

    <v-dialog v-if="dialog" v-model="dialog" persistent max-width="600px">
      <GroupForm :group="edit" @close="close()" />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { IGroup } from '~/types/group';
import GroupForm from '~/components/groups/form.vue';
import { pagination } from '~/types/pagination';
export default Vue.extend({
  name: 'Groups',
  components: { GroupForm },
  middleware: 'auth',
  data () {
    return {
      groups: [] as IGroup[],
      groupHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'end',
          sortable: false
        }
      ],
      dialog: false,
      edit: {} as IGroup | null,
      page: 1,
      lenght: 1,
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
      ]
    };
  },
  watch: {
    page: function () {
      this.getGroups();
    },
    pageLenght: function () {
      this.getGroups();
    }
  },
  created () {
    this.$api.group
      .getPaginated(1, 25)
      .then(response => (this.groups = response.groups));
  },
  methods: {
    editGroups (group: IGroup) {
      this.edit = group;
      this.dialog = true;
    },
    close () {
      this.edit = null;
      this.dialog = false;
      this.getGroups();
    },
    deleteGroups (group: IGroup) {
      this.$api.group.delete(group.id).then(() => {
        this.getGroups();
      });
    },
    getGroups (pagination?: pagination) {
      if (typeof pagination !== 'undefined') {
        this.pagination = pagination;
      }
      this.$api.group
        .getPaginated(this.pagination.page, this.pagination.itemsPerPage)
        .then((response) => {
          this.groups = response.groups;
          this.pagination.itemsLength = response.total;
          const pages = response.total / this.pagination.itemsPerPage;
          this.pagination.pageCount = Math.ceil(pages);
        });
    }
  }
});
</script>
